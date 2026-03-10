import { Data, MutableHashMap, MutableHashSet, Option } from "effect";

/**
 * Identifies a question within a conversation.
 */
export class QuestionURI extends Data.TaggedClass("QuestionURI")<{ value: string }> {}

/**
 * Identifies a conversation instance.
 */
export class ConversationURI extends Data.TaggedClass("ConversationURI")<{ value: string }> {}

/**
 * Identifies an answer within a conversation.
 */
export class AnswerURI extends Data.TaggedClass("AnswerURI")<{ value: string }> {}

/**
 * A clarification question asked by the chatbot.
 */
export type Question = {
  /**
   * Stable identifier for the question.
   */
  uri: QuestionURI;

  /**
   * User-facing question text.
   */
  content: string;
};

/**
 * A user-provided answer to a clarification question.
 */
export type Answer = {
  /**
   * Stable identifier for the answer.
   */
  uri: AnswerURI;

  /**
   * User-facing answer text.
   */
  content: string;
};

/**
 * Stores clarification questions from the chatbot to the user and the answers provided by the user.
 */
export class Conversation extends Data.TaggedClass("Conversation")<{
  uri: ConversationURI;
  _questions: MutableHashMap.MutableHashMap<QuestionURI, Question>;
  _openQuestions: MutableHashSet.MutableHashSet<QuestionURI>;
  _resolvedQuestions: MutableHashMap.MutableHashMap<QuestionURI, Answer>;
}> {
  /**
   * Creates an empty conversation for the given identifier.
   *
   * @param uri Stable identifier for the conversation instance.
   */
  constructor(uri: ConversationURI) {
    super({
      uri,
      _questions: MutableHashMap.empty(),
      _openQuestions: MutableHashSet.empty(),
      _resolvedQuestions: MutableHashMap.empty(),
    });
  }

  /**
   * Registers a new question and marks it as open.
   *
   * @param question The question to store in the conversation state.
   */
  addQuestion(question: Question): void {
    MutableHashMap.set(this._questions, question.uri, question);
    MutableHashSet.add(this._openQuestions, question.uri);
  }

  /**
   * Stores an answer for a question and removes the question from the open set.
   *
   * @param questionUri The identifier of the question being answered.
   * @param answer The answer to associate with the question.
   */
  addAnswer(questionUri: QuestionURI, answer: Answer): void {
    MutableHashMap.set(this._resolvedQuestions, questionUri, answer);
    MutableHashSet.remove(this._openQuestions, questionUri);
  }

  /**
   * Returns whether the given question already has a recorded answer.
   *
   * @param questionUri The identifier of the question to check.
   * @returns `true` if an answer has been stored for the question.
   */
  hasAnswer(questionUri: QuestionURI): boolean {
    return MutableHashMap.has(this._resolvedQuestions, questionUri);
  }

  /**
   * Returns whether the conversation still contains unanswered questions.
   *
   * @returns `true` if at least one question is still open.
   */
  hasOpenQuestions(): boolean {
    return MutableHashSet.size(this._openQuestions) > 0;
  }

  /**
   * Returns all resolved question-answer pairs.
   *
   * @returns Every answered question together with its stored answer.
   */
  resolvedQuestions(): { question: Question; answer: Answer }[] {
    let result = [];

    for (const [questionUri, answer] of this._resolvedQuestions) {
      // We guarantee that the question exists because it was added before the answer. So it is a real error if it doesn't exist!
      const question = MutableHashMap.get(this._questions, questionUri).pipe(Option.getOrThrow);
      result.push({
        question,
        answer,
      });
    }
    return result;
  }

  /**
   * Returns all currently unanswered questions.
   *
   * @returns All questions that are still awaiting an answer.
   */
  openQuestions(): Question[] {
    // We guarantee that the question exists because it was added before the answer. So it is a real error if it doesn't exist!
    return Array.from(this._openQuestions).map((uri) =>
      MutableHashMap.get(this._questions, uri).pipe(Option.getOrThrow)
    );
  }
}
