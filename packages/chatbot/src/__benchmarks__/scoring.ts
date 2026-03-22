import type {
	BenchmarkAxis,
	BenchmarkAxisResult,
	BenchmarkCaseResult,
	BenchmarkCheckResult,
	BenchmarkEvaluation,
	BenchmarkFixture,
	BenchmarkSignal,
	BenchmarkSignalTarget,
} from "./types.js";

const AXES: BenchmarkAxis[] = [
	"task_completion",
	"grounding",
	"flow_correctness",
	"graceful_failure",
	"presentation",
];

const normalizeText = (value: string, caseSensitive = false): string => {
	const normalized = value.replace(/\s+/g, " ").trim();
	return caseSensitive ? normalized : normalized.toLowerCase();
};

const selectSignalTargetText = (
	caseResult: Pick<BenchmarkCaseResult, "transcript" | "metadata">,
	target: BenchmarkSignalTarget | undefined
): string => {
	const assistantMessages = caseResult.transcript
		.filter((entry) => entry.role === "assistant")
		.map((entry) => entry.content);
	const lastAssistantMessage = assistantMessages.at(-1) ?? "";

	switch (target ?? "assistant_last") {
		case "assistant_any":
			return assistantMessages.join("\n");
		case "transcript":
			return caseResult.transcript
				.map((entry) => `${entry.role}: ${entry.content}`)
				.join("\n");
		case "metadata":
			return caseResult.metadata.map((entry) => entry.status).join("\n");
		case "assistant_last":
		default:
			return lastAssistantMessage;
	}
};

const evaluateSignal = (
	signal: BenchmarkSignal,
	caseResult: Pick<BenchmarkCaseResult, "transcript" | "metadata">,
	inverted = false
): BenchmarkCheckResult => {
	const haystack = selectSignalTargetText(caseResult, signal.target);
	const mode = signal.mode ?? "includes";
	const caseSensitive = signal.caseSensitive ?? false;
	let matched = false;

	if (mode === "regex") {
		const flags = signal.flags ?? (caseSensitive ? "" : "i");
		matched = new RegExp(signal.value, flags).test(haystack);
	} else {
		const left = normalizeText(haystack, caseSensitive);
		const right = normalizeText(signal.value, caseSensitive);
		matched = left.includes(right);
	}

	const passed = inverted ? !matched : matched;
	const details = passed
		? inverted
			? "Forbidden signal not present."
			: "Required signal matched."
		: inverted
			? `Forbidden signal matched: ${signal.value}`
			: `Required signal missing: ${signal.value}`;

	return {
		label: signal.label,
		axis: signal.axis,
		critical: signal.critical,
		passed,
		details,
	};
};

const includesStatusesInOrder = (observed: string[], required: string[]): boolean => {
	let cursor = 0;

	for (const status of observed) {
		if (status === required[cursor]) {
			cursor += 1;
		}
	}

	return cursor === required.length;
};

const buildFlowChecks = (fixture: BenchmarkFixture, caseResult: BenchmarkCaseResult): BenchmarkCheckResult[] => {
	const checks: BenchmarkCheckResult[] = [];
	const observedStatuses = caseResult.metadata.map((entry) => entry.status);
	const assistantMessages = caseResult.transcript.filter(
		(entry) => entry.role === "assistant" && entry.turnIndex !== null
	);
	const clarificationObserved = observedStatuses.includes("GENERATING_CLARIFICATION");

	if (fixture.expectedFlow.requiredMetadataStatuses?.length) {
		checks.push({
			label: "Pflicht-Metadatenpfad wird eingehalten",
			axis: "flow_correctness",
			critical: true,
			passed: includesStatusesInOrder(
				observedStatuses,
				fixture.expectedFlow.requiredMetadataStatuses
			),
			details: `Observed sequence: ${observedStatuses.join(" -> ") || "(none)"}`,
		});
	}

	if (fixture.expectedFlow.forbiddenMetadataStatuses?.length) {
		for (const status of fixture.expectedFlow.forbiddenMetadataStatuses) {
			checks.push({
				label: `Metadatenstatus ${status} bleibt aus`,
				axis: "flow_correctness",
				critical: true,
				passed: !observedStatuses.includes(status),
				details: `Observed sequence: ${observedStatuses.join(" -> ") || "(none)"}`,
			});
		}
	}

	if (fixture.expectedFlow.minAssistantMessages !== undefined) {
		checks.push({
			label: "Genug Assistentenantworten vorhanden",
			axis: "flow_correctness",
			critical: true,
			passed: assistantMessages.length >= fixture.expectedFlow.minAssistantMessages,
			details: `Observed ${assistantMessages.length} assistant messages for scripted turns.`,
		});
	}

	if (fixture.expectedFlow.clarification === "required") {
		checks.push({
			label: "Klärungsfrage wird erzeugt",
			axis: "flow_correctness",
			critical: true,
			passed: clarificationObserved,
			details: clarificationObserved
				? "Clarification metadata observed."
				: "No clarification metadata observed.",
		});
	}

	if (fixture.expectedFlow.clarification === "forbidden") {
		checks.push({
			label: "Keine unnötige Klärungsfrage",
			axis: "flow_correctness",
			critical: true,
			passed: !clarificationObserved,
			details: clarificationObserved
				? "Unexpected clarification metadata observed."
				: "No clarification metadata observed.",
		});
	}

	return checks;
};

const buildPresentationChecks = (caseResult: BenchmarkCaseResult): BenchmarkCheckResult[] => {
	const lastAssistantMessage =
		caseResult.transcript
			.filter((entry) => entry.role === "assistant")
			.map((entry) => entry.content)
			.at(-1) ?? "";
	const looksGerman = /\b(der|die|das|und|ich|du|nicht|bitte|kann|gibt|wurde|wurden|sind|ist|welche|welcher|in|gegossen|fragen|beantworten|Leipzig|Baum|Bäume|Wasser|Danke)\b|[äöüß]/i.test(
		lastAssistantMessage
	);
	const looksStructuredButUnreadable =
		lastAssistantMessage.trim().startsWith("{") &&
		lastAssistantMessage.trim().endsWith("}");

	return [
		{
			label: "Antwort ist lesbar",
			axis: "presentation",
			critical: true,
			passed: lastAssistantMessage.trim().length >= 10,
			details: `Last assistant message length: ${lastAssistantMessage.trim().length}`,
		},
		{
			label: "Antwort wirkt deutschsprachig",
			axis: "presentation",
			critical: true,
			passed: looksGerman,
			details: looksGerman
				? "Detected common German words."
				: "Could not detect German wording in the final assistant response.",
		},
		{
			label: "Antwort ist nicht nur Roh-JSON",
			axis: "presentation",
			critical: false,
			passed: !looksStructuredButUnreadable,
			details: looksStructuredButUnreadable
				? "Final assistant message looks like raw JSON."
				: "Final assistant message looks human-readable.",
		},
	];
};

const summarizeAxis = (checks: BenchmarkCheckResult[], defaultSummary: string): BenchmarkAxisResult => {
	const axis = checks[0]?.axis;

	if (!axis) {
		throw new TypeError("Axis summary requires at least one check.");
	}

	const applicable = checks.length > 0;
	const failedChecks = checks.filter((check) => !check.passed);
	const passed = failedChecks.length === 0;
	const summary = passed
		? defaultSummary
		: failedChecks.map((check) => check.label).join("; ");

	return {
		axis,
		passed,
		applicable,
		summary,
		checks,
	};
};

export const scoreBenchmarkCase = (
	fixture: BenchmarkFixture,
	caseResult: BenchmarkCaseResult
): BenchmarkEvaluation => {
	const axisChecks = new Map<BenchmarkAxis, BenchmarkCheckResult[]>(
		AXES.map((axis) => [axis, []])
	);

	for (const signal of fixture.requiredSignals) {
		axisChecks.get(signal.axis)?.push(evaluateSignal(signal, caseResult));
	}

	for (const signal of fixture.forbiddenSignals) {
		axisChecks.get(signal.axis)?.push(evaluateSignal(signal, caseResult, true));
	}

	for (const check of buildFlowChecks(fixture, caseResult)) {
		axisChecks.get(check.axis)?.push(check);
	}

	for (const check of buildPresentationChecks(caseResult)) {
		axisChecks.get(check.axis)?.push(check);
	}

	if ((axisChecks.get("task_completion")?.length ?? 0) === 0) {
		axisChecks.get("task_completion")?.push({
			label: "Mindestens eine Assistentenantwort vorhanden",
			axis: "task_completion",
			critical: true,
			passed: caseResult.transcript.some(
				(entry) => entry.role === "assistant" && entry.turnIndex !== null
			),
			details: "Fallback task-completion check.",
		});
	}

	if ((axisChecks.get("grounding")?.length ?? 0) === 0) {
		axisChecks.get("grounding")?.push({
			label: "Keine spezielle Grounding-Erwartung",
			axis: "grounding",
			critical: false,
			passed: true,
			details: "No grounding-specific signals configured for this case.",
		});
	}

	if ((axisChecks.get("graceful_failure")?.length ?? 0) === 0) {
		axisChecks.get("graceful_failure")?.push({
			label: "Keine spezielle Graceful-Failure-Erwartung",
			axis: "graceful_failure",
			critical: false,
			passed: true,
			details: "No graceful-failure-specific signals configured for this case.",
		});
	}

	const axes: BenchmarkAxisResult[] = AXES.map((axis) => {
		const checks = axisChecks.get(axis) ?? [];

		if (checks.length === 0) {
			return {
				axis,
				applicable: false,
				passed: true,
				summary: "No checks configured.",
				checks: [],
			};
		}

		return summarizeAxis(checks, "All checks passed.");
	});

	const failedChecks = axes.flatMap((axis) => axis.checks.filter((check) => !check.passed));
	const criticalFailures = failedChecks.filter((check) => check.critical);
	const totalWeight = axes.flatMap((axis) => axis.checks).reduce((sum, check) => {
		return sum + (check.critical ? 2 : 1);
	}, 0);
	const passedWeight = axes
		.flatMap((axis) => axis.checks)
		.reduce((sum, check) => sum + (check.passed ? (check.critical ? 2 : 1) : 0), 0);
	const score = totalWeight === 0 ? 1 : passedWeight / totalWeight;

	let status: BenchmarkEvaluation["status"] = "pass";
	let failureReason: string | undefined;

	if (caseResult.runtimeError) {
		status = "fail";
		failureReason = caseResult.runtimeError;
	} else if (criticalFailures.length > 0) {
		status = "fail";
		failureReason = `${criticalFailures[0]?.label}: ${criticalFailures[0]?.details}`;
	} else if (failedChecks.length > 0) {
		status = "soft-fail";
		failureReason = `${failedChecks[0]?.label}: ${failedChecks[0]?.details}`;
	}

	return {
		status,
		score,
		failureReason,
		axes,
	};
};
