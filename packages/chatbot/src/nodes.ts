import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";

import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Effect, Either, Logger, Match, Option, Schema } from "effect";
import { type InvalidInputError, MissingMessageError } from "./errors.js";
import { runLangGraphRuntime } from "./langgraph-runtime.js";
import type { AgentState } from "./state.js";
import type { Unit } from "./unit.js";
import { LLMService } from "./llm-service.js";

export enum OrderSlots {
  PIZZA_NAME = "current_pizza_name",
  USER_NAME = "user_name",
}

/**
 * Logger that prints the node name in each log message.
 * @param nodeName Name of the node that should be logged.
 * @returns The Logger for the node.
 */
const NodeLogger = (nodeName: string) =>
  Logger.stringLogger.pipe(Logger.mapInput((message) => [`${nodeName}`, message]));

/**
 * Collects the slots for the pizza order
 *
 * @param nodes - The list of node IDs used in the routing, serves to guarantee type safety for node transitions
 * @returns The Node constructors with the injected type information
 */
export const Nodes = <const N extends string[]>(..._nodes: N) => {
  type NodeID = N[number];

  /**
   * Typed helper to create a Command. Use this to ensure type safety!
   * @param commandArgs Arguments for the Command
   * @returns The created Command
   */
  const command = (commandArgs: { update?: Partial<AgentState>; goto: NodeID }) => new Command(commandArgs);

  return {
    /**
     * This node handles the ordering process by asking for missing information
     * @param routingConfig The routing configuration for nextNode (when still missing information) and endNode (when order is complete)
     * @returns The configured Node usable by LangGraph
     */
    OrderNode: (routingConfig: { nextNode: NodeID; endNode: NodeID }) => async (state: AgentState) => {
      const { nextNode, endNode } = routingConfig;
      const program = Effect.gen(function* () {
        yield* Effect.logDebug("State: ", state);

        if (state.current_slot !== undefined) {
          return command({
            goto: nextNode,
          });
        }

        const slotInfo = Match.value(state).pipe(
          Match.when(
            (state) => state.pizzas.size === 0,
            () => ({
              message: "What pizza would you like to order?",
              logMessage: "Requesting pizza name",
              slot: Option.some("PIZZA_NAME" as const),
            })
          ),
          Match.when(
            (state) => state.user_name === undefined,
            () => ({
              message: "What is your name?",
              logMessage: "Requesting user name",
              slot: Option.some("USER_NAME" as const),
            })
          ),
          Match.orElse(() => ({
            message: "Thank you for providing all the details. Your order is being processed!",
            logMessage: "Order completed. All slots gathered!",
            slot: Option.none(),
          }))
        );

        yield* Effect.logDebug(slotInfo.logMessage);

        state.messages.push(new AIMessage(slotInfo.message));

        if (Option.isNone(slotInfo.slot)) {
          return command({
            update: {
              messages: state.messages,
              gathered_order_info: true,
              current_slot: undefined,
            },
            goto: endNode,
          });
        }

        return command({
          update: {
            messages: state.messages,
            current_slot: slotInfo.slot.value,
          },
          goto: endNode,
        });
      });

      return await runLangGraphRuntime(
        program.pipe(Effect.provide(Logger.replace(Logger.defaultLogger, NodeLogger("OrderNode"))))
      );
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

          if (state.active_order) {
            return command({
              goto: nextNode,
            });
          }

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
          state.messages.push(
            new AIMessage({
              content: "Thank you for your input. Proceeding with the order.",
            })
          );

          return command({
            update: {
              input: "",
              messages: state.messages,
              active_order: true,
            },
            goto: nextNode,
          });
        });

        return await runLangGraphRuntime(
          program.pipe(Effect.provide(Logger.replace(Logger.defaultLogger, NodeLogger("ValidationNode"))))
        );
      },

    /**
     * This node extracts the information from user input
     * @param routingConfig The routing configuration for success and error nodes
     * @returns The configured Node usable by LangGraph
     */
    RetrievalNode:
      (routingConfig: { nextNode: NodeID; requestNode: NodeID; endNode: NodeID }) => async (state: AgentState) => {
        const { nextNode, requestNode, endNode } = routingConfig;
        const program = Effect.gen(function* () {
          yield* Effect.logDebug("RetrievalNode State: ", state);

          if (!state.active_order) {
            state.messages.push(new AIMessage({ content: "No order active! Let's start again!" }));

            return command({
              update: {
                messages: state.messages,
                current_slot: undefined,
                pizzas: new Map(),
                user_name: undefined,
                gathered_order_info: false,
              },
              goto: endNode,
            });
          }

          const _input = state.input.toLowerCase();

          const result = Match.value(state.current_slot).pipe(
            Match.when(undefined, () => ({
              message: "No slot to fill. Let's continue.",
              logMessage: "No current slot to fill.",
              update: {},
              goto: nextNode,
            })),
            Match.when("PIZZA_NAME", () => {
              const pizzas = state.pizzas ?? new Map();
              // TODO: Process user input to extract pizza name and validate against a list of available pizzas.
              const currentAmount = pizzas.get(_input) ?? 0;
              pizzas.set(_input, currentAmount + 1);

              return {
                message: `Great choice! I've added ${_input} to your order.`,
                logMessage: `Pizza name collected: ${_input}`,
                update: {
                  current_pizza_name: _input,
                  pizzas,
                },
                goto: requestNode,
              };
            }),
            Match.when("USER_NAME", () => ({
              message: `Thank you for providing your name ${_input}!`,
              logMessage: `User name collected: ${_input}`,
              update: {
                user_name: _input,
              },
              goto: requestNode,
            })),
            Match.exhaustive
          );

          state.messages.push(new AIMessage(result.message));
          yield* Effect.logDebug(result.logMessage);

          return command({
            update: {
              ...result.update,
              input: "",
              messages: state.messages,
              current_slot: undefined,
            },
            goto: result.goto,
          });
        });

        return await runLangGraphRuntime(
          program.pipe(Effect.provide(Logger.replace(Logger.defaultLogger, NodeLogger("RetrievalNode"))))
        );
      },

    AddressWatering:
      (routingConfig: { nextNode: NodeID; requestNode: NodeID; endNode: NodeID }) => async (state: AgentState) => {
        const { nextNode, requestNode, endNode } = routingConfig;
        const program = Effect.gen(function* () {
          yield* Effect.logDebug("State: ", state);

          const _input = state.input.toLowerCase();

          const parseAddressSchema = Schema.decodeUnknown(
            Schema.TemplateLiteralParser(
              Schema.String,
              Schema.Literal("Bezirk", "Stadtteil", "Stadtbezirk"),
              " ",
              Schema.NonEmptyString,
              " ",
              Schema.String
            )
          )
          
          const parseResult = yield* Effect.either(parseAddressSchema(_input));

          if (Either.isLeft(parseResult)) {
            yield* Effect.logDebug("Error while parsing", parseResult.left)
            
            state.messages.push(new AIMessage("Entschuldigung, ich konnte leider in deiner Anfrage keinen Stadtbezirk finden. Bitte stelle sicher, dass dieser korrekt geschrieben ist und vor diesem eines dieser Wörter steht: 'Bezirk', 'Stadtbezirk' oder 'Stadtteil'."));

            return command({
              update: {
                input: "",
                messages: state.messages
              },
              goto: endNode,
            });
          } else {
            const bezirk = parseResult.right[3]
            const sparqlRequest = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX bkv: <urn:de:leipzig:trees:vocab:baumkataster:>
            PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            SELECT ?tree ?gattung ?longitutde ?latitude ?daysSinceWatering WHERE {
              ?tree rdf:type bkv:Tree ;
                    bkv:ot "${bezirk}";
                    bkv:gattung ?gattung ;
                    geo:lat ?latitude;
                    geo:long ?longitutde;
                    bkv:letzte_bewaesserung ?bewaesserungString .
              BIND(xsd:dateTime(?bewaesserungString) AS ?bewaesserungDate)
              BIND((now() - "P30D"^^xsd:duration) AS ?thirtyDaysAgo)
              FILTER(?bewaesserungDate < ?thirtyDaysAgo)
              BIND((now() - ?bewaesserungDate) AS ?daysSinceWatering)
            }
            `
            const result = "";
            const llmService = yield* LLMService;
            const output = yield* llmService.ask(
              `
              Frage: ${_input}
              Daten: ${result}

              Nutze die Daten um die Frage zu beantworten. Erfindede keine eigenen Informationen, sondern beantworte die Frage aussließlich mit den bereitgestellten Daten.
              `
            )

            state.messages.push(new AIMessage(output));


            return command({
              update: {
                input: "",
                messages: state.messages
              },
              goto: endNode,
            });
          }      

        })

        return await runLangGraphRuntime(
          program.pipe(Effect.provide(Logger.replace(Logger.defaultLogger, NodeLogger("AddressWatering"))))
        );
      }
  };
};
