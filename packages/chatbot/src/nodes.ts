import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { Clock, Config, Effect, Either, Logger, Match, Schema } from "effect";
import { type InvalidInputError, MissingMessageError } from "./errors.js";
import { runLangGraphRuntime } from "./langgraph-runtime.js";
import { LLMService } from "./llm-service.js";
import { type ChatBotMetadataCallback, type ChatBotMetadataStatus } from "./metadata.js";
import {
  type AgentState,
  ClarificationConversation,
  ConversationURI,
  QanaryClarificationAnswer,
  QanaryClarificationQuestion,
} from "./state/index.js";
import { TriplestoreService } from "./triplestore-service.js";
import type { Unit } from "./unit.js";

/**
 * Logger that prints the node name in each log message.
 * @param nodeName Name of the node that should be logged.
 * @returns The Logger for the node.
 */
const NodeLoggerLayer = (nodeName: string) =>
  Logger.replace(
    Logger.defaultLogger,
    Logger.prettyLoggerDefault.pipe(
      Logger.mapInput((message) => {
        if (Array.isArray(message)) {
          [`${nodeName}`, ...message.flat(2)];
        }

        return [`${nodeName}`, message];
      })
    )
  );

type LangGraphRuntimeEnvironment =
  Parameters<typeof runLangGraphRuntime>[0] extends Effect.Effect<any, any, infer R> ? R : never;

/**
 * Runs a node effect inside the shared chatbot runtime and emits timing logs.
 *
 * @param nodeName Name used for scoped logging.
 * @param effect Effect implementing the node behavior.
 * @returns The resolved node result.
 */
const runTimedNode = async <A, E>(
  nodeName: string,
  effect: Effect.Effect<A, E, LangGraphRuntimeEnvironment>
): Promise<A> => {
  return runLangGraphRuntime(
    Effect.gen(function* () {
      const startedAt = yield* Clock.currentTimeMillis;
      yield* Effect.logTrace(`[${nodeName}] Start execution`);
      const result = yield* effect.pipe(Effect.provide(NodeLoggerLayer(nodeName)));
      const endedAt = yield* Clock.currentTimeMillis;
      yield* Effect.logTrace(`[${nodeName}] Ended execution after ${endedAt - startedAt}ms`);
      return result;
    })
  );
};

/**
 * Constructor for Nodes with type-safe routing between them.
 *
 * @param printMessage - Function to print messages, used for updating the user interface
 * @param onMetadata - Optional callback for progress and error metadata updates
 * @param nodes - The list of node IDs used in the routing, serves to guarantee type safety for node transitions
 * @returns The Node constructors with the injected type information
 */
export const Nodes = <const N extends string[]>(
  printMessage: (message: BaseMessage) => Promise<void>,
  onMetadata: ChatBotMetadataCallback | undefined,
  ..._nodes: N
) => {
  type NodeID = N[number];
  const responseGenerationErrorMessage =
    "Entschuldigung, ich konnte gerade keine Antwort formulieren. Bitte versuche es erneut.";
  const clarificationGenerationErrorMessage =
    "Entschuldigung, ich konnte gerade keine Rückfrage formulieren. Bitte versuche es erneut.";
  const questionRewriteErrorMessage =
    "Es gab ein Problem beim Umformulieren der Frage. Ich nutze deine ursprüngliche Eingabe.";

  /**
   * Typed helper to create a Command. Use this to ensure type safety!
   * @param commandArgs Arguments for the Command
   * @returns The created Command
   */
  const command = (commandArgs: { update?: Partial<AgentState>; goto: NodeID }) => new Command(commandArgs);

  const printMessageEffect = (message: BaseMessage) => Effect.promise(() => printMessage(message));
  const sendMetadataEffect = (status: ChatBotMetadataStatus, message?: string) =>
    onMetadata ? Effect.promise(() => Promise.resolve(onMetadata({ status, message }))) : Effect.void;

  return {
    /**
     * This node prompts the user for input and stores it in the agent state.
     * @param routingConfig The routing configuration for the next node
     * @param getUserInput A function that retrieves the user's input asynchronously
     * @returns The configured Node usable by LangGraph
     */
    UserInputNode:
      (routingConfig: { nextNode: NodeID }, getUserInput: () => Promise<string>) => async (state: AgentState) => {
        const { nextNode } = routingConfig;
        const program = Effect.gen(function* () {
          //yield* Effect.logDebug("State: ", state);
          yield* sendMetadataEffect("WAITING_FOR_INPUT");
          const userInput = yield* Effect.promise(() => getUserInput());

          state.messages.push(new HumanMessage(userInput));

          switch (state.chatmode) {
            case "CLARIFICATION": {
              if (state.clarification === undefined) {
                yield* Effect.logError("No clarification conversation present in AgentState");

                return command({
                  update: {
                    messages: state.messages,
                  },
                  goto: nextNode,
                });
              }

              if (state.clarification.hasCurrentQuestion()) {
                state.clarification.answerCurrentQuestion(new QanaryClarificationAnswer(null, userInput));
              } else {
                yield* Effect.logError("No current question to answer");
              }
              return command({
                update: {
                  clarification: state.clarification,
                  messages: state.messages,
                },
                goto: nextNode,
              });
            }
            case "USER_QUESTION": {
              return command({
                update: {
                  user_question: userInput,
                  messages: state.messages,
                },
                goto: nextNode,
              });
            }
            default: {
              yield* Effect.logError("Unknown chatmode: ", state.chatmode);
              return command({
                update: {
                  messages: state.messages,
                },
                goto: nextNode,
              });
            }
          }
        });

        return await runTimedNode("UserInputNode", program);
      },

    /**
     * This node sends the user's input to the Qanary question answering pipeline.
     * @param routingConfig The routing configuration for the next node and error node
     * @returns The configured Node usable by LangGraph
     */
    QanaryOrchestratorNode: (routingConfig: { routerNode: NodeID }) => async (state: AgentState) => {
      const { routerNode } = routingConfig;
      const program = Effect.gen(function* () {
        //yield* Effect.logDebug("State: ", state);
        yield* sendMetadataEffect("GATHERING_DATA");

        // 1. Access the HTTP Client from the context
        const client = yield* HttpClient.HttpClient;

        const components = [
          "qanary-component-eat-simple",
          "qanary-component-nerd-simple",
          "qanary-component-dis",
          "qanary-component-relation-detection",
          "qanary-component-sparql-generation",
        ];
        const apiBaseUrl = yield* Config.url("QANARY_API_BASE_URL");

        const QanaryResponse = Schema.Struct({
          inGraph: Schema.String,
        });

        const result = yield* HttpClientRequest.post(`${apiBaseUrl}questionanswering`).pipe(
          HttpClientRequest.setUrlParams({
            textquestion: state.user_question,
            "componentlist[]": components,
          }),
          client.execute,
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(HttpClientResponse.schemaBodyJson(QanaryResponse)),
          Effect.timeout("240 seconds"),
          Effect.scoped,
          Effect.either
        );

        yield* Effect.logDebug("Qanary Result: ", result);

        if (Either.isLeft(result)) {
          const error = result.left;
          yield* Effect.logError("Error in Qanary pipeline:", error);
          const errorMessageContent =
            "Entschuldigung, es gab ein Problem bei der Verarbeitung deiner Anfrage durch Qanary.";
          yield* sendMetadataEffect("ERROR", errorMessageContent);

          return command({
            update: {
              qanary_answer: undefined,
              messages: state.messages,
              clarification: undefined,
            },
            goto: routerNode,
          });
        }

        const graph_uri = result.right.inGraph;

        const triplestore = yield* TriplestoreService;

        const clarifications = yield* triplestore.queryClarifications(graph_uri);
        const clarification = new ClarificationConversation(new ConversationURI(graph_uri));
        for (const item of clarifications) {
          clarification.addQuestion(new QanaryClarificationQuestion(item.uri, item.content));
        }

        const qanary_answer = yield* Effect.either(triplestore.queryFinalAnswer(graph_uri));

        if (Either.isLeft(qanary_answer)) {
          const error = qanary_answer.left;

          if (error._tag === "NotFoundError") {
            yield* Effect.logError(`Could not find item of type ${error.itemType} in the triplestore.`);
            yield* sendMetadataEffect("ERROR", "Es konnten keine Antworten im Triplestore gefunden werden.");
          } else if (error._tag === "SPARQLError") {
            yield* Effect.logError("Error while executing SPARQL query:", error.reason);
            yield* sendMetadataEffect("ERROR", "Es gab ein Problem beim Ausführen der SPARQL-Abfrage.");
          }

          return command({
            update: {
              qanary_answer: undefined,
              messages: state.messages,
              clarification,
            },
            goto: routerNode,
          });
        }

        return command({
          update: {
            qanary_answer: qanary_answer.right,
            clarification,
          },
          goto: routerNode,
        });
      });

      return await runTimedNode("QanaryOrchestratorNode", program);
    },

    /**
     * This node decides which node to route to based on the conversation state.
     * @param routingConfig The routing configuration for the different successor nodes
     * @returns The configured Node usable by LangGraph
     */
    RouterNode:
      (routingConfig: { questionAnsweringNode: NodeID; requestClarificationNode: NodeID; responseNode: NodeID }) =>
      async (state: AgentState) => {
        const { questionAnsweringNode, requestClarificationNode, responseNode } = routingConfig;
        const program = Effect.gen(function* () {
          yield* Effect.logDebug("State: ", state);
          if (state.clarification) {
            yield* Effect.logDebug("Number of open questions: ", state.clarification.openQuestions().length);
            yield* Effect.logDebug("Number of resolved questions: ", state.clarification.resolvedQuestions().length);
          }

          if (
            state.clarification?.hasOpenQuestions() &&
            (state.chatmode === "RESPONSE" || state.chatmode === "CLARIFICATION")
          ) {
            return command({
              update: {
                chatmode: "CLARIFICATION",
              },
              goto: requestClarificationNode,
            });
          }

          if (state.chatmode === "CLARIFICATION" && !state.clarification?.hasOpenQuestions()) {
            return command({
              update: {
                chatmode: "RESPONSE",
              },
              goto: questionAnsweringNode,
            });
          }

          if (state.chatmode === "USER_QUESTION") {
            return command({
              update: {
                chatmode: "RESPONSE",
              },
              goto: questionAnsweringNode,
            });
          }

          return command({
            update: {
              chatmode: "USER_QUESTION",
            },
            goto: responseNode,
          });
        });

        return await runTimedNode("RouterNode", program);
      },

    /**
     * This node validates the last user message with a provided function
     * @param validationFunction The function to validate the user message
     * @param routingConfig The routing configuration for success and error nodes
     * @returns The configured Node usable by LangGraph
     */
    ValidationNode:
      (
        validationFunction: (msg: BaseMessage) => Effect.Effect<Unit, InvalidInputError | MissingMessageError>,
        routingConfig: { errorNode: NodeID; nextNode: NodeID }
      ) =>
      async (state: AgentState) => {
        const { errorNode, nextNode } = routingConfig;
        const program = Effect.gen(function* () {
          //yield* Effect.logDebug("State: ", state);

          const safeValidationFn = Effect.gen(function* () {
            const msg = state.user_question;
            yield* Effect.logDebug(`Validating message: ${msg}`);
            if (!msg) {
              yield* new MissingMessageError();
            }
            yield* Effect.logDebug("Run validation");
            const result = yield* validationFunction(new HumanMessage(msg));
            yield* Effect.logDebug("Validation result: ", result);
            return result;
          });

          const validationResult = yield* Effect.either(safeValidationFn);

          // Error handling
          if (Either.isLeft(validationResult)) {
            const error = Match.value(validationResult.left).pipe(
              Match.tag("MissingMessageError", () => ({
                message: "Empty message received. Please provide valid input.",
                logMessage: "Missing message",
              })),
              Match.tag("InvalidInputError", (err) => ({
                message: `Invalid input received: ${err.reason}`,
                logMessage: "Invalid input",
              })),
              Match.exhaustive
            );

            yield* Effect.logDebug(error.logMessage);
            yield* sendMetadataEffect("ERROR", error.message);
            yield* printMessageEffect(new AIMessage({ content: error.message }));
            state.messages.push(new AIMessage({ content: error.message }));

            return command({
              update: {
                messages: state.messages,
              },
              goto: errorNode,
            });
          }

          const msg = new AIMessage({
            content: "Danke für deine Eingabe! Ich habe deine Anfrage verstanden und werde sie nun bearbeiten.",
          });
          yield* printMessageEffect(msg);
          state.messages.push(msg);

          return command({
            update: {
              messages: state.messages,
            },
            goto: nextNode,
          });
        });

        return await runTimedNode("ValidationNode", program);
      },

    /**
     * This Node generates a human-readable chatbot response using the current gathered data stored in the state.
     * @param routingConfig The routing configuration for the next node
     * @returns The configured Node usable by LangGraph
     */
    ResponseNode: (routingConfig: { nextNode: NodeID }) => async (state: AgentState) => {
      const { nextNode } = routingConfig;
      const program = Effect.gen(function* () {
        //yield* Effect.logDebug("State: ", state);
        yield* sendMetadataEffect("GENERATING_RESPONSE");

        if (state.qanary_answer === undefined) {
          const msg = new AIMessage({
            content:
              "Für diese Frage konnte ich leider keine zufriedenstellende Antwort finden. Bitte versuche diese anders zu formulieren oder stelle eine ganz neue Frage!",
          });
          yield* printMessageEffect(msg);
          state.messages.push(msg);
        } else {
          const llmService = yield* LLMService;
          const chatbotResponseContent = yield* llmService
            .generateChatbotResponse(state.user_question, state.qanary_answer)
            .pipe(
              Effect.catchTag("LLMServiceError", (error) =>
                Effect.gen(function* () {
                  yield* Effect.logError("Error while generating chatbot response:", error);
                  yield* sendMetadataEffect("ERROR", responseGenerationErrorMessage);
                  return responseGenerationErrorMessage;
                })
              )
            );

          const msg = new AIMessage({ content: chatbotResponseContent });
          yield* printMessageEffect(msg);
          state.messages.push(msg);
        }

        return command({
          update: {
            messages: state.messages,
          },
          goto: nextNode,
        });
      });

      return await runTimedNode("ResponseNode", program);
    },

    /**
     * This node generates a clarification question using the current gathered data stored in the state.
     * @param routingConfig The routing configuration for the next node
     * @returns The configured Node usable by LangGraph
     */
    RequestClarificationNode: (routingConfig: { nextNode: NodeID }) => async (state: AgentState) => {
      const { nextNode } = routingConfig;
      const program = Effect.gen(function* () {
        //yield* Effect.logDebug("State: ", state);
        yield* sendMetadataEffect("GENERATING_CLARIFICATION");
        const llmService = yield* LLMService;
        if (state.clarification === undefined) {
          yield* Effect.logError("No clarification conversation present in AgentState");
          return command({
            update: {
              messages: state.messages,
            },
            goto: nextNode,
          });
        }

        if (!state.clarification.hasOpenQuestions()) {
          yield* Effect.logError("No open questions, skipping RequestClarificationNode");
          return command({
            update: {
              messages: state.messages,
            },
            goto: nextNode,
          });
        }

        // Get the first open question (guaranteed to exist because we checked hasOpenQuestions above!)
        const openQuestion = state.clarification.getFirstOpenQuestion()!;

        state.clarification.setCurrentQuestion(openQuestion.uri);

        const chatbotResponseContent = yield* llmService
          .generateClarificationQuestion(state.user_question, openQuestion)
          .pipe(
            Effect.catchTag("LLMServiceError", (error) =>
              Effect.gen(function* () {
                yield* Effect.logError("Error while generating clarification question:", error);
                yield* sendMetadataEffect("ERROR", clarificationGenerationErrorMessage);
                return clarificationGenerationErrorMessage;
              })
            )
          );

        const msg = new AIMessage({ content: chatbotResponseContent });
        yield* printMessageEffect(msg);
        state.messages.push(msg);

        return command({
          update: {
            messages: state.messages,
            clarification: state.clarification,
          },
          goto: nextNode,
        });
      });

      return await runTimedNode("RequestClarificationNode", program);
    },

    /**
     * This node rewrites a question by consolidating conversation history with new input.
     * Combines known information from previous messages with new input into a single comprehensive question.
     * @param routingConfig The routing configuration for the next node
     * @returns The configured Node usable by LangGraph
     */
    QuestionRewriteNode: (routingConfig: { nextNode: NodeID }) => async (state: AgentState) => {
      const { nextNode } = routingConfig;
      const program = Effect.gen(function* () {
        //yield* Effect.logDebug("State: ", state);
        yield* sendMetadataEffect("REWRITING_QUESTION");
        const llmService = yield* LLMService;

        // Build conversation history from messages
        const conversationHistory = state.messages
          .map((msg) => {
            const role = msg instanceof AIMessage ? "Assistant" : "User";
            const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
            return `${role}: ${content}`;
          })
          .join("\n");

        // Rewrite the question by combining history with new input
        const rewrittenQuestion = yield* llmService.rewriteQuestion(conversationHistory, state.user_question).pipe(
          Effect.catchTag("LLMServiceError", (error) =>
            Effect.gen(function* () {
              yield* Effect.logError("Error while rewriting question:", error);
              yield* sendMetadataEffect("ERROR", questionRewriteErrorMessage);
              return state.user_question;
            })
          )
        );

        yield* Effect.logDebug("Original input: ", state.user_question);
        yield* Effect.logDebug("Rewritten question: ", rewrittenQuestion);

        return command({
          update: {
            user_question: rewrittenQuestion,
          },
          goto: nextNode,
        });
      });

      return await runTimedNode("QuestionRewriteNode", program);
    },
  };
};
