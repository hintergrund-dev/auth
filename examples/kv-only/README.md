# KV-Only Example

Uses Cloudflare KV for both user storage and session management.

## Setup

1. Create KV namespaces:
```bash
wrangler kv:namespace create USERS
wrangler kv:namespace create SESSIONS
```

2. Update `wrangler.toml` with the namespace IDs

3. Set production secret:
```bash
wrangler secret put AUTH_SECRET
```

4. Install and run:
```bash
npm install
npm run dev
```

## Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | /register | Register new user |
| POST | /login | Login and create session |
| POST | /logout | Logout and clear session |
| GET | /me | Get current user (protected) |
| GET | /hash | Generate password hash |

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
