import { Data } from "effect";

/**
 * Identifies a question within a conversation.
 */
export class ClarificationQuestionURI extends Data.TaggedClass("ClarificationQuestionURI")<{ value: string }> {
  /**
   * Creates a new `QuestionURI` with the given value.
   *
   * @param value String value of the URI.
   */
  constructor(value: string) {
    super({ value });
  }
}

/**
 * Identifies a conversation instance.
 */
export class ConversationURI extends Data.TaggedClass("ConversationURI")<{ value: string }> {
  /**
   * Creates a new `ConversationURI` with the given value.
   *
   * @param value String value of the URI.
   */
  constructor(value: string) {
    super({ value });
  }
}

/**
 * Identifies a clarification answer within a conversation.
 */
export class ClarificationAnswerURI extends Data.TaggedClass("ClarificationAnswerURI")<{ value: string }> {
  /**
   * Creates a new `ClarificationAnswerURI` with the given value.
   *
   * @param value String value of the URI.
   */
  constructor(value: string) {
    super({ value });
  }
}

/**
 * Identifies a final answer within a conversation.
 */
export class FinalAnswerURI extends Data.TaggedClass("FinalAnswerURI")<{ value: string }> {
  /**
   * Creates a new `FinalAnswerURI` with the given value.
   *
   * @param value String value of the URI.
   */
  constructor(value: string) {
    super({ value });
  }
}

/**
 * A clarification question asked by the chatbot.
 */
export class QanaryClarificationQuestion extends Data.TaggedClass("QanaryClarificationQuestion")<{
  /**
   * Stable identifier for the question.
   */
  uri: ClarificationQuestionURI;

  /**
   * User-facing question text.
   */
  content: string;
}> {
  /**
   * Creates a new clarification question.
   *
   * @param uri Stable identifier for the question.
   * @param content User-facing question text.
   */
  constructor(uri: ClarificationQuestionURI, content: string) {
    super({ uri, content });
  }
}

/**
 * A user-provided answer to a clarification question.
 */
export class QanaryClarificationAnswer extends Data.TaggedClass("QanaryClarificationAnswer")<{
  /**
   * Stable identifier for the answer. Is null for answers that are not yet stored in the triplestore.
   */
  uri: ClarificationAnswerURI | null;

  /**
   * User-facing answer text.
   */
  content: string;
}> {
  /**
   * Creates a new clarification answer.
   *
   * @param uri Stable identifier for the answer or `null` if it has not been persisted yet.
   * @param content User-facing answer text.
   */
  constructor(uri: ClarificationAnswerURI | null, content: string) {
    super({ uri, content });
  }
}

/**
 * A final answer returned by the chatbot.
 */
export class QanaryFinalAnswer extends Data.TaggedClass("QanaryFinalAnswer")<{
  /**
   * Stable identifier for the final answer.
   */
  uri: FinalAnswerURI;

  /**
   * User-facing final answer text.
   */
  content: string;
}> {
  /**
   * Creates a new final answer.
   *
   * @param uri Stable identifier for the final answer.
   * @param content User-facing final answer text.
   */
  constructor(uri: FinalAnswerURI, content: string) {
    super({ uri, content });
  }
}
