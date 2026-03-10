import { Data, MutableHashMap, MutableHashSet, Option } from "effect";

export class QuestionURI extends Data.TaggedClass("QuestionURI")<{ value: string }> {}
export class ConversationURI extends Data.TaggedClass("ConversationURI")<{ value: string }> {}
export class AnswerURI extends Data.TaggedClass("AnswerURI")<{ value: string }> {}

export type Question = {
  uri: QuestionURI;
  content: string;
};

export type Answer = {
  uri: AnswerURI;
  content: string;
};

export class Conversation extends Data.TaggedClass("Conversation")<{
  uri: ConversationURI;
  _questions: MutableHashMap.MutableHashMap<QuestionURI, Question>;
  _openQuestions: MutableHashSet.MutableHashSet<QuestionURI>;
  _resolvedQuestions: MutableHashMap.MutableHashMap<QuestionURI, Answer>;
}> {
  constructor(uri: ConversationURI) {
    super({
      uri,
      _questions: MutableHashMap.empty(),
      _openQuestions: MutableHashSet.empty(),
      _resolvedQuestions: MutableHashMap.empty(),
    });
  }

  addQuestion(question: Question): void {
    MutableHashMap.set(this._questions, question.uri, question);
    MutableHashSet.add(this._openQuestions, question.uri);
  }

  addAnswer(questionUri: QuestionURI, answer: Answer): void {
    MutableHashMap.set(this._resolvedQuestions, questionUri, answer);
    MutableHashSet.remove(this._openQuestions, questionUri);
  }

  hasAnswer(questionUri: QuestionURI): boolean {
    return MutableHashMap.has(this._resolvedQuestions, questionUri);
  }

  hasOpenQuestions(): boolean {
    return MutableHashSet.size(this._openQuestions) > 0;
  }

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

  openQuestions(): Question[] {
    // We guarantee that the question exists because it was added before the answer. So it is a real error if it doesn't exist!
    return Array.from(this._openQuestions).map((uri) =>
      MutableHashMap.get(this._questions, uri).pipe(Option.getOrThrow)
    );
  }
}
