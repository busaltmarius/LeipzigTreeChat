import type { Literal } from "rdf-js";
// import { DomainType } from "@leipzigtreechat/shared";

/**
 * A raw domain instance returned by the SPARQL query
 */
export interface IRawDomainInstance {
  label: Literal;
  id: Literal;
}
