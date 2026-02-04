import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { Effect, Either, Logger, Match } from "effect";
import { type InvalidInputError, MissingMessageError } from "./errors.js";
import { runLangGraphRuntime } from "./langgraph-runtime.js";
import type { AgentState } from "./state.js";
import type { Unit } from "./unit.js";

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
    UserInputNode: (_routingConfig: { nextNode: NodeID }) => async (_state: AgentState) => {},
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
              content: "Danke für deine Eingabe! Ich habe deine Anfrage verstanden und werde sie nun bearbeiten.",
            })
          );

          return command({
            update: {
              input: "",
              messages: state.messages,
            },
            goto: nextNode,
          });
        });

        return await runLangGraphRuntime(
          program.pipe(Effect.provide(Logger.replace(Logger.defaultLogger, NodeLogger("ValidationNode"))))
        );
      },
    /*AddressWatering:
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
      }*/
  };
};
