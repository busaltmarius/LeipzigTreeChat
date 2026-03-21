import { selectSparql } from "@leipzigtreechat/qanary-component-helpers";
import { Config, Context, Data, Effect, Layer } from "effect";
import {
  ClarificationQuestionURI,
  FinalAnswerURI,
  QanaryClarificationQuestion,
  QanaryFinalAnswer,
} from "./state/qanary-types.js";

type SPARQLResult<T extends string> = Array<{ [K in T]: { value: string } }>;

/**
 * Wraps SPARQL query failures so triplestore access can be modeled in Effect.
 */
export class SPARQLError extends Data.TaggedError("SPARQLError")<{ reason: any }> {
  constructor(reason: any) {
    super({ reason });
  }
}

type QanaryItemType = "QanaryFinalAnswer" | "QanaryClarificationAnswer" | "QanaryClarificationQuestion";
export class NotFoundError extends Data.TaggedError("NotFoundError")<{ itemType: QanaryItemType }> {
  constructor(itemType: QanaryItemType) {
    super({ itemType });
  }
}

/**
 * Contract for triplestore reads needed by the chatbot package.
 */
type TriplestoreInterface = {
  /**
   * Loads all non-empty clarification annotations from the given named graph.
   */
  readonly queryClarifications: (graphUri: string) => Effect.Effect<Array<QanaryClarificationQuestion>, SPARQLError>;
  readonly queryFinalAnswer: (graphUri: string) => Effect.Effect<QanaryFinalAnswer, NotFoundError | SPARQLError>;
};

/**
 * Effect service for querying clarification data from the configured triplestore.
 */
export class TriplestoreService extends Context.Tag("Triplestore")<TriplestoreService, TriplestoreInterface>() {
  /**
   * Live implementation backed by the `TRIPLESTORE_URL` environment config.
   */
  static Live = Layer.effect(
    TriplestoreService,
    Effect.gen(function* () {
      const triplestoreUrl = yield* Config.string("TRIPLESTORE_URL");

      return {
        queryClarifications: (graphUri: string) =>
          Effect.gen(function* () {
            // Query for all clarifications
            const getClarificationsQuery = `
              PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
              SELECT ?annotationId ?clarification WHERE {
                GRAPH <${graphUri}> {
                  ?annotationId a <urn:qanary#AnnotationOfClarification> ;
                    oa:hasBody ?clarification .
                }
              }
            `;

            yield* Effect.logInfo("Executing SPARQL query for clarifications", { getClarificationsQuery });
            const triplestoreData = yield* Effect.tryPromise({
              try: () =>
                selectSparql(triplestoreUrl, getClarificationsQuery) as Promise<
                  SPARQLResult<"annotationId" | "clarification">
                >,
              catch: (reason: any) => new SPARQLError(reason),
            });

            return triplestoreData
              .filter((item) => {
                if (item.annotationId?.value == undefined || item.clarification?.value == undefined) {
                  return false;
                }

                if (item.annotationId.value.trim() === "" || item.clarification.value.trim() === "") {
                  return false;
                }

                return true;
              })
              .map(
                ({ clarification, annotationId }) =>
                  new QanaryClarificationQuestion(new ClarificationQuestionURI(annotationId.value), clarification.value)
              );
          }),
        queryFinalAnswer: (graphUri: string) =>
          Effect.gen(function* () {
            // Query for the extracted answer
            const getDataQuery = `
                  PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
                  SELECT ?annotationId ?answer WHERE {
                    GRAPH <${graphUri}> {
                      ?annotationId a <urn:qanary#AnnotationOfAnswerJson> ;
                        oa:hasBody ?answer .
                    }
                  }
                `;
            yield* Effect.logInfo("Executing SPARQL query for answer annotation", { getDataQuery });

            const responseData = yield* Effect.tryPromise({
              try: () => selectSparql(triplestoreUrl, getDataQuery) as Promise<SPARQLResult<"annotationId" | "answer">>,
              catch: (unknown: any) => new SPARQLError(unknown),
            });

            let qanaryAnswer = null;

            for (const item of responseData) {
              if (
                item.annotationId?.value == undefined ||
                item.answer?.value == undefined ||
                item.annotationId.value.trim() === "" ||
                item.answer.value.trim() === ""
              ) {
                continue;
              }

              qanaryAnswer = {
                _tag: "QanaryFinalAnswer" as const,
                uri: new FinalAnswerURI(item.annotationId.value),
                content: item.answer.value,
              };
            }

            if (qanaryAnswer === null) {
              return yield* new NotFoundError("QanaryFinalAnswer");
            }

            return qanaryAnswer;
          }),
      };
    })
  );
}
