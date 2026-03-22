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

const printPartialResult = (
  completedCases: number,
  totalCases: number,
  cases: Array<{ evaluation: { status: string }; fixture: { id: string; title: string }; totalDurationMs: number }>
) => {
  const latestCase = cases[completedCases - 1];

  if (!latestCase) {
    return;
  }

  const passCount = cases.filter((result) => result.evaluation.status === "pass").length;
  const softFailCount = cases.filter((result) => result.evaluation.status === "soft-fail").length;
  const failCount = cases.filter((result) => result.evaluation.status === "fail").length;

  console.info(
    [
      `[${completedCases}/${totalCases}]`,
      latestCase.fixture.id,
      latestCase.fixture.title,
      `-> ${latestCase.evaluation.status}`,
      `(${latestCase.totalDurationMs} ms)`,
      `running totals: pass=${passCount}, soft-fail=${softFailCount}, fail=${failCount}`,
    ].join(" ")
  );
};

const main = async () => {
  const outputDir = parseOutputDir();
  const observedCases: Array<{
    evaluation: { status: string };
    fixture: { id: string; title: string };
    totalDurationMs: number;
  }> = [];
  const runResult = await runBenchmarkSuite(DEMO_BENCHMARK_FIXTURES, async (event) => {
    observedCases.push(event.result);
    printPartialResult(event.completedCases, event.totalCases, observedCases);
  });
  const paths = await writeBenchmarkArtifacts(runResult, outputDir);
  const passedCases = runResult.cases.filter((result) => result.evaluation.status === "pass").length;

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
