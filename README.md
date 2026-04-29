# @hintergrund/auth

Lightweight authentication library for Cloudflare Workers and edge runtimes, featuring secure password hashing, JWT tokens, and session-based authentication.

## Features

- **Password Hashing**: PBKDF2-SHA256 with salt and secret (pepper)
- **JWT Tokens**: Stateless authentication with HMAC-SHA256
- **Session Tokens**: Stateful authentication with KV/database storage
- **Cookie Management**: Secure, HttpOnly cookie handling
- **Security First**: Constant-time comparisons, secure defaults
- **Lightweight**: Zero dependencies, uses Web Crypto API
- **Edge Ready**: Built for Cloudflare Workers and edge runtimes

## Installation

```bash
npm install @hintergrund/auth
```

## Quick Start

### JWT Authentication (Stateless)

```typescript
import { hashPassword, login, authMiddleware } from '@hintergrund/auth';

const secret = 'your-secret-key';

// Register: Hash password for storage
const hash = await hashPassword('user-password', secret);

// Login: Verify password and return JWT cookie
const response = await login('user-password', hash, secret, {
  exp: 60 * 60 * 24, // 24 hours
  payload: { userId: '123', role: 'admin' }
});

// Protect routes: Verify JWT token
const auth = await authMiddleware(request, secret);
if (!auth.authenticated) {
  return new Response('Unauthorized', { status: 401 });
}
console.log(auth.payload); // { userId: '123', role: 'admin', ... }
```

### Session Authentication (Stateful)

```typescript
import {
  hashPassword,
  sessionLogin,
  sessionMiddleware,
  createKVSessionStore
} from '@hintergrund/auth';

const secret = 'your-secret-key';
const store = createKVSessionStore(env.SESSIONS);

// Register: Hash password for storage
const hash = await hashPassword('user-password', secret);

// Login: Verify password and create session in KV
const response = await sessionLogin('user-password', hash, secret, store, {
  exp: 60 * 60 * 24, // 24 hours
  data: { userId: '123', role: 'admin' }
});

// Protect routes: Verify session token
const auth = await sessionMiddleware(request, store);
if (!auth.authenticated) {
  return new Response('Unauthorized', { status: 401 });
}
console.log(auth.data); // { userId: '123', role: 'admin' }
```

## JWT vs Session Authentication

| Feature | JWT (Stateless) | Session (Stateful) |
|---------|-----------------|-------------------|
| Storage | Token contains all data | Data stored in KV/DB |
| Revocation | Cannot revoke until expiry | Instant revocation |
| Scalability | No server state needed | Requires shared storage |
| Token size | Larger (contains payload) | Small (just ID) |
| Use case | APIs, microservices | Traditional web apps |

---

## API Reference

### Password Hashing

#### `generateRandomSecret(length?)`

Generates a cryptographically secure random secret.

```typescript
import { generateRandomSecret } from '@hintergrund/auth';

const secret = generateRandomSecret(); // 32 bytes default
const longSecret = generateRandomSecret(64); // 64 bytes
```

**Parameters**:
- `length` (number): Number of random bytes (default: 32)

**Returns**: `string` - Base64-encoded random secret

---

#### `hashPassword(password, secret, options?)`

Hashes a password using PBKDF2-SHA256 with salt and secret (pepper).

```typescript
import { hashPassword } from '@hintergrund/auth';

const hash = await hashPassword('user-password', 'your-secret-key');

// With custom iterations
const hash = await hashPassword('user-password', 'your-secret-key', {
  iterations: 100000 // default: 50000
});
```

**Parameters**:
- `password` (string): Plain text password
- `secret` (string): Secret key (pepper) for additional security
- `options` (HashOptions): Optional configuration

**HashOptions**:
- `iterations` (number): PBKDF2 iterations (default: 50000)

**Returns**: `Promise<string>` - Base64-encoded hash (includes iterations + salt + hash)

---

#### `verifyPassword(password, secret, storedHash)`

Verifies a password against a stored hash using constant-time comparison.

```typescript
import { verifyPassword } from '@hintergrund/auth';

const isValid = await verifyPassword('user-password', 'your-secret-key', storedHash);
```

**Parameters**:
- `password` (string): Plain text password to verify
- `secret` (string): Secret key used during hashing
- `storedHash` (string): Base64-encoded hash from storage

**Returns**: `Promise<boolean>` - True if password matches

---

### JWT Functions

#### `signJwt(secret, exp?, payload?)`

Signs a JWT token with the given secret and payload.

```typescript
import { signJwt } from '@hintergrund/auth';

const token = await signJwt('your-secret-key', 60 * 60 * 24, {
  userId: '123',
  role: 'admin'
});
```

**Parameters**:
- `secret` (string): Secret key for signing
- `exp` (number): Expiration time in seconds (default: 86400)
- `payload` (object): Additional payload data (default: {})

**Returns**: `Promise<string>` - Signed JWT token

---

#### `verifyJwt(token, secret)`

Verifies a JWT token's signature and expiration.

```typescript
import { verifyJwt } from '@hintergrund/auth';

const isValid = await verifyJwt(token, 'your-secret-key');
```

**Parameters**:
- `token` (string): JWT token string
- `secret` (string): Secret key used for signing

**Returns**: `Promise<boolean>` - True if token is valid and not expired

---

#### `decodeJwt(token)`

Decodes a JWT token without verifying its signature.

> **Warning**: Always verify the token with `verifyJwt()` before trusting the payload!

```typescript
import { decodeJwt } from '@hintergrund/auth';

const { header, payload } = decodeJwt(token);
```

**Parameters**:
- `token` (string): JWT token string

**Returns**: `DecodedJwt` - Object with `header` and `payload` properties

---

### JWT Authentication

#### `login(password, storedHash, secret, options?)`

Handles password-based login with JWT token generation.

```typescript
import { login } from '@hintergrund/auth';

const response = await login('user-password', storedHash, 'your-secret-key', {
  redirect: 'dashboard',
  exp: 60 * 60 * 24 * 7, // 7 days
  payload: { userId: '123', email: 'user@example.com' },
  cookieName: 'token',
  cookiePath: '/',
  cookieDomain: 'example.com',
  sameSite: 'Strict'
});
```

**Parameters**:
- `password` (string): Plain text password provided by user
- `storedHash` (string): Stored password hash from database
- `secret` (string): Secret key for password verification and JWT signing
- `options` (LoginOptions): Optional configuration

**LoginOptions**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redirect` | string | - | Redirect path after login |
| `exp` | number | 86400 | Token expiration in seconds |
| `payload` | object | {} | Additional JWT payload data |
| `cookieName` | string | 'token' | Cookie name |
| `cookiePath` | string | '/' | Cookie path |
| `cookieDomain` | string | - | Cookie domain |
| `sameSite` | 'Strict' \| 'Lax' \| 'None' | 'Strict' | SameSite attribute |

**Returns**: `Promise<Response>` - Response with Set-Cookie header or 401 error

---

#### `logout(options?)`

Handles user logout by clearing the auth cookie.

```typescript
import { logout } from '@hintergrund/auth';

const response = logout({
  redirect: '/login',
  cookieName: 'token'
});
```

**LogoutOptions**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redirect` | string | '/' | Redirect path after logout |
| `cookieName` | string | 'token' | Cookie name |
| `cookiePath` | string | '/' | Cookie path |
| `cookieDomain` | string | - | Cookie domain |

**Returns**: `Response` - Response with cleared cookie

---

#### `authMiddleware(request, secret, options?)`

Middleware function to verify JWT token from cookie.

```typescript
import { authMiddleware } from '@hintergrund/auth';

const auth = await authMiddleware(request, 'your-secret-key', {
  cookieName: 'token'
});

if (auth.authenticated) {
  console.log('User:', auth.payload);
}
```

**MiddlewareOptions**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cookieName` | string | 'token' | Cookie name to read token from |

**Returns**: `Promise<AuthResult>`

**AuthResult**:
- `authenticated` (boolean): Whether authentication was successful
- `payload` (JwtPayload): Decoded JWT payload if authenticated

---

### Session Authentication

#### `generateSessionToken()`

Generates a cryptographically secure session token.

```typescript
import { generateSessionToken } from '@hintergrund/auth';

const token = generateSessionToken(); // URL-safe base64, 32 bytes
```

**Returns**: `string` - URL-safe base64 session token

---

#### `createKVSessionStore(kv, prefix?)`

Creates a session store backed by Cloudflare KV.

```typescript
import { createKVSessionStore } from '@hintergrund/auth';

const store = createKVSessionStore(env.SESSIONS, 'session:');
```

**Parameters**:
- `kv` (KVNamespace): Cloudflare KV namespace
- `prefix` (string): Key prefix for sessions (default: 'session:')

**Returns**: `SessionStore` - Session store implementation

---

#### `sessionLogin(password, storedHash, secret, store, options?)`

Handles password-based login with session token generation.

```typescript
import { sessionLogin, createKVSessionStore } from '@hintergrund/auth';

const store = createKVSessionStore(env.SESSIONS);

const response = await sessionLogin(
  'user-password',
  storedHash,
  'your-secret-key',
  store,
  {
    exp: 60 * 60 * 24, // 24 hours
    data: { userId: '123', role: 'admin' },
    cookieName: 'session',
    sameSite: 'Strict'
  }
);
```

**SessionLoginOptions**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redirect` | string | - | Redirect path after login |
| `exp` | number | 86400 | Session expiration in seconds |
| `data` | SessionData | {} | Session data to store |
| `cookieName` | string | 'session' | Cookie name |
| `cookiePath` | string | '/' | Cookie path |
| `cookieDomain` | string | - | Cookie domain |
| `sameSite` | 'Strict' \| 'Lax' \| 'None' | 'Strict' | SameSite attribute |

**Returns**: `Promise<Response>` - Response with Set-Cookie header or 401 error

---

#### `sessionLogout(request, store, options?)`

Handles logout by clearing the session from storage and cookie.

```typescript
import { sessionLogout, createKVSessionStore } from '@hintergrund/auth';

const store = createKVSessionStore(env.SESSIONS);
const response = await sessionLogout(request, store, {
  redirect: '/login'
});
```

**SessionLogoutOptions**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redirect` | string | '/' | Redirect path after logout |
| `cookieName` | string | 'session' | Cookie name |
| `cookiePath` | string | '/' | Cookie path |
| `cookieDomain` | string | - | Cookie domain |

**Returns**: `Promise<Response>` - Response with cleared cookie

---

#### `sessionMiddleware(request, store, options?)`

Middleware function to verify session token from cookie.

```typescript
import { sessionMiddleware, createKVSessionStore } from '@hintergrund/auth';

const store = createKVSessionStore(env.SESSIONS);
const auth = await sessionMiddleware(request, store, {
  cookieName: 'session'
});

if (auth.authenticated) {
  console.log('Session data:', auth.data);
  console.log('Session token:', auth.token);
}
```

**SessionMiddlewareOptions**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cookieName` | string | 'session' | Cookie name to read token from |

**Returns**: `Promise<SessionAuthResult>`

**SessionAuthResult**:
- `authenticated` (boolean): Whether authentication was successful
- `data` (SessionData): Session data if authenticated
- `token` (string): Session token if authenticated

---

### Custom Session Store

Implement the `SessionStore` interface for custom storage (database, Redis, etc.):

```typescript
import type { SessionStore, SessionData } from '@hintergrund/auth';

const customStore: SessionStore = {
  async get(token: string): Promise<SessionData | null> {
    // Fetch from your database
    const row = await db.query('SELECT data FROM sessions WHERE token = ?', [token]);
    return row ? JSON.parse(row.data) : null;
  },

  async set(token: string, data: SessionData, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    await db.query(
      'INSERT INTO sessions (token, data, expires_at) VALUES (?, ?, ?)',
      [token, JSON.stringify(data), expiresAt]
    );
  },

  async delete(token: string): Promise<void> {
    await db.query('DELETE FROM sessions WHERE token = ?', [token]);
  }
};
```

---

### Utility Functions

#### `readRequestBody(request)`

Parses request body from JSON or form data.

```typescript
import { readRequestBody } from '@hintergrund/auth';

const body = await readRequestBody(request);
// body.email, body.password, etc.
```

**Supported Content-Types**:
- `application/json`
- `application/x-www-form-urlencoded`
- `multipart/form-data`

**Returns**: `Promise<Record<string, unknown>>`

**Throws**: Error if Content-Type is not supported

---

#### `readCookie(request, name)`

Reads a cookie value from request headers.

```typescript
import { readCookie } from '@hintergrund/auth';

const token = readCookie(request, 'session');
```

**Returns**: `string | null` - Cookie value or null if not found

---

## Examples

Complete working examples for different storage configurations:

| Example | User Storage | Session Storage | Use Case |
|---------|--------------|-----------------|----------|
| [kv-only](./examples/kv-only) | KV | KV | Simple apps, prototypes |
| [d1-only](./examples/d1-only) | D1 | D1 | Relational data, complex queries |
| [d1-with-kv-sessions](./examples/d1-with-kv-sessions) | D1 | KV | Best of both: relational users, fast sessions |

### Quick Start

```bash
cd examples/kv-only
npm install
npm run dev
```

### Which Example to Use?

- **kv-only**: Simplest setup, good for small apps and prototypes
- **d1-only**: Need relational queries, foreign keys, or complex user data
- **d1-with-kv-sessions**: Production apps needing both relational data and fast session lookups

---

## TypeScript Support

Full type definitions included:

```typescript
import type {
  // JWT types
  JwtPayload,
  JwtHeader,
  DecodedJwt,
  // JWT auth types
  LoginOptions,
  LogoutOptions,
  MiddlewareOptions,
  AuthResult,
  // Session types
  SessionStore,
  SessionData,
  SessionLoginOptions,
  SessionLogoutOptions,
  SessionMiddlewareOptions,
  SessionAuthResult,
  // Crypto types
  HashOptions,
} from '@hintergrund/auth';
```

---

## Security Considerations

### Password Hashing

- Uses PBKDF2-SHA256 with 50,000 iterations (configurable)
- Random 16-byte salt per password
- Secret (pepper) adds additional security layer
- Constant-time comparison prevents timing attacks

### JWT Security

- Signature verified before checking expiration (prevents timing attacks)
- HMAC-SHA256 signing algorithm
- Secure cookie defaults (HttpOnly, Secure, SameSite=Strict)

### Session Security

- 256-bit cryptographically random tokens
- Server-side storage prevents token tampering
- Immediate revocation on logout
- Automatic expiration via KV TTL

### Production Checklist

- Use strong, randomly generated secrets (`generateRandomSecret()`)
- Store secrets in environment variables
- Use HTTPS (Cloudflare handles this)
- Implement rate limiting for auth endpoints
- Set appropriate expiration times
- Consider CSRF protection for web apps
- Regularly rotate secrets

---

## License

MIT

## Author

[hintergrund.dev](https://hintergrund.dev)
