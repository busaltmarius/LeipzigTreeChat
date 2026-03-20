import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { runChatTurn } from "@leipzigtreechat/chatbot";
import { getChatSessionState, serializeChatSession, setChatSessionState } from "$lib/server/chat-session";

const INVALID_PROMPT_ERROR = "Bitte gib zuerst eine Nachricht ein.";
const CHAT_FAILURE_ERROR = "Der Chatbot konnte gerade nicht antworten. Bitte versuche es erneut.";

export const POST: RequestHandler = async ({ request, cookies }) => {
	const state = getChatSessionState(cookies);
	const payload = await request.json().catch(() => null);
	const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";

	if (!prompt) {
		return json(
			{
				error: INVALID_PROMPT_ERROR,
				messages: serializeChatSession(state),
			},
			{ status: 400 }
		);
	}

	try {
		await runChatTurn(state, prompt);
		setChatSessionState(cookies, state);

		return json({
			messages: serializeChatSession(state),
		});
	} catch (error) {
		console.error("Failed to run chat turn", error);

		return json(
			{
				error: CHAT_FAILURE_ERROR,
				messages: serializeChatSession(state),
			},
			{ status: 500 }
		);
	}
};
