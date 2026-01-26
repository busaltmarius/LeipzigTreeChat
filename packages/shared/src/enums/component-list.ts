/**
 * List of all components that can be used in the qanary pipeline
 */
export enum COMPONENT {
  FUZZY_NER = "qanary-component-fuzzy",
  LANGUAGE_RECOGNITION = "LD-Shuyo",
  NER_AUTOML = "qanary-component-ner-automl",
  PATTERN_MATCHING_CALCULATION = "qanary-component-pm-calculation",
  PATTERN_MATCHING_MEASURAND = "qanary-component-pm-measurand",
  PATTERN_MATCHING_REPRESENTATION = "qanary-component-pm-representation",
  PATTERN_MATCHING_STATION = "qanary-component-pm-station",
  TIME_RECOGNITION = "qanary-component-time",
}

/**
 * The run sequence of all available components
 */
export const COMPONENT_LIST_ALL_RUN_SEQUENCE: Array<COMPONENT> = [
  COMPONENT.PATTERN_MATCHING_STATION,
  COMPONENT.PATTERN_MATCHING_MEASURAND,
  COMPONENT.PATTERN_MATCHING_CALCULATION,
  COMPONENT.PATTERN_MATCHING_REPRESENTATION,
  COMPONENT.LANGUAGE_RECOGNITION,
  COMPONENT.TIME_RECOGNITION,
  COMPONENT.NER_AUTOML,
  COMPONENT.FUZZY_NER,
];
