import type { BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";

import { Effect } from "effect";
import { InvalidInputError } from "./errors.js";
import { Nodes } from "./nodes.js";
import { AgentStateAnnotation } from "./state.js";

const KEYWORDS: string[] = ["order", "pizza"];
const KEYWORDS_STR = KEYWORDS.map((k) => `'${k}'`).join(", ");
function validatePizzaOrder(msg: BaseMessage) {
  const msgContent = msg.content.toString().toLowerCase();
  for (const keyword of KEYWORDS) {
    if (!msgContent.includes(keyword)) {
      return Effect.fail(
        new InvalidInputError({
          reason: `Expected keyword '${keyword}' was not found. All of [${KEYWORDS_STR}] must occur at least once in your input!`,
        })
      );
    }
  }

  return Effect.succeed({});
}

// Node names as constants
const INIT_PIZZA_ORDER = "init_pizza_order";
const RETRIEVE_ORDER_INFO = "retrieve_order_info";
const REQUEST_ORDER_INFO = "request_order_info";

const { ValidationNode, RetrievalNode, OrderNode } = Nodes(
  START,
  INIT_PIZZA_ORDER,
  RETRIEVE_ORDER_INFO,
  REQUEST_ORDER_INFO,
  END
);

// Build the graph
export const ChatBotGraph = new StateGraph(AgentStateAnnotation)
  .addNode(
    INIT_PIZZA_ORDER,
    ValidationNode(validatePizzaOrder, {
      nextNode: REQUEST_ORDER_INFO,
      errorNode: END,
    }),
    { ends: [REQUEST_ORDER_INFO, END] }
  )
  .addNode(
    REQUEST_ORDER_INFO,
    OrderNode({
      nextNode: RETRIEVE_ORDER_INFO,
      endNode: END,
    }),
    { ends: [RETRIEVE_ORDER_INFO, END] }
  )
  .addNode(
    RETRIEVE_ORDER_INFO,
    RetrievalNode({
      requestNode: REQUEST_ORDER_INFO,
      nextNode: END,
      endNode: END,
    }),
    { ends: [REQUEST_ORDER_INFO, END] }
  )
  .addEdge(START, INIT_PIZZA_ORDER)
  .compile();
