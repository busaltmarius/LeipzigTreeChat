import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";

import { getQuestion } from "../get-question.js";

import { selectSparql } from "../query-sparql.js";

jest.mock("../query-sparql", () => ({
  selectSparql: jest.fn(() =>
    Promise.resolve([{ questionUri: { value: "http://qanary-pipeline:40111/question/urn:inGraph" } }])
  ),
}));

describe("getQuestion", () => {
  const expectedQuestion = "What is the capital of Germany?";
  const inGraph = "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd";
  const message: QanaryComponentApi.IQanaryMessage = {
    endpoint: "http://qanary-pipeline:40111/sparql",
    inGraph,
    outGraph: inGraph,
  };

  beforeEach(() => {
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(expectedQuestion),
      })
    );
  });

  it("should return the question", async () => {
    const question = await getQuestion(message);
    expect(question).toBe(expectedQuestion);
  });

  it("should return null if something went wrong", async () => {
    (global.fetch as jest.Mock) = jest.fn(() => Promise.reject("error"));
    const question = await getQuestion(message);
    expect(question).toBeNull();
  });

  it("should query the raw question id", async () => {
    const endpointUrl = "http://qanary-pipeline:40111/sparql";
    const mockSelectSparql = jest.fn(() =>
      Promise.resolve([{ questionUri: { value: "http://qanary-pipeline:40111/question/urn:inGraph" } }])
    );
    (selectSparql as jest.Mock) = mockSelectSparql;

    await getQuestion(message);

    expect(mockSelectSparql).toHaveBeenCalledWith(endpointUrl, expect.stringContaining("SELECT ?questionUri"));
    expect(mockSelectSparql).toHaveBeenCalledWith(
      endpointUrl,
      expect.stringContaining("FROM <urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd>")
    );
    expect(mockSelectSparql).toHaveBeenCalledWith(endpointUrl, expect.stringContaining("?questionUri a qa:Question"));
  });

  it("should fetch the raw question", async () => {
    (selectSparql as jest.Mock) = jest.fn(() =>
      Promise.resolve([{ questionUri: { value: "http://qanary-pipeline:40111/question/urn:inGraph" } }])
    );
    await getQuestion(message);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("http://qanary-pipeline:40111/question/urn:inGraph/raw"),
      expect.any(Object)
    );
  });
});
