PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sessions (
  id                 TEXT PRIMARY KEY,
  status             TEXT NOT NULL DEFAULT 'submitted',
  current_stage      TEXT NOT NULL DEFAULT 'athena',
  memory_json        TEXT NOT NULL,
  founder_input_json TEXT NOT NULL,
  error_message      TEXT,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS stage_runs (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id           TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  stage                TEXT NOT NULL,
  attempt_number       INTEGER NOT NULL,
  agent_output_json    TEXT NOT NULL,
  argus_score          INTEGER,
  argus_decision       TEXT,
  argus_feedback_json  TEXT,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_stage_runs_session ON stage_runs(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
