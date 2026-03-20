import type { PageServerLoad } from "./$types";
import { getChatSessionState, serializeChatSession } from "$lib/server/chat-session";

export const load: PageServerLoad = async ({ cookies }) => {
	const state = getChatSessionState(cookies);

	return {
		messages: serializeChatSession(state),
	};
};
