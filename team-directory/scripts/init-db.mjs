import { ensureDatabase, getDefaultDatabasePath } from "../api/src/db.mjs";

const dbPath = getDefaultDatabasePath();
const db = ensureDatabase(dbPath);
db.close();
console.log(`Database ready at ${dbPath}`);
