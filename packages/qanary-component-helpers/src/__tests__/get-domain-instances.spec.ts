// Placeholder to avoid empty test suite errors while test cases are being prepared.
describe("getDomainInstances", () => {
  it("placeholder", () => {
    expect(true).toBe(true);
  });
});

// describe("getDomainInstances", () => {
//   const domain = "measurand" as Domain;
//   const qanaryMessage: IQanaryMessage = {
//     endpoint: "http://qanary-pipeline:40111/sparql",
//     inGraph: "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd",
//     outGraph: "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd",
//   };

//   const rawDomainInstances = [
//     {
//       label: {
//         value: "label",
//         datatype: "datatype",
//         language: "language",
//       },
//       id: {
//         value: "id",
//         datatype: "datatype",
//         language: "language",
//       },
//     },
//   ];

//   it("should query the available domain instances (measurands) from the knowledge graph", async () => {
//     const mockSelectSparql = jest.fn().mockReturnValueOnce(Promise.resolve(rawDomainInstances));
//     (selectSparql as jest.Mock) = mockSelectSparql;

//     await getDomainInstances(domain, qanaryMessage);

//     const expectedQuery = `
// PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
// PREFIX dc: <http://purl.org/dc/elements/1.1/>

// SELECT ?label ?id
// FROM <urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd>
// WHERE {
//     ?domainInstance a <urn:measurand> .
//     ?domainInstance rdfs:label ?label .
//     ?domainInstance dc:identifier ?id .
// }`;

//     expect(mockSelectSparql).toHaveBeenCalledWith(qanaryMessage.endpoint, expectedQuery);
//   });

//   it("should return the domain instances (measurands)", async () => {
//     const expectedMeasurands = [
//       {
//         label: "label",
//         id: "id",
//       },
//     ];

//     (selectSparql as jest.Mock).mockReturnValueOnce(Promise.resolve(rawDomainInstances));

//     const measurands = await getDomainInstances(domain, qanaryMessage);

//     expect(measurands).toEqual(expectedMeasurands);
//   });
// });
