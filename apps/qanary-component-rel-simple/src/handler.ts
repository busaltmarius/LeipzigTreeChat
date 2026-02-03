import type {IQanaryComponentMessageHandler} from "@leipzigtreechat/qanary-component-core";
import {createAnnotationInKnowledgeGraph, type IAnnotationInformation} from "@leipzigtreechat/qanary-component-helpers";
import {getQuestion, type IQanaryMessage, QANARY_PREFIX} from "@leipzigtreechat/shared";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
    console.log(message);

    const question = await getQuestion(message);
    if (!question) {
        console.warn("No question found in message.");
        return message;
    }
    console.log("Question:", question);

    const relAnnotations: Array<IAnnotationInformation> = await getRelAnnotations(question);
    console.log(`Relation for question '${question}':`, relAnnotations);

    for (const annotation of relAnnotations) {
        await createAnnotationInKnowledgeGraph({
            message: message,
            componentName: "qanary-component-rel-simple",
            annotation,
            annotationType: `${QANARY_PREFIX}AnnotationOfRel`,
        })
    }

    return message;
};

const getRelAnnotations = async (question: string): Promise<Array<IAnnotationInformation>> => {
    switch (question) {
        case "Wie viel wurde im Stadtteil Connewitz gegossen?":
            return [
                {
                    value: JSON.stringify({
                        relation: "gegossen in",
                        predicate: "<urn:de:leipzig:trees:vocab:leipziggiesst_2021:wassersumme>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "gegossen in",
                        predicate: "<urn:de:leipzig:trees:vocab:leipziggiesst_2022:wassersumme>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "gegossen in",
                        predicate: "<urn:de:leipzig:trees:vocab:leipziggiesst_2023:wassersumme>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "gegossen in",
                        predicate: "<urn:de:leipzig:trees:vocab:leipziggiesst_2024:wassersumme>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "gegossen in",
                        predicate: "<urn:de:leipzig:trees:vocab:leipziggiesst_2023:wassersumme>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "zugehöriger Ortsteil",
                        predicate: "<urn:de:leipzig:trees:vocab:baumkataster:ot>"
                    }),
                    confidence: 1
                },
            ]
        case "Welche Wasserentnahmestellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?":
            return [
                {
                    value: JSON.stringify({
                        relation: "in der Nähe von",
                        predicate: "<http://www.w3.org/2003/01/geo/wgs84_pos#lat>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "in der Nähe von",
                        predicate: "<http://www.w3.org/2003/01/geo/wgs84_pos#long>"
                    }),
                    confidence: 1
                },
            ]
        case "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?":
            return [
                {
                    value: JSON.stringify({
                        relation: "in der Nähe von",
                        predicate: "<http://www.w3.org/2003/01/geo/wgs84_pos#lat>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "in der Nähe von",
                        predicate: "<http://www.w3.org/2003/01/geo/wgs84_pos#long>"
                    }),
                    confidence: 1
                },
                {
                    value: JSON.stringify({
                        relation: "braucht Bewässerung",
                        predicate: "<urn:de:leipzig:trees:vocab:baumkataster:letzte_bewaesserung>"
                    }),
                    confidence: 1
                },
            ]
        case "Was kannst du mir über die Bäume in Leipzig erklären?":
            return [
                {
                    value: JSON.stringify({
                        relation: "in der Nähe von",
                        predicate: "<urn:de:leipzig:trees:vocab:baumkataster:Tree>"
                    }),
                    confidence: 1
                },
            ]
        default:
            console.warn("Unrecognized question:", question);
            return []
    }
};
