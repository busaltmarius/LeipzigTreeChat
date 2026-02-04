import { describe, expect, test } from "bun:test";
import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";

import { getEndpoint, getInGraph, getOutGraph } from "../message-operations.js";

describe("message operations", () => {
  const endpoint = "http://qanary-pipeline:40111/sparql";
  const inGraph = "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd";
  const outGraph = inGraph;
  const message: QanaryComponentApi.IQanaryMessage = {
    endpoint,
    inGraph,
    outGraph,
  };

  describe("getEndpoint", () => {
    test("should get the correct endpoint", () => {
      const endpoint = getEndpoint(message);
      expect(endpoint).toBe(endpoint);
    });
  });

  describe("getInGraph", () => {
    test("should get the correct inGraph", () => {
      const inGraph = getInGraph(message);
      expect(inGraph).toBe(inGraph);
    });
  });

  describe("getOutGraph", () => {
    test("should get the correct outGraph", () => {
      const outGraph = getOutGraph(message);
      expect(outGraph).toBe(outGraph);
    });
  });
});
