import { fileURLToPath } from "node:url";
import { startServer } from "./server.mjs";
import { getDefaultDatabasePath } from "./db.mjs";

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const port = Number(process.env.PORT || 3001);
  const databasePath = getDefaultDatabasePath();

  startServer({ port, dbPath: databasePath }).then((server) => {
    const address = server.address();
    const resolvedPort = typeof address === "object" && address ? address.port : port;
    console.log(`API running at http://localhost:${resolvedPort}`);
    console.log(`Database path: ${databasePath}`);
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
