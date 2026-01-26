import fs from "fs";

/**
 * These are text fragments that can be substituted into SparQL query files to make parameterized queries.
 */
export enum RESERVED_KEYWORD_IN_SPARQL_QUERY {
  YOUR_CURRENT_GRAPH_ID = "YOUR_CURRENT_GRAPH_ID",
  YOUR_ANNOTATION_TYPES = "qa:YOUR_ANNOTATION_TYPES",
}

/**
 * A replacement object that replaces the keyword with a text fragment when loading a SparQL file.
 */
interface ISparqlQueryReplacement {
  keyword: string;
  replacement: string;
}

/**
 * A helper function to load SparQL files and replace text fragments if necessary. The return is a transformed text, of the given file.
 * @param filePath the path of the file to read
 * @param sparqlQueryReplacements a list of text fragments to replace as objects
 */
export const queryFileLoader = (filePath: string, sparqlQueryReplacements: Array<ISparqlQueryReplacement>): string => {
  let query: string = fs.readFileSync(filePath, "utf-8");
  for (const sparqlQueryReplacement of sparqlQueryReplacements) {
    query = query.replaceAll(sparqlQueryReplacement.keyword, sparqlQueryReplacement.replacement);
  }

  return query;
};
