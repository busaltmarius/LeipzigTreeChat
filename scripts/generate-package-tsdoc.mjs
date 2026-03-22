import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DocNodeKind, TSDocParser } from "@microsoft/tsdoc";
import ts from "typescript";

const ELIGIBLE_EXTENSIONS = new Set([
	".cjs",
	".cts",
	".js",
	".jsx",
	".mjs",
	".mts",
	".ts",
	".tsx",
]);

const GENERATED_QANARY_API_DIRS = new Set([
	"action-server",
	"lupo-cloud",
	"qanary-component",
	"qanary-pipeline",
	"spring-boot-admin-server",
]);

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const TSDOC_DIR = path.join(PACKAGE_ROOT, ".tsdoc");
const MANIFEST_PATH = path.join(TSDOC_DIR, "manifest.json");
const SYMBOLS_PATH = path.join(TSDOC_DIR, "symbols.json");

const packageJson = JSON.parse(
	await readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
);
const packageName = packageJson.name;
const packageSlug = packageName.startsWith("@")
	? packageName.split("/").at(-1)
	: packageName;
const tsdocParser = new TSDocParser();

await rm(TSDOC_DIR, { force: true, recursive: true });
await mkdir(TSDOC_DIR, { recursive: true });

const sourceRoot = path.join(PACKAGE_ROOT, "src");
const sourceFiles = existsSync(sourceRoot)
	? await collectSourceFiles(sourceRoot)
	: [];
const manifestFiles = [];
const symbols = [];

for (const sourceFilePath of sourceFiles) {
	const sourceRelativePath = toPosixPath(path.relative(sourceRoot, sourceFilePath));
	if (!shouldIncludeFile(sourceRelativePath, packageName)) {
		continue;
	}

	const sourceText = await readFile(sourceFilePath, "utf8");
	const sourceFile = ts.createSourceFile(
		sourceFilePath,
		sourceText,
		ts.ScriptTarget.Latest,
		true,
		getScriptKind(sourceFilePath),
	);

	manifestFiles.push({
		sourcePath: toPosixPath(path.relative(REPO_ROOT, sourceFilePath)),
		sourceRelativePath,
	});

	symbols.push(
		...collectSymbols({
			sourceFile,
			sourcePath: sourceFilePath,
			sourceRelativePath,
			sourceText,
		}),
	);
}

await writeFile(
	MANIFEST_PATH,
	JSON.stringify(
		{
			fileCount: manifestFiles.length,
			files: manifestFiles,
			packageName,
			packageSlug,
			sourceRoot: "src",
		},
		null,
		"\t",
	),
	"utf8",
);
await writeFile(SYMBOLS_PATH, JSON.stringify(symbols, null, "\t"), "utf8");

async function collectSourceFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectSourceFiles(entryPath)));
			continue;
		}
		if (!ELIGIBLE_EXTENSIONS.has(path.extname(entry.name))) {
			continue;
		}
		if (entry.name.endsWith(".d.ts")) {
			continue;
		}
		files.push(entryPath);
	}

	return files.sort();
}

function shouldIncludeFile(sourceRelativePath, currentPackageName) {
	const segments = sourceRelativePath.split("/");
	const baseName = path.basename(sourceRelativePath);

	if (segments.includes("__test__") || segments.includes("__tests__")) {
		return false;
	}
	if (baseName.includes(".spec.") || baseName.includes(".test.")) {
		return false;
	}
	if (
		currentPackageName === "@leipzigtreechat/qanary-api" &&
		GENERATED_QANARY_API_DIRS.has(segments[0] ?? "")
	) {
		return false;
	}

	return true;
}

function collectSymbols({ sourceFile, sourcePath, sourceRelativePath, sourceText }) {
	const collectedSymbols = [];

	for (const statement of sourceFile.statements) {
		collectedSymbols.push(
			...extractSymbolsFromStatement({
				sourceFile,
				sourcePath,
				sourceRelativePath,
				sourceText,
				statement,
			}),
		);
	}

	return collectedSymbols;
}

function extractSymbolsFromStatement(context) {
	const { sourceFile, statement } = context;
	const exported = hasExportModifier(statement);

	if (ts.isFunctionDeclaration(statement)) {
		const docComment = getParsedDocComment(statement, sourceFile, context.sourceText);
		if (!docComment && !exported) {
			return [];
		}
		return [
			createSymbolRecord({
				context,
				node: statement,
				docComment,
				kind: "function",
				name: statement.name?.text ?? "default",
				params: statement.parameters.map((parameter) => ({
					description:
						docComment?.params.find(
							(docParam) => docParam.name === parameter.name.getText(sourceFile),
						)?.description ?? "",
					name: parameter.name.getText(sourceFile),
					type: parameter.type?.getText(sourceFile) ?? "unknown",
				})),
				returns: statement.type
					? [
							{
								description: docComment?.returns ?? "",
								type: statement.type.getText(sourceFile),
							},
						]
					: [],
				signature: renderFunctionSignature(statement, sourceFile),
			}),
		];
	}

	if (ts.isClassDeclaration(statement)) {
		const docComment = getParsedDocComment(statement, sourceFile, context.sourceText);
		if (!docComment && !exported) {
			return [];
		}
		return [
			createSymbolRecord({
				context,
				node: statement,
				docComment,
				kind: "class",
				name: statement.name?.text ?? "default",
				properties: collectClassProperties(statement, sourceFile, context.sourceText),
				methods: collectClassMethods(statement, sourceFile, context.sourceText),
				signature: renderClassSignature(statement, sourceFile),
				augments: statement.heritageClauses
					?.filter((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
					.flatMap((clause) =>
						clause.types.map((typeNode) => typeNode.getText(sourceFile)),
					) ?? [],
			}),
		];
	}

	if (ts.isInterfaceDeclaration(statement)) {
		const docComment = getParsedDocComment(statement, sourceFile, context.sourceText);
		if (!docComment && !exported) {
			return [];
		}
		return [
			createSymbolRecord({
				context,
				node: statement,
				docComment,
				kind: "interface",
				name: statement.name.text,
				properties: collectInterfaceProperties(
					statement,
					sourceFile,
					context.sourceText,
				),
				methods: collectInterfaceMethods(statement, sourceFile, context.sourceText),
				signature: renderInterfaceSignature(statement, sourceFile),
			}),
		];
	}

	if (ts.isTypeAliasDeclaration(statement)) {
		const docComment = getParsedDocComment(statement, sourceFile, context.sourceText);
		if (!docComment && !exported) {
			return [];
		}
		return [
			createSymbolRecord({
				context,
				node: statement,
				docComment,
				kind: "typedef",
				name: statement.name.text,
				signature: `type ${statement.name.text} = ${statement.type.getText(sourceFile)}`,
				type: statement.type.getText(sourceFile),
			}),
		];
	}

	if (ts.isEnumDeclaration(statement)) {
		const docComment = getParsedDocComment(statement, sourceFile, context.sourceText);
		if (!docComment && !exported) {
			return [];
		}
		return [
			createSymbolRecord({
				context,
				node: statement,
				docComment,
				kind: "enum",
				name: statement.name.text,
				properties: statement.members.map((member) => ({
					description:
						getParsedDocComment(member, sourceFile, context.sourceText)?.summary ?? "",
					name: member.name.getText(sourceFile),
					type: "enum-member",
				})),
				signature: `enum ${statement.name.text}`,
			}),
		];
	}

	if (ts.isVariableStatement(statement)) {
		const docComment = getParsedDocComment(statement, sourceFile, context.sourceText);
		if (!docComment && !exported) {
			return [];
		}
		return statement.declarationList.declarations.map((declaration) => {
			const functionInitializer =
				declaration.initializer &&
				(ts.isArrowFunction(declaration.initializer) ||
					ts.isFunctionExpression(declaration.initializer))
					? declaration.initializer
					: null;

			if (functionInitializer) {
				return createSymbolRecord({
					context,
					node: declaration,
					docComment,
					kind: "function",
					name: declaration.name.getText(sourceFile),
					params: functionInitializer.parameters.map((parameter) => ({
						description:
							docComment?.params.find(
								(docParam) =>
									docParam.name === parameter.name.getText(sourceFile),
							)?.description ?? "",
						name: parameter.name.getText(sourceFile),
						type: parameter.type?.getText(sourceFile) ?? "unknown",
					})),
					returns: functionInitializer.type
						? [
								{
									description: docComment?.returns ?? "",
									type: functionInitializer.type.getText(sourceFile),
								},
							]
						: [],
					signature: renderVariableFunctionSignature(
						declaration.name.getText(sourceFile),
						functionInitializer,
						sourceFile,
					),
				});
			}

			return createSymbolRecord({
				context,
				node: declaration,
				docComment,
				kind:
					(statement.declarationList.flags & ts.NodeFlags.Const) !== 0
						? "constant"
						: "member",
				name: declaration.name.getText(sourceFile),
				signature: renderVariableSignature(
					declaration,
					sourceFile,
					(statement.declarationList.flags & ts.NodeFlags.Const) !== 0
						? "const"
						: "let",
				),
				type: declaration.type?.getText(sourceFile) ?? inferInitializerType(declaration),
			});
		});
	}

	if (
		ts.isExportDeclaration(statement) &&
		statement.exportClause &&
		ts.isNamedExports(statement.exportClause)
	) {
		return statement.exportClause.elements.map((element) =>
			createSymbolRecord({
				context,
				node: element,
				docComment: {
					examples: [],
					params: [],
					remarks: "",
					returns: "",
					summary: statement.moduleSpecifier
						? `Re-exported from ${statement.moduleSpecifier.getText(sourceFile)}.`
						: "Re-exported symbol.",
				},
				kind: "member",
				name: element.name.text,
				signature: `export { ${element.getText(sourceFile)} }`,
			}),
		);
	}

	if (ts.isExportAssignment(statement)) {
		return [
			createSymbolRecord({
				context,
				node: statement,
				docComment: {
					examples: [],
					params: [],
					remarks: "",
					returns: "",
					summary: "Default export assignment.",
				},
				kind: "member",
				name: "default",
				signature: `export default ${statement.expression.getText(sourceFile)}`,
			}),
		];
	}

	return [];
}

function createSymbolRecord({
	context,
	node,
	docComment,
	kind,
	name,
	signature,
	params = [],
	returns = [],
	type = "",
	properties = [],
	methods = [],
	augments = [],
}) {
	const lineAndCharacter = context.sourceFile.getLineAndCharacterOfPosition(
		node.getStart(context.sourceFile),
	);

	return {
		augments,
		description: docComment?.summary ?? "",
		examples: docComment?.examples ?? [],
		kind,
		meta: {
			filename: path.basename(context.sourceRelativePath),
			lineno: lineAndCharacter.line + 1,
			path: toPosixPath(path.dirname(context.sourcePath)),
			sourceRelativePath: context.sourceRelativePath,
		},
		methods,
		name,
		params,
		properties,
		remarks: docComment?.remarks ?? "",
		returns,
		signature,
		type,
	};
}

function collectClassProperties(node, sourceFile, sourceText) {
	return node.members
		.filter((member) => ts.isPropertyDeclaration(member))
		.map((member) => ({
			description:
				getParsedDocComment(member, sourceFile, sourceText)?.summary ?? "",
			name: member.name.getText(sourceFile),
			type: member.type?.getText(sourceFile) ?? inferInitializerType(member),
		}));
}

function collectClassMethods(node, sourceFile, sourceText) {
	return node.members
		.filter(
			(member) => ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member),
		)
		.map((member) => {
			if (ts.isConstructorDeclaration(member)) {
				return {
					description:
						getParsedDocComment(member, sourceFile, sourceText)?.summary ?? "",
					name: "constructor",
					signature: renderConstructorSignature(member, sourceFile),
				};
			}
			return {
				description:
					getParsedDocComment(member, sourceFile, sourceText)?.summary ?? "",
				name: member.name.getText(sourceFile),
				signature: renderMethodSignature(member, sourceFile),
			};
		});
}

function collectInterfaceProperties(node, sourceFile, sourceText) {
	return node.members
		.filter((member) => ts.isPropertySignature(member))
		.map((member) => ({
			description:
				getParsedDocComment(member, sourceFile, sourceText)?.summary ?? "",
			name: member.name.getText(sourceFile),
			type: member.type?.getText(sourceFile) ?? "unknown",
		}));
}

function collectInterfaceMethods(node, sourceFile, sourceText) {
	return node.members
		.filter((member) => ts.isMethodSignature(member))
		.map((member) => ({
			description:
				getParsedDocComment(member, sourceFile, sourceText)?.summary ?? "",
			name: member.name.getText(sourceFile),
			signature: renderMethodSignature(member, sourceFile),
		}));
}

function renderFunctionSignature(node, sourceFile) {
	const parameters = node.parameters
		.map((parameter) => renderParameter(parameter, sourceFile))
		.join(", ");
	const returnType = node.type?.getText(sourceFile) ?? "void";
	return `function ${node.name?.text ?? "default"}(${parameters}): ${returnType}`;
}

function renderVariableFunctionSignature(name, node, sourceFile) {
	const parameters = node.parameters
		.map((parameter) => renderParameter(parameter, sourceFile))
		.join(", ");
	const returnType = node.type?.getText(sourceFile) ?? "void";
	return `function ${name}(${parameters}): ${returnType}`;
}

function renderMethodSignature(node, sourceFile) {
	const parameters = node.parameters
		.map((parameter) => renderParameter(parameter, sourceFile))
		.join(", ");
	const returnType = node.type?.getText(sourceFile) ?? "void";
	return `${node.name.getText(sourceFile)}(${parameters}): ${returnType}`;
}

function renderConstructorSignature(node, sourceFile) {
	return `constructor(${node.parameters
		.map((parameter) => renderParameter(parameter, sourceFile))
		.join(", ")})`;
}

function renderClassSignature(node, sourceFile) {
	const extendsText = node.heritageClauses
		?.filter((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
		.flatMap((clause) => clause.types.map((typeNode) => typeNode.getText(sourceFile)))
		.join(", ");
	return `class ${node.name?.text ?? "default"}${extendsText ? ` extends ${extendsText}` : ""}`;
}

function renderInterfaceSignature(node, sourceFile) {
	const typeParameters = node.typeParameters?.length
		? `<${node.typeParameters.map((typeParameter) => typeParameter.getText(sourceFile)).join(", ")}>`
		: "";
	return `interface ${node.name.text}${typeParameters}`;
}

function renderVariableSignature(node, sourceFile, keyword) {
	const variableType = node.type?.getText(sourceFile) ?? inferInitializerType(node);
	return `${keyword} ${node.name.getText(sourceFile)}${variableType ? `: ${variableType}` : ""}`;
}

function renderParameter(parameter, sourceFile) {
	return `${parameter.name.getText(sourceFile)}${parameter.type ? `: ${parameter.type.getText(sourceFile)}` : ""}`;
}

function inferInitializerType(node) {
	if (!node.initializer) {
		return "unknown";
	}
	switch (node.initializer.kind) {
		case ts.SyntaxKind.StringLiteral:
			return "string";
		case ts.SyntaxKind.NumericLiteral:
			return "number";
		case ts.SyntaxKind.TrueKeyword:
		case ts.SyntaxKind.FalseKeyword:
			return "boolean";
		case ts.SyntaxKind.ArrayLiteralExpression:
			return "array";
		case ts.SyntaxKind.ObjectLiteralExpression:
			return "object";
		default:
			return "unknown";
	}
}

function getParsedDocComment(node, sourceFile, sourceText) {
	const rawComment = getRawDocComment(node, sourceFile, sourceText);
	if (!rawComment) {
		return null;
	}

	const parserContext = tsdocParser.parseString(rawComment);
	const docComment = parserContext.docComment;

	return {
		examples: docComment.customBlocks
			.filter((block) => block.blockTag.tagName === "@example")
			.map((block) => normalizeMarkdown(renderDocNodes(block.content.getChildNodes()))),
		params: docComment.params.blocks.map((paramBlock) => ({
			description: normalizeMarkdown(
				renderDocNodes(paramBlock.content.getChildNodes()),
			),
			name: paramBlock.parameterName,
		})),
		remarks: docComment.remarksBlock
			? normalizeMarkdown(renderDocNodes(docComment.remarksBlock.content.getChildNodes()))
			: "",
		returns: docComment.returnsBlock
			? normalizeMarkdown(renderDocNodes(docComment.returnsBlock.content.getChildNodes()))
			: "",
		summary: normalizeMarkdown(renderDocNodes(docComment.summarySection.getChildNodes())),
	};
}

function getRawDocComment(node, sourceFile, sourceText) {
	const jsDocNodes = node.jsDoc;
	if (!Array.isArray(jsDocNodes) || jsDocNodes.length === 0) {
		return "";
	}

	const lastDocNode = jsDocNodes[jsDocNodes.length - 1];
	return sourceText.slice(lastDocNode.pos, lastDocNode.end).trim();
}

function renderDocNodes(nodes) {
	return nodes.map((node) => renderDocNode(node)).join("");
}

function renderDocNode(node) {
	switch (node.kind) {
		case DocNodeKind.CodeSpan:
			return `\`${node.code}\``;
		case DocNodeKind.FencedCode: {
			const language = node.language ? node.language : "";
			return `\n\`\`\`${language}\n${node.code}\n\`\`\`\n`;
		}
		case DocNodeKind.LinkTag:
			if (node.linkText) {
				if (node.urlDestination) {
					return `[${node.linkText}](${node.urlDestination})`;
				}
				return node.linkText;
			}
			if (node.urlDestination) {
				return node.urlDestination;
			}
			return renderDocNodes(node.getChildNodes());
		case DocNodeKind.PlainText:
			return node.text;
		case DocNodeKind.SoftBreak:
			return "\n";
		case DocNodeKind.EscapedText:
			return node.decodedText;
		case DocNodeKind.Block:
			return renderDocNodes(node.content.getChildNodes());
		default:
			return renderDocNodes(node.getChildNodes());
	}
}

function normalizeMarkdown(value) {
	return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function hasExportModifier(node) {
	if (!ts.canHaveModifiers(node)) {
		return false;
	}
	return (
		ts
			.getModifiers(node)
			?.some(
				(modifier) =>
					modifier.kind === ts.SyntaxKind.ExportKeyword ||
					modifier.kind === ts.SyntaxKind.DefaultKeyword,
			) ?? false
	);
}

function getScriptKind(filePath) {
	switch (path.extname(filePath)) {
		case ".js":
			return ts.ScriptKind.JS;
		case ".jsx":
			return ts.ScriptKind.JSX;
		case ".mjs":
			return ts.ScriptKind.JS;
		case ".cjs":
			return ts.ScriptKind.JS;
		case ".tsx":
			return ts.ScriptKind.TSX;
		default:
			return ts.ScriptKind.TS;
	}
}

function toPosixPath(filePath) {
	return filePath.split(path.sep).join("/");
}
