import { PassThrough } from "node:stream";

import { askSparql, selectSparql, updateSparql } from "../query-sparql.js";

const mockReadStream = new PassThrough();
const mockSelect = jest.fn(() => mockReadStream);
const mockAsk = jest.fn(() => true);
const mockUpdate = jest.fn();

jest.mock("sparql-http-client", () => {
  return jest.fn().mockImplementation(() => {
    return {
      query: {
        select: mockSelect,
        ask: mockAsk,
        update: mockUpdate,
      },
    };
  });
});

describe("query sparql", () => {
  describe("selectSparl", () => {
    it("should return the result of the query as array", async () => {
      const endpoint = "http://qanary-pipeline:40111/sparql";
      const query = "SELECT * WHERE { ?s ?p ?o }";

      mockReadStream.end();

      const result = await selectSparql(endpoint, query);

      expect(mockSelect).toBeCalledWith(query);
      expect(result).toEqual([]);
    });
  });

  describe("askSparql", () => {
    it("should query the endpoint with the given query", async () => {
      const endpoint = "http://qanary-pipeline:40111/sparql";
      const query = "ASK WHERE { ?s ?p ?o }";

      await askSparql(endpoint, query);

      expect(mockAsk).toBeCalledWith(query);
    });

    it("should return true if the query returns true", async () => {
      const endpoint = "http://qanary-pipeline:40111/sparql";
      const query = "ASK WHERE { ?s ?p ?o }";

      const answer = await askSparql(endpoint, query);

      expect(answer).toBe(true);
    });
  });

  describe("updateSparql", () => {
    it("should update the endpoint", async () => {
      const endpoint = "http://qanary-pipeline:40111/sparql";
      const query = "INSERT DATA { ?s ?p ?o }";

      await updateSparql(endpoint, query);

      expect(mockUpdate).toHaveBeenCalledWith(query);
    });
  });
});
