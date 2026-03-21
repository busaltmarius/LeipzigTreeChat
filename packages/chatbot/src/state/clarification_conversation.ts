import { Data, MutableHashMap, MutableHashSet, Option } from "effect";
import {
  ClarificationQuestionURI,
  ConversationURI,
  QanaryClarificationAnswer,
  QanaryClarificationQuestion,
} from "./qanary-types.js";

/**
 * Stores clarification questions from the chatbot to the user and the answers provided by the user.
 */
export class ClarificationConversation extends Data.TaggedClass("Conversation")<{
  uri: ConversationURI;
  _questions: MutableHashMap.MutableHashMap<ClarificationQuestionURI, QanaryClarificationQuestion>;
  _openQuestions: MutableHashSet.MutableHashSet<ClarificationQuestionURI>;
  _resolvedQuestions: MutableHashMap.MutableHashMap<ClarificationQuestionURI, QanaryClarificationAnswer>;
}> {
  /**
   * Identifier of the question currently being answered, if one has been selected.
   */
  _currentQuestionUri: ClarificationQuestionURI | null;
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

    this._currentQuestionUri = null;
  }

  /**
   * Registers a new question and marks it as open.
   *
   * @param question The question to store in the conversation state.
   */
  addQuestion(question: QanaryClarificationQuestion): void {
    MutableHashMap.set(this._questions, question.uri, question);
    MutableHashSet.add(this._openQuestions, question.uri);
  }

  /**
   * Checks whether the conversation has a question with the given URI.
   *
   * @param questionUri The identifier of the question to check.
   * @returns `true` if the question exists in the conversation.
   */
  hasQuestion(questionUri: ClarificationQuestionURI): boolean {
    return MutableHashMap.has(this._questions, questionUri);
  }

  /**
   * Marks a known question as the current question being answered.
   *
   * @param questionUri The identifier of the question to select as current.
   */
  setCurrentQuestion(questionUri: ClarificationQuestionURI): void {
    if (this.hasQuestion(questionUri)) {
      this._currentQuestionUri = questionUri;
    } else {
      this._currentQuestionUri = null;
    }
  }

  /**
   * Checks whether there is a current question being answered.
   *
   * @returns `true` if a question is currently selected as current.
   */
  hasCurrentQuestion(): boolean {
    return !!this._currentQuestionUri;
  }

  /**
   * Stores an answer for the current question and removes the question from the open set.
   *
   * @param answer The answer to associate with the question.
   */
  answerCurrentQuestion(answer: QanaryClarificationAnswer) {
    if (this._currentQuestionUri === null) {
      return;
    }
    MutableHashMap.set(this._resolvedQuestions, this._currentQuestionUri, answer);
    MutableHashSet.remove(this._openQuestions, this._currentQuestionUri);
  }

  /**
   * Returns whether the given question already has a recorded answer.
   *
   * @param questionUri The identifier of the question to check.
   * @returns `true` if an answer has been stored for the question.
   */
  hasAnswer(questionUri: ClarificationQuestionURI): boolean {
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
  resolvedQuestions(): { question: QanaryClarificationQuestion; answer: QanaryClarificationAnswer }[] {
    let result: { question: QanaryClarificationQuestion; answer: QanaryClarificationAnswer }[] = [];

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
  openQuestions(): QanaryClarificationQuestion[] {
    // We guarantee that the question exists because it was added before the answer. So it is a real error if it doesn't exist!
    return Array.from(this._openQuestions).map((uri) =>
      MutableHashMap.get(this._questions, uri).pipe(Option.getOrThrow)
    );
  }

  /**
   * Returns the first unanswered question.
   *
   * @returns First question that is still awaiting an answer or undefined if there are no open questions.
   */
  getFirstOpenQuestion(): QanaryClarificationQuestion | undefined {
    // We guarantee that the question exists because it was added before the answer. So it is a real error if it doesn't exist!
    return Array.from(this._openQuestions)
      .map((uri) => MutableHashMap.get(this._questions, uri).pipe(Option.getOrThrow))
      .at(0);
  }
}
