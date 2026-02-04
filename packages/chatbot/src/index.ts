import { StateGraph } from "@langchain/langgraph";

import { AgentStateAnnotation } from "./state.js";

// Build the graph
export const ChatBotGraph = new StateGraph(AgentStateAnnotation).compile();
