-- Users table (sessions are stored in KV)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for user email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
