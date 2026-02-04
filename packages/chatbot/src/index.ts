import { END, START, StateGraph } from "@langchain/langgraph";
import { Nodes } from "./nodes.js";
import { AgentStateAnnotation } from "./state.js";

const CHATBOT_RESPONSE_NODE_ID = "chatbot_response";
const ROUTER_NODE_ID = "chatbot_response";

const { ResponseNode, RouterNode } = Nodes(START, END, CHATBOT_RESPONSE_NODE_ID);

// Build the graph
export const ChatBotGraph = new StateGraph(AgentStateAnnotation)
  .addNode(CHATBOT_RESPONSE_NODE_ID, ResponseNode({ nextNode: END }), { ends: [END] })
  .addNode(
    ROUTER_NODE_ID,
    RouterNode({
      questionAnsweringNode: CHATBOT_RESPONSE_NODE_ID,
      responseNode: CHATBOT_RESPONSE_NODE_ID,
      endNode: END,
      userInputNode: END,
    })
  )
  .addEdge(START, ROUTER_NODE_ID)
  .compile();
