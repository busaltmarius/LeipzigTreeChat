import { BlankNode, Literal, NamedNode } from "rdf-js";

/**
 * The qanary raw annotations received by querying the sparql endpoint
 */
export interface IRawAnnotation {
  /** the annotation node */
  annotation: NamedNode;
  /** the type of annotation, e.g AnnotationOfAnswer */
  annotationType: NamedNode;
  /** the target node of the annotation */
  target: BlankNode;
  /** the body/value of the annotation */
  body: Literal;
  /** the score/confidence of the annotation */
  score: Literal;
  /** the component that created the annotation */
  annotatedBy: NamedNode;
  /** the time when the annotation was created */
  annotatedAt: Literal;
}

/** The qanary annotation interface  */
export interface IQanaryAnnotation {
  /** the type of annotation, e.g AnnotationAnswer */
  annotationType: string;
  /** the target of the annotation */
  hasTarget: string;
  /** the body/value of the annotation*/
  hasBody: string;
  /** the time when the annotation was created */
  annotatedAt: string;
  /** the component that created the annotation */
  annotatedBy: string;
  /** the score/confidence of the annotation */
  score: number;
}

/**
 * The filtered annotations by domain.
 */
export interface IFilteredAnnotations {
  /** annotations of the domain station */
  stationAnnotation: Array<IQanaryAnnotation>;
  /** annotations of the domain measurand */
  measurandAnnotation: Array<IQanaryAnnotation>;
  /** annotations of the domain representation */
  representationAnnotation: Array<IQanaryAnnotation>;
  /** annotations of the domain calculation */
  calculationAnnotation: Array<IQanaryAnnotation>;
  /** annotations of the domain time */
  timeAnnotation: Array<IQanaryAnnotation>;
}

/**
 * The time object consisting of start and optional end time of an AnnotationOfTime.
 */
export interface ITimeObject {
  /** recognized start date */
  start: string;
  /** recognized end date */
  end?: string;
}
