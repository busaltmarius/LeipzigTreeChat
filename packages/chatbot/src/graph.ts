import { type BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";
import type { ChatBotMetadataCallback } from "./metadata.js";
import { Nodes } from "./nodes.js";
import { AgentStateAnnotation } from "./state/index.js";

const CHATBOT_RESPONSE_NODE_ID = "chatbot_response";
const QANARY_ORCHESTRATOR_NODE_ID = "qanary_orchestrator";
const USER_INPUT_NODE_ID = "user_input";
const ROUTER_NODE_ID = "router";
const REQUEST_CLARIFICATION_NODE_ID = "request_clarification";
const QUESTION_REWRITE_NODE_ID = "question_rewrite";

/**
 * Builds the chatbot state graph with the package's standard node wiring.
 *
 * @param printMessage Called whenever the graph produces an assistant message for the user.
 * @param getUserInput Resolves the next user input whenever the graph waits for input.
 * @param onMetadata Optional observer for progress and error metadata emitted by the nodes.
 * @returns A compiled LangGraph instance that drives the chatbot conversation loop.
 */
export const ChatBotGraph = (
  printMessage: (message: BaseMessage) => Promise<void>,
  getUserInput: () => Promise<string>,
  onMetadata?: ChatBotMetadataCallback
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
    onMetadata,
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
      }),
      {
        ends: [QUESTION_REWRITE_NODE_ID, CHATBOT_RESPONSE_NODE_ID, REQUEST_CLARIFICATION_NODE_ID],
      }
    )
    .addNode(QUESTION_REWRITE_NODE_ID, QuestionRewriteNode({ nextNode: QANARY_ORCHESTRATOR_NODE_ID }), {
      ends: [QANARY_ORCHESTRATOR_NODE_ID],
    })
    .addNode(QANARY_ORCHESTRATOR_NODE_ID, QanaryOrchestratorNode({ routerNode: ROUTER_NODE_ID }), {
      ends: [ROUTER_NODE_ID],
    })
    .addEdge(START, USER_INPUT_NODE_ID)
    .compile();
};
