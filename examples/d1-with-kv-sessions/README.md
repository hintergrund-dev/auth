# D1 + KV Sessions Example

Uses Cloudflare D1 for user storage and KV for session management.
Best of both worlds: relational data for users, fast KV for sessions.

## Why This Setup?

- **D1 for Users**: Relational data, complex queries, ACID transactions
- **KV for Sessions**: Ultra-fast reads, automatic TTL expiration, global distribution

## Setup

1. Create D1 database:
```bash
wrangler d1 create auth-db
```

2. Create KV namespace:
```bash
wrangler kv:namespace create SESSIONS
```

3. Update `wrangler.toml` with the IDs

4. Run migrations:
```bash
npm run db:migrate        # Local
npm run db:migrate:prod   # Production
```

5. Set production secret:
```bash
wrangler secret put AUTH_SECRET
```

6. Install and run:
```bash
npm install
npm run dev
```

## Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
```

Sessions are stored in KV with automatic TTL expiration.

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

## Advantages

1. **Fast Session Lookups**: KV is optimized for key-value access
2. **Automatic Expiration**: KV TTL handles session cleanup
3. **Scalable**: Both D1 and KV scale independently
4. **Flexible**: Easy to add user-related tables to D1
