import { type BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";
import { Nodes } from "./nodes.js";
import { AgentStateAnnotation } from "./state.js";

const CHATBOT_RESPONSE_NODE_ID = "chatbot_response";
const QANARY_NODE_ID = "qanary";
const USER_INPUT_NODE_ID = "user_input";
const ROUTER_NODE_ID = "router";

// Build the graph
export const ChatBotGraph = (
  printMessage: (message: BaseMessage) => Promise<void>,
  getUserInput: () => Promise<string>
) => {
  const { UserInputNode, ResponseNode, RouterNode, QanaryNode } = Nodes(
    printMessage,
    START,
    END,
    CHATBOT_RESPONSE_NODE_ID,
    QANARY_NODE_ID,
    ROUTER_NODE_ID,
    USER_INPUT_NODE_ID
  );

  return new StateGraph(AgentStateAnnotation)
    .addNode(USER_INPUT_NODE_ID, UserInputNode({ nextNode: ROUTER_NODE_ID }, getUserInput), { ends: [ROUTER_NODE_ID] })
    .addNode(CHATBOT_RESPONSE_NODE_ID, ResponseNode({ nextNode: END }), { ends: [END] })
    .addNode(
      ROUTER_NODE_ID,
      RouterNode({
        questionAnsweringNode: QANARY_NODE_ID,
        responseNode: CHATBOT_RESPONSE_NODE_ID,
        endNode: END,
        userInputNode: USER_INPUT_NODE_ID,
      }),
      { ends: [QANARY_NODE_ID, CHATBOT_RESPONSE_NODE_ID, END, USER_INPUT_NODE_ID] }
    )
    .addNode(QANARY_NODE_ID, QanaryNode({ nextNode: CHATBOT_RESPONSE_NODE_ID, errorNode: USER_INPUT_NODE_ID }), {
      ends: [CHATBOT_RESPONSE_NODE_ID, USER_INPUT_NODE_ID],
    })
    .addEdge(START, USER_INPUT_NODE_ID)
    .compile();
};
