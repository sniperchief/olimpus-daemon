import { config } from "./config.js";
import { openDb } from "./memory/db.js";
import { startServer } from "./server.js";
const db = openDb();
startServer(db, config.port);
