import { END, START, StateGraph } from "@langchain/langgraph";
import { Nodes } from "./nodes.js";
import { AgentStateAnnotation } from "./state.js";

const CHATBOT_RESPONSE_NODE_ID = "chatbot_response";

const { ResponseNode } = Nodes(START, END, CHATBOT_RESPONSE_NODE_ID);

// Build the graph
export const ChatBotGraph = new StateGraph(AgentStateAnnotation)
  .addNode(CHATBOT_RESPONSE_NODE_ID, ResponseNode({ nextNode: END }), { ends: [END] })
  .compile();
