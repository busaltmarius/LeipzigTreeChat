import { getChatSessionState, serializeChatSession } from "$lib/server/chat-session";
import { ensureChatWebSocketServer, getChatWebSocketUrl } from "$lib/server/chat-websocket";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, url }) => {
  ensureChatWebSocketServer();
  const state = getChatSessionState(cookies);

  return {
    messages: serializeChatSession(state),
    websocketUrl: getChatWebSocketUrl(url),
  };
};
