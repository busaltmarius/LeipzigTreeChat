import { createServer, type Server } from "net";

/**
 * A function that determines the next free port starting from a given port.
 * @param port start port
 */
export const getPort = (port = 40500) => {
  const server: Server = createServer();

  return new Promise<number>((resolve, reject) =>
    server
      .on("error", (error: { code: string }) => {
        error.code === "EADDRINUSE" ? server.listen(++port) : reject(error);
      })
      .on("listening", () => server.close(() => resolve(port)))
      .listen(port)
  );
};
