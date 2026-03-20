import { type BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";
import { Nodes } from "./nodes.js";
import { AgentStateAnnotation } from "./state/index.js";

const CHATBOT_RESPONSE_NODE_ID = "chatbot_response";
const QANARY_ORCHESTRATOR_NODE_ID = "qanary_orchestrator";
const USER_INPUT_NODE_ID = "user_input";
const ROUTER_NODE_ID = "router";
const REQUEST_CLARIFICATION_NODE_ID = "request_clarification";
const QUESTION_REWRITE_NODE_ID = "question_rewrite";

// Build the graph
export const ChatBotGraph = (
  printMessage: (message: BaseMessage) => Promise<void>,
  getUserInput: () => Promise<string>
) => {
  const {
    UserInputNode,
    ResponseNode,
    RouterNode,
    RequestClarificationNode,
    QanaryOrchestratorNode,
    QuestionRewriteNode,
  } = Nodes(
    printMessage,
    START,
    END,
    CHATBOT_RESPONSE_NODE_ID,
    QANARY_ORCHESTRATOR_NODE_ID,
    ROUTER_NODE_ID,
    USER_INPUT_NODE_ID,
    REQUEST_CLARIFICATION_NODE_ID,
    QUESTION_REWRITE_NODE_ID
  );

  return new StateGraph(AgentStateAnnotation)
    .addNode(USER_INPUT_NODE_ID, UserInputNode({ nextNode: ROUTER_NODE_ID }, getUserInput), { ends: [ROUTER_NODE_ID] })
    .addNode(CHATBOT_RESPONSE_NODE_ID, ResponseNode({ nextNode: USER_INPUT_NODE_ID }), { ends: [USER_INPUT_NODE_ID] })
    .addNode(REQUEST_CLARIFICATION_NODE_ID, RequestClarificationNode({ nextNode: USER_INPUT_NODE_ID }), {
      ends: [USER_INPUT_NODE_ID],
    })
    .addNode(
      ROUTER_NODE_ID,
      RouterNode({
        questionAnsweringNode: QUESTION_REWRITE_NODE_ID,
        requestClarificationNode: REQUEST_CLARIFICATION_NODE_ID,
        responseNode: CHATBOT_RESPONSE_NODE_ID,
        endNode: END,
        userInputNode: USER_INPUT_NODE_ID,
      }),
      {
        ends: [
          QANARY_ORCHESTRATOR_NODE_ID,
          QUESTION_REWRITE_NODE_ID,
          CHATBOT_RESPONSE_NODE_ID,
          REQUEST_CLARIFICATION_NODE_ID,
          END,
          USER_INPUT_NODE_ID,
        ],
      }
    )
    .addNode(QUESTION_REWRITE_NODE_ID, QuestionRewriteNode({ nextNode: QANARY_ORCHESTRATOR_NODE_ID }), {
      ends: [QANARY_ORCHESTRATOR_NODE_ID],
    })
    .addNode(
      QANARY_ORCHESTRATOR_NODE_ID,
      QanaryOrchestratorNode({ nextNode: CHATBOT_RESPONSE_NODE_ID, errorNode: USER_INPUT_NODE_ID }),
      {
        ends: [CHATBOT_RESPONSE_NODE_ID, USER_INPUT_NODE_ID],
      }
    )
    .addEdge(START, USER_INPUT_NODE_ID)
    .compile();
};
