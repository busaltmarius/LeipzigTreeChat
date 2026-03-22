import type { ChatBotMetadataStatus } from "../metadata.js";

export type BenchmarkCaseKind = "question" | "dialogue";
export type BenchmarkAxis =
	| "task_completion"
	| "grounding"
	| "flow_correctness"
	| "graceful_failure"
	| "presentation";
export type BenchmarkStatus = "pass" | "soft-fail" | "fail";
export type BenchmarkSignalTarget =
	| "assistant_last"
	| "assistant_any"
	| "transcript"
	| "metadata";
export type BenchmarkMatchMode = "includes" | "regex";
export type ClarificationExpectation =
	| "required"
	| "forbidden"
	| "allowed";

export type BenchmarkSignal = {
	label: string;
	value: string;
	axis: BenchmarkAxis;
	critical: boolean;
	target?: BenchmarkSignalTarget;
	mode?: BenchmarkMatchMode;
	flags?: string;
	caseSensitive?: boolean;
};

export type BenchmarkExpectedFlow = {
	clarification: ClarificationExpectation;
	requiredMetadataStatuses?: ChatBotMetadataStatus[];
	forbiddenMetadataStatuses?: ChatBotMetadataStatus[];
	minAssistantMessages?: number;
};

export type BenchmarkFixture = {
	id: string;
	title: string;
	kind: BenchmarkCaseKind;
	userTurns: string[];
	expectedFlow: BenchmarkExpectedFlow;
	requiredSignals: BenchmarkSignal[];
	forbiddenSignals: BenchmarkSignal[];
	notes: string;
};

export type BenchmarkTranscriptEntry = {
	role: "user" | "assistant";
	content: string;
	timestamp: string;
	turnIndex: number | null;
};

export type BenchmarkMetadataEntry = {
	status: ChatBotMetadataStatus;
	message: string;
	timestamp: string;
};

export type BenchmarkTurnTiming = {
	turnIndex: number;
	userPrompt: string;
	startedAt: string;
	firstAssistantResponseAt?: string;
	latencyMs?: number;
};

export type BenchmarkCheckResult = {
	label: string;
	axis: BenchmarkAxis;
	critical: boolean;
	passed: boolean;
	details: string;
};

export type BenchmarkAxisResult = {
	axis: BenchmarkAxis;
	passed: boolean;
	applicable: boolean;
	summary: string;
	checks: BenchmarkCheckResult[];
};

export type BenchmarkEvaluation = {
	status: BenchmarkStatus;
	score: number;
	failureReason?: string;
	axes: BenchmarkAxisResult[];
};

export type BenchmarkCaseResult = {
	fixture: BenchmarkFixture;
	transcript: BenchmarkTranscriptEntry[];
	metadata: BenchmarkMetadataEntry[];
	turnTimings: BenchmarkTurnTiming[];
	totalDurationMs: number;
	evaluation: BenchmarkEvaluation;
	runtimeError?: string;
};

export type BenchmarkRunResult = {
	startedAt: string;
	finishedAt: string;
	totalDurationMs: number;
	cases: BenchmarkCaseResult[];
};
