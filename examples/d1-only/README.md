# D1-Only Example

Uses Cloudflare D1 (SQLite) for both user storage and session management.
Best for applications needing relational data and complex queries.

## Setup

1. Create D1 database:
```bash
wrangler d1 create auth-db
```

2. Update `wrangler.toml` with the database ID

3. Run migrations:
```bash
npm run db:migrate        # Local
npm run db:migrate:prod   # Production
```

4. Set production secret:
```bash
wrangler secret put AUTH_SECRET
```

5. Install and run:
```bash
npm install
npm run dev
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- Sessions table
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | /register | Register new user |
| POST | /login | Login and create session |
| POST | /logout | Logout and clear session |
| GET | /me | Get current user (protected) |

## Usage

```bash
# Register
curl -X POST http://localhost:8787/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:8787/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}' \
  -c cookies.txt

# Access protected route
curl http://localhost:8787/me -b cookies.txt

# Logout
curl -X POST http://localhost:8787/logout -b cookies.txt
```

## Session Cleanup

Sessions are stored with an `expires_at` timestamp. Run periodic cleanup:

```sql
DELETE FROM sessions WHERE expires_at < unixepoch();
```

Or use a scheduled worker (Cron Trigger).
