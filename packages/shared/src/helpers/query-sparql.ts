import SparqlClient from "sparql-http-client";
import internal from "stream";

/**
 * Transforms a stream to a promise
 * @param stream the stream to transform
 * @returns the result of the stream as a promise
 */
const streamToPromise = <T>(stream: internal.Readable): Promise<Array<T>> => {
  // eslint-disable-next-line
  return new Promise<Array<any>>((resolve, reject) => {
    const result: Array<T> = [];
    // eslint-disable-next-line
    stream.on("data", (row: any) => result.push(row));

    stream.on("end", () => resolve(result));

    stream.on("error", (error) => reject(error));
  });
};

/**
 * Queries a sparql endpoint with the given select query
 * @param endpointUrl the sparql endpoint to query
 * @param query the select query to execute
 * @returns the result of the query
 */
export const selectSparql = async <T>(endpointUrl: string, query: string): Promise<Array<T>> => {
  const client: SparqlClient = new SparqlClient({ endpointUrl });
  const stream: internal.Readable = await client.query.select(query);

  return await streamToPromise<T>(stream);
};

/**
 * Queries a sparql endpoint with the given ask query
 * @param endpointUrl the sparql endpoint to query
 * @param query the ask query to execute
 * @returns the result of the query
 */
export const askSparql = async (endpointUrl: string, query: string): Promise<boolean> => {
  const client: SparqlClient = new SparqlClient({ endpointUrl });

  return await client.query.ask(query);
};

/**
 * Queries a sparql endpoint with the given update query
 * @param endpointUrl the sparql endpoint to query
 * @param query the update query to execute
 */
export const updateSparql = async (endpointUrl: string, query: string): Promise<void> => {
  const client: SparqlClient = new SparqlClient({ updateUrl: endpointUrl });
  await client.query.update(query);
};
