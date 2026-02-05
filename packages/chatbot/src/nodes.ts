import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { selectSparql } from "@leipzigtreechat/qanary-component-helpers";
import { Config, Effect, Either, Logger, Match, Schema } from "effect";
import { type InvalidInputError, MissingMessageError } from "./errors.js";
import { runLangGraphRuntime } from "./langgraph-runtime.js";
import { LLMService } from "./llm-service.js";
import type { AgentState } from "./state.js";
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
    UserInputNode:
      (routingConfig: { nextNode: NodeID }, getUserInput: () => Promise<string>) => async (state: AgentState) => {
        const { nextNode } = routingConfig;
        const program = Effect.gen(function* () {
          yield* Effect.logDebug("State: ", state);
          const userInput = yield* Effect.promise(() => getUserInput());

          return command({
            update: {
              input: userInput,
            },
            goto: nextNode,
          });
        });

        return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("UserInputNode"))));
      },
    QanaryNode: (routingConfig: { nextNode: NodeID; errorNode: NodeID }) => async (state: AgentState) => {
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
            textquestion: state.input,
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
              input: "",
              messages: state.messages,
            },
            goto: errorNode,
          });
        }

        return command({
          update: {
            graph_uri: result.right.inGraph,
          },
          goto: nextNode, // always route to question answering for now
        });
      });

      return await runLangGraphRuntime(
        program.pipe(Effect.provide(FetchHttpClient.layer), Effect.provide(NodeLoggerLayer("QanaryNode")))
      );
    },
    RouterNode:
      (routingConfig: {
        questionAnsweringNode: NodeID;
        responseNode: NodeID;
        endNode: NodeID;
        userInputNode: NodeID;
      }) =>
      async (state: AgentState) => {
        const { questionAnsweringNode } = routingConfig;
        const program = Effect.gen(function* () {
          yield* Effect.logDebug("State: ", state);

          return command({
            goto: questionAnsweringNode, // always route to question answering for now
          });
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
            const msg = state.input;
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
                input: "",
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
              input: "",
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
        if (state.graph_uri !== "") {
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

        const chatbotResponseContent = yield* llmService.generateChatbotResponse(state.input, { data: responseData });

        const msg = new AIMessage({ content: chatbotResponseContent });
        yield* printMessageEffect(msg);
        state.messages.push(msg);

        return command({
          update: {
            input: "",
            messages: state.messages,
          },
          goto: nextNode,
        });
      });

      return await runLangGraphRuntime(program.pipe(Effect.provide(NodeLoggerLayer("ResponseNode"))));
    },
  };
};
