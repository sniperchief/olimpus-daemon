import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import { createInitialMemory, } from "./types.js";
export class SessionStore {
    db;
    constructor(db) {
        this.db = db;
    }
    create(founderInput) {
        const id = randomUUID();
        const memory = createInitialMemory(founderInput);
        this.db
            .prepare(`INSERT INTO sessions (id, status, current_stage, memory_json, founder_input_json)
         VALUES (?, ?, ?, ?, ?)`)
            .run(id, "submitted", "athena", JSON.stringify(memory), JSON.stringify(founderInput));
        return this.get(id);
    }
    get(id) {
        const row = this.db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id);
        if (!row)
            throw new NotFoundError(`Session not found: ${id}`);
        return row;
    }
    getMemory(id) {
        return JSON.parse(this.get(id).memory_json);
    }
    updateStatus(id, status, errorMessage) {
        this.db
            .prepare(`UPDATE sessions SET status = ?, error_message = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`)
            .run(status, errorMessage ?? null, id);
    }
    saveMemory(id, memory, currentStage) {
        this.db
            .prepare(`UPDATE sessions SET memory_json = ?, current_stage = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`)
            .run(JSON.stringify(memory), currentStage, id);
    }
    setCurrentStage(id, currentStage) {
        this.db
            .prepare(`UPDATE sessions SET current_stage = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`)
            .run(currentStage, id);
    }
}
