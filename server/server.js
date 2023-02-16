
import { connectDb, disconnectDb } from "./db";
import config from "./utils/config";
import logger from "./utils/logger";
import { server } from "./app";

process.on("SIGTERM", () => {
  socketServer.disconnectSockets();
  httpServer.close(() => disconnectDb());
});

server.on("listening", () => {
	const addr = server.address();
	const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
	logger.info("listening on: %s", bind);
});

connectDb().then(() => server.listen(config.port));



