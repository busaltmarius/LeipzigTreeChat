import type { Literal } from "rdf-js";
import type { IQanaryMessage } from "./api.js";
// import { DomainType } from "@leipzigtreechat/shared";

import { getEndpoint, getInGraph } from "./message-operations.js";
import { selectSparql } from "./query-sparql.js";

/**
 * A raw domain instance returned by the SPARQL query
 */
export interface IRawDomainInstance {
  label: Literal;
  id: Literal;
}
