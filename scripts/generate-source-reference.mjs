import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT_ROOT = path.join(REPO_ROOT, "docs", "src", "content", "docs", "source-code");

const packageRoots = [...(await getWorkspaceDirectories("apps")), ...(await getWorkspaceDirectories("packages"))];

const packageRecords = [];

for (const packageRoot of packageRoots) {
  const manifestPath = path.join(packageRoot, ".tsdoc", "manifest.json");
  const symbolsPath = path.join(packageRoot, ".tsdoc", "symbols.json");
  if (!existsSync(manifestPath) || !existsSync(symbolsPath)) {
    continue;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const rawDoclets = JSON.parse(await readFile(symbolsPath, "utf8"));

  const files = manifest.files.map((file) => ({
    ...file,
    doclets: normalizeDoclets(
      rawDoclets.filter((doclet) => matchesFile(doclet, file.sourceRelativePath)),
      file
    ),
    pagePath: `${stripExtension(file.sourceRelativePath)}.md`,
    routePath: toRoutePath(`${manifest.packageSlug}/${stripExtension(file.sourceRelativePath)}`),
    slug: `${manifest.packageSlug}/${stripExtension(file.sourceRelativePath)}`,
  }));

  if (files.length === 0) {
    continue;
  }

  packageRecords.push({
    fileCount: files.length,
    files,
    packageName: manifest.packageName,
    packageSlug: manifest.packageSlug,
  });
}

packageRecords.sort((left, right) => left.packageSlug.localeCompare(right.packageSlug));

await rm(OUTPUT_ROOT, { force: true, recursive: true });
await mkdir(OUTPUT_ROOT, { recursive: true });

await writeFile(path.join(OUTPUT_ROOT, "index.md"), buildIndexPage(packageRecords), "utf8");

for (const packageRecord of packageRecords) {
  for (const fileRecord of packageRecord.files) {
    const outputFilePath = path.join(OUTPUT_ROOT, packageRecord.packageSlug, fileRecord.pagePath);
    await mkdir(path.dirname(outputFilePath), { recursive: true });
    await writeFile(outputFilePath, buildFilePage(packageRecord, fileRecord), "utf8");
  }
}

async function getWorkspaceDirectories(parentDirectory) {
  const absoluteParent = path.join(REPO_ROOT, parentDirectory);
  if (!existsSync(absoluteParent)) {
    return [];
  }

  const entries = await readdir(absoluteParent, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(absoluteParent, entry.name))
    .filter((directory) => existsSync(path.join(directory, "package.json")));
}

function matchesFile(doclet, emittedRelativePath) {
  return doclet.meta?.sourceRelativePath === emittedRelativePath;
}

function normalizeDoclets(doclets, file) {
  return doclets
    .filter((doclet) => doclet.kind && doclet.kind !== "package")
    .map((doclet) => ({
      ...doclet,
      meta: {
        ...doclet.meta,
        filename: path.basename(file.sourceRelativePath),
        path: toPosixPath(path.dirname(file.sourcePath)),
      },
    }))
    .sort((left, right) => {
      const leftLine = left.meta?.lineno ?? Number.MAX_SAFE_INTEGER;
      const rightLine = right.meta?.lineno ?? Number.MAX_SAFE_INTEGER;
      if (leftLine !== rightLine) {
        return leftLine - rightLine;
      }
      return (left.longname ?? left.name ?? "").localeCompare(right.longname ?? right.name ?? "");
    });
}

function buildIndexPage(packageRecords) {
  const totalFiles = packageRecords.reduce((sum, packageRecord) => sum + packageRecord.fileCount, 0);

  const packageSections = packageRecords
    .map((packageRecord) => {
      const fileLinks = packageRecord.files
        .map(
          (fileRecord) =>
            `- [\`${packageRecord.packageSlug}/${stripExtension(fileRecord.sourceRelativePath)}\`](${toSourceCodeHref(fileRecord.routePath)})`
        )
        .join("\n");

      return `## ${packageRecord.packageSlug}

- Workspace package: \`${packageRecord.packageName}\`
- Source files: ${packageRecord.fileCount}

${fileLinks}`;
    })
    .join("\n\n");

  return `---
title: Source Code
description: Auto-generated source code reference for workspace packages.
---

> This reference is auto-generated from package source files via TSDoc. Do not edit these pages manually.

# Source Code Reference

This section mirrors the workspace source tree as \`<package>/<source_file>\`.

- Packages documented: ${packageRecords.length}
- Source files documented: ${totalFiles}

## Packages

${packageSections}
`;
}

function buildFilePage(packageRecord, fileRecord) {
  const title = `${packageRecord.packageSlug}/${stripExtension(fileRecord.sourceRelativePath)}`;
  const summary = selectSummary(fileRecord.doclets);
  const groupedDoclets = groupDoclets(fileRecord.doclets);
  const groupSections = groupedDoclets.length
    ? groupedDoclets
        .map(
          ([groupName, doclets]) =>
            `## ${groupName}

${doclets.map((doclet) => renderDoclet(doclet)).join("\n\n")}`
        )
        .join("\n\n")
    : "## API Surface\n\nNo TSDoc symbols were emitted for this file.";

  const siblingLinks = packageRecord.files
    .map((siblingRecord) => {
      const siblingTitle = `${packageRecord.packageSlug}/${stripExtension(siblingRecord.sourceRelativePath)}`;
      if (siblingRecord.slug === fileRecord.slug) {
        return `- \`${siblingTitle}\``;
      }
      return `- [\`${siblingTitle}\`](${toSourceCodeHref(siblingRecord.routePath)})`;
    })
    .join("\n");

  return `---
title: ${title}
description: Auto-generated source code reference for ${fileRecord.sourcePath}.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# \`${title}\`

- Package: \`${packageRecord.packageName}\`
- Source file: \`${fileRecord.sourcePath}\`

## Summary

${summary}

${groupSections}

## In ${packageRecord.packageSlug}

${siblingLinks}
`;
}

function selectSummary(doclets) {
  const summaryDoclet = doclets.find(
    (doclet) => typeof doclet.description === "string" && doclet.description.trim().length > 0
  );
  return summaryDoclet ? sanitizeMarkdown(summaryDoclet.description.trim()) : "No summary is available for this file.";
}

function groupDoclets(doclets) {
  const orderedGroups = [
    ["Classes", ["class"]],
    ["Functions", ["function"]],
    ["Interfaces", ["interface"]],
    ["Types", ["typedef", "type"]],
    ["Enums", ["enum"]],
    ["Constants", ["constant"]],
    ["Members", ["member"]],
  ];

  return orderedGroups
    .map(([label, kinds]) => [label, doclets.filter((doclet) => kinds.includes(doclet.kind))])
    .filter(([, doclets]) => doclets.length > 0);
}

function renderDoclet(doclet) {
  const lines = [`### ${doclet.name ?? doclet.longname ?? "Anonymous symbol"}`];
  const signature = buildSignature(doclet);
  if (signature) {
    lines.push("```ts", signature, "```");
  }

  if (doclet.description) {
    lines.push(sanitizeMarkdown(doclet.description.trim()));
  }
  if (doclet.remarks) {
    lines.push(doclet.remarks);
  }

  const details = [];
  if (doclet.params?.length) {
    details.push("**Parameters**");
    for (const parameter of doclet.params) {
      const parameterType = formatType(parameter.type);
      const parameterDescription = parameter.description ? `: ${sanitizeMarkdown(parameter.description.trim())}` : "";
      details.push(`- \`${parameter.name}\`${parameterType ? ` (${parameterType})` : ""}${parameterDescription}`);
    }
  }

  if (doclet.returns?.length) {
    details.push("**Returns**");
    for (const returnValue of doclet.returns) {
      const returnType = formatType(returnValue.type);
      const returnDescription = returnValue.description ? `: ${sanitizeMarkdown(returnValue.description.trim())}` : "";
      details.push(`- ${returnType ? `\`${returnType}\`` : "`unknown`"}${returnDescription}`);
    }
  }

  if (doclet.augments?.length) {
    details.push(`**Extends**: \`${doclet.augments.join(", ")}\``);
  }
  if (doclet.properties?.length) {
    details.push("**Properties**");
    for (const property of doclet.properties) {
      details.push(
        `- \`${property.name}\`${property.type ? ` (${property.type})` : ""}${property.description ? `: ${sanitizeMarkdown(property.description)}` : ""}`
      );
    }
  }
  if (doclet.methods?.length) {
    details.push("**Methods**");
    for (const method of doclet.methods) {
      details.push(
        `- \`${method.signature ?? method.name}\`${method.description ? `: ${sanitizeMarkdown(method.description)}` : ""}`
      );
    }
  }
  if (doclet.examples?.length) {
    details.push("**Examples**");
    for (const example of doclet.examples) {
      details.push(example);
    }
  }

  if (doclet.meta?.lineno) {
    details.push(`**Defined at**: line ${doclet.meta.lineno}`);
  }

  if (details.length > 0) {
    lines.push(details.join("\n"));
  }

  return lines.join("\n\n");
}

function buildSignature(doclet) {
  const symbolName = doclet.name ?? doclet.longname ?? "anonymous";
  switch (doclet.kind) {
    case "class":
      return `class ${symbolName}${doclet.augments?.length ? ` extends ${doclet.augments[0]}` : ""}`;
    case "function": {
      const parameters = (doclet.params ?? [])
        .map((parameter) => {
          const parameterType = formatType(parameter.type);
          return `${parameter.name}${parameterType ? `: ${parameterType}` : ""}`;
        })
        .join(", ");
      const returnType = doclet.returns?.[0] ? (formatType(doclet.returns[0].type) ?? "void") : "void";
      return `function ${symbolName}(${parameters}): ${returnType}`;
    }
    case "typedef":
    case "type":
      return `type ${symbolName} = ${formatType(doclet.type) ?? "unknown"}`;
    case "interface":
      return doclet.signature ?? `interface ${symbolName}`;
    case "enum":
      return doclet.signature ?? `enum ${symbolName}`;
    case "constant":
      return doclet.signature ?? `const ${symbolName}: ${formatType(doclet.type) ?? "unknown"}`;
    case "member":
      return doclet.signature ?? `${symbolName}: ${formatType(doclet.type) ?? "unknown"}`;
    default:
      return "";
  }
}

function formatType(typeInformation) {
  if (typeof typeInformation === "string") {
    return typeInformation;
  }
  const names = typeInformation?.names;
  return Array.isArray(names) && names.length > 0 ? names.join(" | ") : null;
}

function sanitizeMarkdown(value) {
  return value.replace(/\r\n/g, "\n");
}

function stripExtension(filePath) {
  const extension = path.extname(filePath);
  return extension.length > 0 ? filePath.slice(0, -extension.length) : filePath;
}

function toRoutePath(filePath) {
  const normalizedPath = toPosixPath(filePath);
  if (normalizedPath === "index") {
    return ".";
  }
  return normalizedPath.replace(/\/index$/, "");
}

function toSourceCodeHref(routePath) {
  return routePath === "." ? "/source-code" : `/source-code/${routePath}`;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}
