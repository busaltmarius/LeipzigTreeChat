import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { ChatBotGraph } from "./graph.js";
import type { AgentState } from "./state/index.js";

export const INITIAL_ASSISTANT_MESSAGE_CONTENT =
	"Hallo, ich bin der Baumwächter von Leipzig. Wie kann ich dir helfen?";

export type RunChatTurnOptions = {
	onMessage?: (message: BaseMessage) => Promise<void> | void;
};

type TurnExecutor = (state: AgentState, input: string, options: RunChatTurnOptions) => Promise<void>;

const executeGraphTurn: TurnExecutor = async (state, input, options) => {
	const graph = ChatBotGraph(
		async (message) => {
			await options.onMessage?.(message);
		},
		async () => input
	);

	await graph.invoke(state);
};

export const createInitialAgentState = (): AgentState => ({
    chatmode: "QUESTION_ANSWERING",
	user_question: "",
	has_user_question: false,
	qanary_answer: undefined,
	clarification: undefined,
	messages: [
		new AIMessage({
			content: INITIAL_ASSISTANT_MESSAGE_CONTENT,
		}),
	],
	has_ended: false,
});

export const runChatTurnWithExecutor = async (
	state: AgentState,
	input: string,
	executeTurn: TurnExecutor,
	options: RunChatTurnOptions = {}
): Promise<AgentState> => {
	const prompt = input.trim();

	if (!prompt) {
		return state;
	}

	state.messages.push(new HumanMessage(prompt));
	await executeTurn(state, prompt, options);

	return state;
};

export const runChatTurn = async (
	state: AgentState,
	input: string,
	options: RunChatTurnOptions = {}
): Promise<AgentState> => {
	return runChatTurnWithExecutor(state, input, executeGraphTurn, options);
};
