import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { config } from "../config.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function openDb() {
    mkdirSync(path.dirname(config.dbPath), { recursive: true });
    const db = new DatabaseSync(config.dbPath);
    const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    db.exec(schema);
    return db;
}
