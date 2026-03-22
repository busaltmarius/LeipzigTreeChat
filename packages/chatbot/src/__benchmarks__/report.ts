import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
	BenchmarkCaseResult,
	BenchmarkFixture,
	BenchmarkRunResult,
	BenchmarkStatus,
} from "./types.js";

const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`;

const median = (values: number[]): number => {
	if (values.length === 0) {
		return 0;
	}

	const sorted = [...values].sort((left, right) => left - right);
	const middle = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 0) {
		return Math.round((sorted[middle - 1]! + sorted[middle]!) / 2);
	}

	return sorted[middle] ?? 0;
};

const filterByStatus = (
	results: BenchmarkCaseResult[],
	status: BenchmarkStatus
): BenchmarkCaseResult[] =>
	results.filter((result) => result.evaluation.status === status);

const hasGracefulFailureExpectations = (fixture: BenchmarkFixture): boolean =>
	fixture.requiredSignals.some((signal) => signal.axis === "graceful_failure") ||
	fixture.forbiddenSignals.some((signal) => signal.axis === "graceful_failure");

const buildRecommendationSet = (results: BenchmarkCaseResult[]): BenchmarkCaseResult[] => {
	return [...results]
		.sort((left, right) => {
			if (left.evaluation.status !== right.evaluation.status) {
				const order = ["pass", "soft-fail", "fail"];
				return (
					order.indexOf(left.evaluation.status) -
					order.indexOf(right.evaluation.status)
				);
			}

			if (left.evaluation.score !== right.evaluation.score) {
				return right.evaluation.score - left.evaluation.score;
			}

			return left.totalDurationMs - right.totalDurationMs;
		})
		.slice(0, 6);
};

const buildCaseLine = (result: BenchmarkCaseResult): string => {
	return `- \`${result.fixture.id}\` ${result.fixture.title} (${result.evaluation.status}, ${formatPercent(result.evaluation.score)}, ${result.totalDurationMs} ms)`;
};

const buildTranscript = (result: BenchmarkCaseResult): string => {
	return result.transcript
		.map((entry) => `**${entry.role === "assistant" ? "Chatbot" : "Nutzer"}:** ${entry.content}`)
		.join("\n\n");
};

export const renderBenchmarkMarkdown = (runResult: BenchmarkRunResult): string => {
	const passed = filterByStatus(runResult.cases, "pass");
	const softFailed = filterByStatus(runResult.cases, "soft-fail");
	const failed = filterByStatus(runResult.cases, "fail");
	const clarificationCases = runResult.cases.filter(
		(result) => result.fixture.expectedFlow.clarification === "required"
	);
	const gracefulFailureCases = runResult.cases.filter((result) =>
		hasGracefulFailureExpectations(result.fixture)
	);
	const clarificationSuccessRate =
		clarificationCases.length === 0
			? 1
			: clarificationCases.filter(
					(result) =>
						result.evaluation.axes.find(
							(axis) => axis.axis === "flow_correctness"
						)?.passed
				).length / clarificationCases.length;
	const gracefulFailureSuccessRate =
		gracefulFailureCases.length === 0
			? 1
			: gracefulFailureCases.filter(
					(result) =>
						result.evaluation.axes.find(
							(axis) => axis.axis === "graceful_failure"
						)?.passed
				).length / gracefulFailureCases.length;
	const recommended = buildRecommendationSet(runResult.cases);

	return [
		"# Baumbart Demo Benchmark",
		"",
		`Run started: ${runResult.startedAt}`,
		`Run finished: ${runResult.finishedAt}`,
		"",
		"## Overview",
		"",
		`- Total cases: ${runResult.cases.length}`,
		`- Pass rate: ${formatPercent(passed.length / Math.max(runResult.cases.length, 1))}`,
		`- Clarification success rate: ${formatPercent(clarificationSuccessRate)}`,
		`- Graceful-failure success rate: ${formatPercent(gracefulFailureSuccessRate)}`,
		`- Median case duration: ${median(runResult.cases.map((result) => result.totalDurationMs))} ms`,
		"",
		"## Recommended Demo Subset",
		"",
		...recommended.map(buildCaseLine),
		"",
		"## Passed Cases",
		"",
		...(passed.length > 0 ? passed.map(buildCaseLine) : ["- None"]),
		"",
		"## Soft-Failed Cases",
		"",
		...(softFailed.length > 0
			? softFailed.map((result) => {
					const reason = result.evaluation.failureReason ?? "No failure reason recorded.";
					return `${buildCaseLine(result)}\n  Reason: ${reason}`;
				})
			: ["- None"]),
		"",
		"## Failed Cases",
		"",
		...(failed.length > 0
			? failed.map((result) => {
					const reason = result.evaluation.failureReason ?? "No failure reason recorded.";
					return `${buildCaseLine(result)}\n  Reason: ${reason}`;
				})
			: ["- None"]),
		"",
		"## Dialogue Transcripts",
		"",
		...runResult.cases
			.filter((result) => result.fixture.kind === "dialogue")
			.flatMap((result) => [
				`### ${result.fixture.id}: ${result.fixture.title}`,
				"",
				`Status: ${result.evaluation.status} (${formatPercent(result.evaluation.score)})`,
				"",
				buildTranscript(result),
				"",
			]),
	].join("\n");
};

export const writeBenchmarkArtifacts = async (
	runResult: BenchmarkRunResult,
	outputDir: string
): Promise<{
	jsonPath: string;
	markdownPath: string;
	latestJsonPath: string;
	latestMarkdownPath: string;
}> => {
	const safeTimestamp = runResult.finishedAt.replaceAll(":", "-");
	const resolvedOutputDir = resolve(outputDir);
	const jsonPath = resolve(
		resolvedOutputDir,
		`demo-benchmark-${safeTimestamp}.json`
	);
	const markdownPath = resolve(
		resolvedOutputDir,
		`demo-benchmark-${safeTimestamp}.md`
	);
	const latestJsonPath = resolve(resolvedOutputDir, "latest.json");
	const latestMarkdownPath = resolve(resolvedOutputDir, "latest.md");
	const markdown = renderBenchmarkMarkdown(runResult);

	await mkdir(dirname(jsonPath), { recursive: true });
	await writeFile(jsonPath, JSON.stringify(runResult, null, 2), "utf8");
	await writeFile(markdownPath, markdown, "utf8");
	await writeFile(latestJsonPath, JSON.stringify(runResult, null, 2), "utf8");
	await writeFile(latestMarkdownPath, markdown, "utf8");

	return {
		jsonPath,
		markdownPath,
		latestJsonPath,
		latestMarkdownPath,
	};
};
