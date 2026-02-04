import { beforeEach, afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";

import { getQuestion } from "../get-question.js";

import { selectSparql } from "../query-sparql.js";

beforeEach(() => {
    mock.module("../query-sparql.js", () => ({
      selectSparql: mock(() =>
        Promise.resolve([
          {
            questionUri: {
              value: "http://qanary-pipeline:40111/question/urn:inGraph",
            },
          },
        ])
      ),
    }));
})

afterEach(() => {
    mock.restore();
    mock.clearAllMocks();
});

describe("getQuestion", () => {
  const expectedQuestion = "What is the capital of Germany?";
  const inGraph = "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd";
  const message: QanaryComponentApi.IQanaryMessage = {
    endpoint: "http://qanary-pipeline:40111/sparql",
    inGraph,
    outGraph: inGraph,
  };

  beforeEach(() => {
    spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve(expectedQuestion),
      } as Response)
    );
  });

  test("should return the question", async () => {
    const question = await getQuestion(message);
    expect(question).toBe(expectedQuestion);
  });

  test("should return null if something went wrong", async () => {
    spyOn(global, "fetch").mockImplementation(() => Promise.reject("error"));
    const question = await getQuestion(message);
    expect(question).toBeNull();
  });

  test("should query the raw question id", async () => {
    const endpointUrl = "http://qanary-pipeline:40111/sparql";
    const mockSelectSparql = mock(() =>
      Promise.resolve([{ questionUri: { value: "http://qanary-pipeline:40111/question/urn:inGraph" } }])
    );
    // @ts-expect-error - mocking module
    selectSparql.mockImplementation(mockSelectSparql);

    await getQuestion(message);

    expect(mockSelectSparql).toHaveBeenCalledWith(endpointUrl, expect.stringContaining("SELECT ?questionUri"));
    expect(mockSelectSparql).toHaveBeenCalledWith(
      endpointUrl,
      expect.stringContaining("FROM <urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd>")
    );
    expect(mockSelectSparql).toHaveBeenCalledWith(endpointUrl, expect.stringContaining("?questionUri a qa:Question"));
  });

  test("should fetch the raw question", async () => {
    // @ts-expect-error - mocking module
    selectSparql.mockImplementation(() =>
      Promise.resolve([{ questionUri: { value: "http://qanary-pipeline:40111/question/urn:inGraph" } }])
    );
    await getQuestion(message);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("http://qanary-pipeline:40111/question/urn:inGraph/raw"),
      expect.any(Object)
    );
  });
});
