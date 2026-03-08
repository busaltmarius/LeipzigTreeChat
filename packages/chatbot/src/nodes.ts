import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { selectSparql } from "@leipzigtreechat/qanary-component-helpers";
import { Config, Effect, Either, Logger, Match, Schema } from "effect";
import { type InvalidInputError, MissingMessageError } from "./errors.js";
import { runLangGraphRuntime } from "./langgraph-runtime.js";
import { LLMService } from "./llm-service.js";
import { ClarificationConversation, ConversationURI } from "./state/clarification_conversation.js";
import { type AgentState } from "./state/index.js";
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

/**
 * Constructor for Nodes with type-safe routing between them.
 *
 * @param printMessage - Function to print messages, used for updating the user interface
 * @param nodes - The list of node IDs used in the routing, serves to guarantee type safety for node transitions
 * @returns The Node constructors with the injected type information
 */
export const Nodes = <const N extends string[]>(
  printMessage: (message: BaseMessage) => Promise<void>,
  ..._nodes: N
) => {
  type NodeID = N[number];

  /**
   * Typed helper to create a Command. Use this to ensure type safety!
   * @param commandArgs Arguments for the Command
   * @returns The created Command
   */
  const command = (commandArgs: { update?: Partial<AgentState>; goto: NodeID }) => new Command(commandArgs);

  const printMessageEffect = (message: BaseMessage) => Effect.promise(() => printMessage(message));

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
          yield* Effect.logDebug("State: ", state);
          const userInput = yield* Effect.promise(() => getUserInput());

          switch (state.chatmode) {
            case "CLARIFICATION": {
              if (state.clarification === undefined) {
                yield* Effect.logError("No clarification conversation present in AgentState");

                return command({
                  goto: nextNode,
                });
              }

              if (state.clarification.hasCurrentQuestion()) {
                state.clarification.answerCurrentQuestion({ uri: null, content: userInput });
              } else {
                yield* Effect.logError("No current question to answer");
              }
              return command({
                update: {
                  clarification: state.clarification,
                },
                goto: nextNode,
              });
            }
            case "QUESTION_ANSWERING": {
              return command({
                update: {
                  user_question: userInput,
                  has_user_question: true,
                },
                goto: nextNode,
              });
            }
            default: {
              yield* Effect.logError("Unknown chatmode: ", state.chatmode);
              return command({
                goto: nextNode,
              });
            }
          }
        });

        return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("UserInputNode"))));
      },

    /**
     * This node sends the user's input to the Qanary question answering pipeline.
     * @param routingConfig The routing configuration for the next node and error node
     * @returns The configured Node usable by LangGraph
     */
    QanaryOrchestratorNode: (routingConfig: { nextNode: NodeID; errorNode: NodeID }) => async (state: AgentState) => {
      const { nextNode, errorNode } = routingConfig;
      const program = Effect.gen(function* () {
        yield* Effect.logDebug("State: ", state);

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
          Effect.timeout("60 seconds"),
          Effect.scoped,
          Effect.either
        );

        yield* Effect.logDebug("Qanary Result: ", result);

        if (Either.isLeft(result)) {
          const error = result.left;
          yield* Effect.logError("Error in Qanary component:", error);
          const errorMessage = new AIMessage({
            content: "Entschuldigung, es gab ein Problem bei der Verarbeitung deiner Anfrage.",
          });
          yield* printMessageEffect(errorMessage);
          state.messages.push(errorMessage);

          return command({
            update: {
              messages: state.messages,
            },
            goto: errorNode,
          });
        }

        const graphUri = result.right.inGraph;

        // Query for the extracted answer
        let qanaryAnswer = "";
        const getDataQuery = `
          PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
          SELECT ?answer WHERE {
            GRAPH <${graphUri}> {
              ?relationAnnotationId a <urn:qanary#AnnotationOfAnswer> ;
                oa:hasBody ?answer .
            }
          }
        `;

        const triplestoreUrl = yield* Config.string("TRIPLESTORE_URL");

        const responseData = yield* Effect.tryPromise({
          try: () => selectSparql(triplestoreUrl, getDataQuery) as Promise<Array<{ answer: { value: string } }>>,
          catch: (unknown: any) => new Error(`Error querying SPARQL endpoint: ${unknown}`),
        }).pipe(Effect.catchAll((error: any) => Effect.logError(error).pipe(Effect.as([] as Array<{ answer: { value: string } }>))));

        if (responseData.length > 0) {
          const first = responseData[0];
          if (first && first.answer) {
            qanaryAnswer = first.answer.value;
          }
        }

        return command({
          update: {
            graph_uri: result.right.inGraph,
            clarification: new ClarificationConversation(new ConversationURI(result.right.inGraph)),
            qanary_answer: qanaryAnswer,
          },
          goto: nextNode,
        });
      });

      return await runLangGraphRuntime(
        program.pipe(Effect.provide(FetchHttpClient.layer), Effect.provide(NodeLoggerLayer("QanaryOrchestratorNode")))
      );
    },

    /**
     * This node decides which node to route to based on the conversation state.
     * @param routingConfig The routing configuration for the different successor nodes
     * @returns The configured Node usable by LangGraph
     */
    RouterNode:
      (routingConfig: {
        questionAnsweringNode: NodeID;
        requestClarificationNode: NodeID;
        responseNode: NodeID;
        endNode: NodeID;
        userInputNode: NodeID;
      }) =>
      async (state: AgentState) => {
        const { questionAnsweringNode, requestClarificationNode, responseNode } = routingConfig;
        const program = Effect.gen(function* () {
          yield* Effect.logDebug("State: ", state);

          switch (state.chatmode) {
            case "QUESTION_ANSWERING":
              {
                if (state.has_user_question) {
                  return command({
                    update: {
                      has_user_question: false,
                    },
                    goto: questionAnsweringNode,
                  });
                }

                return command({
                  goto: responseNode,
                });
              }
              break;
            case "CLARIFICATION":
              {
                if (state.clarification === undefined) {
                  yield* Effect.logError("No clarification conversation present in AgentState");
                  return command({
                    goto: responseNode,
                  });
                }

                if (state.clarification.hasOpenQuestions()) {
                  return command({
                    goto: requestClarificationNode,
                  });
                }

                return command({
                  goto: responseNode,
                });
              }
              break;
            default: {
              yield* Effect.logError("Unknown chatmode: ", state.chatmode);
              return command({
                goto: responseNode,
              });
            }
          }
        });

        return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("RouterNode"))));
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
          yield* Effect.logDebug("State: ", state);

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
            yield* printMessageEffect(new AIMessage({ content: error.message }));
            state.messages.push(new AIMessage({ content: error.message }));

            return command({
              update: {
                messages: state.messages,
              },
              goto: errorNode,
            });
          }

          // Happy path
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

        return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("ValidationNode"))));
      },

    /**
     * This Node generates a human-readable chatbot response using the current gathered data stored in the state.
     * @param routingConfig The routing configuration for the next node
     * @returns The configured Node usable by LangGraph
     */
    ResponseNode: (routingConfig: { nextNode: NodeID }) => async (state: AgentState) => {
      const { nextNode } = routingConfig;
      const program = Effect.gen(function* () {
        yield* Effect.logDebug("State: ", state);
        const llmService = yield* LLMService;

        let responseData: any[] = [];
        if (state.qanary_answer) {
          responseData = [{ answer: { value: state.qanary_answer } }];
        } else if (state.graph_uri !== "") {
          const getDataQuery = `
              PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
              SELECT ?answer WHERE {
                GRAPH <${state.graph_uri}> {
                  ?relationAnnotationId a <urn:qanary#AnnotationOfAnswer> ;
                    oa:hasBody ?answer .
                }
              }
              `;

          const triplestoreUrl = yield* Config.string("TRIPLESTORE_URL");

          responseData = yield* Effect.tryPromise({
            try: () => selectSparql(triplestoreUrl, getDataQuery),
            catch: (unknown: any) => new Error(`Error querying SPARQL endpoint: ${unknown}`),
          }).pipe(Effect.catchAll((error: any) => Effect.logError(error).pipe(Effect.as([]))));
        }

        const chatbotResponseContent = yield* llmService.generateChatbotResponse(state.user_question, {
          data: responseData,
        });

        const msg = new AIMessage({ content: chatbotResponseContent });
        yield* printMessageEffect(msg);
        state.messages.push(msg);

        return command({
          update: {
            user_question: "",
            chatmode: "QUESTION_ANSWERING",
            messages: state.messages,
          },
          goto: nextNode,
        });
      });

      return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("ResponseNode"))));
    },

    /**
     * This node generates a clarification question using the current gathered data stored in the state.
     * @param routingConfig The routing configuration for the next node
     * @returns The configured Node usable by LangGraph
     */
    RequestClarificationNode: (routingConfig: { nextNode: NodeID }) => async (state: AgentState) => {
      const { nextNode } = routingConfig;
      const program = Effect.gen(function* () {
        yield* Effect.logDebug("State: ", state);
        const llmService = yield* LLMService;
        if (state.clarification === undefined) {
          yield* Effect.logError("No clarification conversation present in AgentState");
          return command({
            update: {
              chatmode: "QUESTION_ANSWERING",
              messages: state.messages,
            },
            goto: nextNode,
          });
        }

        if (!state.clarification.hasOpenQuestions()) {
          yield* Effect.logError("No open questions, switching to question answering mode");
          return command({
            update: {
              chatmode: "QUESTION_ANSWERING",
              messages: state.messages,
            },
            goto: nextNode,
          });
        }

        // Get the first open question (guaranteed to exist because we checked hasOpenQuestions above!)
        const openQuestion = state.clarification.getFirstOpenQuestion()!;

        state.clarification.setCurrentQuestion(openQuestion.uri);

        const chatbotResponseContent = yield* llmService.generateClarificationQuestion(state.user_question, {
          data: openQuestion,
        });

        const msg = new AIMessage({ content: chatbotResponseContent });
        yield* printMessageEffect(msg);
        state.messages.push(msg);

        return command({
          update: {
            chatmode: "CLARIFICATION",
            messages: state.messages,
            clarification: state.clarification,
          },
          goto: nextNode,
        });
      });

      return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("RequestClarificationNode"))));
    },
  };
};
