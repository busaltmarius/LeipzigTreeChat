import { resolve } from "node:path";
import { DEMO_BENCHMARK_FIXTURES } from "./fixtures.js";
import { writeBenchmarkArtifacts } from "./report.js";
import { runBenchmarkSuite } from "./runner.js";

const parseOutputDir = (): string => {
	const outputDirFlagIndex = process.argv.findIndex((arg) => arg === "--output-dir");

	if (outputDirFlagIndex >= 0) {
		const nextArgument = process.argv[outputDirFlagIndex + 1];

		if (nextArgument) {
			return resolve(nextArgument);
		}
	}

	return resolve(import.meta.dir, "../../benchmark-results");
};

const main = async () => {
	const outputDir = parseOutputDir();
	const runResult = await runBenchmarkSuite(DEMO_BENCHMARK_FIXTURES);
	const paths = await writeBenchmarkArtifacts(runResult, outputDir);
	const passedCases = runResult.cases.filter(
		(result) => result.evaluation.status === "pass"
	).length;

	console.info(`Benchmark finished: ${passedCases}/${runResult.cases.length} cases passed.`);
	console.info(`JSON report: ${paths.jsonPath}`);
	console.info(`Markdown report: ${paths.markdownPath}`);
	console.info(`Latest JSON: ${paths.latestJsonPath}`);
	console.info(`Latest Markdown: ${paths.latestMarkdownPath}`);
};

void main().catch((error: unknown) => {
	console.error("Failed to run chatbot demo benchmark.", error);
	process.exitCode = 1;
});
