CREATE TABLE password_resets (
 token_hash TEXT PRIMARY KEY NOT NULL,
 user_id TEXT NOT NULL REFERENCES users(id),
 expires_at INTEGER NOT NULL,
 used_at TEXT,
 created_at TEXT NOT NULL
);
CREATE INDEX idx_password_reset_user ON password_resets(user_id, expires_at);
