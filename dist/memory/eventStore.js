export class EventStore {
    db;
    constructor(db) {
        this.db = db;
    }
    record(sessionId, stage, attemptNumber, agentOutput, verdict) {
        this.db
            .prepare(`INSERT INTO stage_runs
           (session_id, stage, attempt_number, agent_output_json, argus_score, argus_decision, argus_feedback_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(sessionId, stage, attemptNumber, JSON.stringify(agentOutput), verdict.score, verdict.decision, JSON.stringify({
            strengths: verdict.strengths,
            weaknesses: verdict.weaknesses,
            recommendations: verdict.recommendations,
        }));
    }
    forSession(sessionId) {
        return this.db
            .prepare(`SELECT * FROM stage_runs WHERE session_id = ? ORDER BY id ASC`)
            .all(sessionId);
    }
}
