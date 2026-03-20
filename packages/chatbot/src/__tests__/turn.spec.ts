import { describe, expect, test } from "bun:test";
import { AIMessage } from "@langchain/core/messages";
import { createInitialAgentState, INITIAL_ASSISTANT_MESSAGE_CONTENT, runChatTurnWithExecutor } from "../turn.js";

describe("chat turns", () => {
	test("seeds the initial assistant greeting", () => {
		const state = createInitialAgentState();
		const [initialMessage] = state.messages;

		expect(state.messages).toHaveLength(1);
		expect(initialMessage).toBeInstanceOf(AIMessage);
		expect(initialMessage?.content).toBe(INITIAL_ASSISTANT_MESSAGE_CONTENT);
	});

	test("records the user turn before executing the assistant turn", async () => {
		const state = createInitialAgentState();

		await runChatTurnWithExecutor(state, "Welche Baeume gibt es hier?", async (nextState) => {
			nextState.messages.push(new AIMessage({ content: "Ich schaue nach." }));
		});

		expect(state.messages).toHaveLength(3);
		expect(state.messages.map((message) => message.getType())).toEqual(["ai", "human", "ai"]);
		expect(state.messages[1]?.content).toBe("Welche Baeume gibt es hier?");
		expect(state.messages[2]?.content).toBe("Ich schaue nach.");
	});

	test("preserves transcript order across multiple turns", async () => {
		const state = createInitialAgentState();

		await runChatTurnWithExecutor(state, "Erste Frage", async (nextState) => {
			nextState.messages.push(new AIMessage({ content: "Erste Antwort" }));
		});
		await runChatTurnWithExecutor(state, "Zweite Frage", async (nextState) => {
			nextState.messages.push(new AIMessage({ content: "Zweite Antwort" }));
		});

		expect(
			state.messages.map((message) => ({
				role: message.getType(),
				content: message.content,
			}))
		).toEqual([
			{ role: "ai", content: INITIAL_ASSISTANT_MESSAGE_CONTENT },
			{ role: "human", content: "Erste Frage" },
			{ role: "ai", content: "Erste Antwort" },
			{ role: "human", content: "Zweite Frage" },
			{ role: "ai", content: "Zweite Antwort" },
		]);
	});
});
