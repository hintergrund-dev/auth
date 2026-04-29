/**
 * D1-Only Example
 *
 * Uses Cloudflare D1 (SQLite) for both user storage and session management.
 * Best for applications needing relational data and complex queries.
 */

import {
	hashPassword,
	verifyPassword,
	generateSessionToken,
	readRequestBody,
	readCookie,
	type SessionStore,
	type SessionData
} from '@hintergrund/auth';
import { buildCookieString, buildExpiredCookieString } from './cookie';

interface Env {
	AUTH_SECRET: string;
	DB: D1Database;
}

interface User {
	id: number;
	email: string;
	password_hash: string;
	created_at: number;
}

// Create a D1-based session store
function createD1SessionStore(db: D1Database): SessionStore {
	return {
		async get(token: string): Promise<SessionData | null> {
			const now = Math.floor(Date.now() / 1000);
			const row = await db
				.prepare('SELECT data FROM sessions WHERE token = ? AND expires_at > ?')
				.bind(token, now)
				.first<{ data: string }>();

			return row ? JSON.parse(row.data) : null;
		},

		async set(token: string, data: SessionData, ttl?: number): Promise<void> {
			const now = Math.floor(Date.now() / 1000);
			const expiresAt = ttl ? now + ttl : now + 86400;

			await db
				.prepare(
					`INSERT INTO sessions (token, user_id, data, expires_at, created_at)
					 VALUES (?, ?, ?, ?, ?)
					 ON CONFLICT(token) DO UPDATE SET data = ?, expires_at = ?`
				)
				.bind(
					token,
					(data as { userId?: number }).userId ?? 0,
					JSON.stringify(data),
					expiresAt,
					now,
					JSON.stringify(data),
					expiresAt
				)
				.run();
		},

		async delete(token: string): Promise<void> {
			await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
		}
	};
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const store = createD1SessionStore(env.DB);

		// POST /register - Create new user
		if (url.pathname === '/register' && request.method === 'POST') {
			const body = await readRequestBody(request);
			const email = body.email as string;
			const password = body.password as string;

			if (!email || !password) {
				return json({ error: 'Email and password required' }, 400);
			}

			// Check if user exists
			const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
				.bind(email)
				.first();

			if (existing) {
				return json({ error: 'User already exists' }, 409);
			}

			// Hash password and store user
			const hash = await hashPassword(password, env.AUTH_SECRET);
			const result = await env.DB.prepare(
				'INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id'
			)
				.bind(email, hash)
				.first<{ id: number }>();

			return json({ success: true, message: 'User registered', userId: result?.id }, 201);
		}

		// POST /login - Authenticate and create session
		if (url.pathname === '/login' && request.method === 'POST') {
			const body = await readRequestBody(request);
			const email = body.email as string;
			const password = body.password as string;

			if (!email || !password) {
				return json({ error: 'Email and password required' }, 400);
			}

			// Get user from D1
			const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
				.bind(email)
				.first<User>();

			if (!user) {
				return json({ error: 'Invalid credentials' }, 401);
			}

			// Verify password
			const valid = await verifyPassword(password, env.AUTH_SECRET, user.password_hash);
			if (!valid) {
				return json({ error: 'Invalid credentials' }, 401);
			}

			// Create session
			const token = generateSessionToken();
			const exp = 60 * 60 * 24 * 7; // 7 days
			const sessionData: SessionData = { userId: user.id, email: user.email };

			await store.set(token, sessionData, exp);

			const cookie = buildCookieString(token, 'session', {
				path: '/',
				maxAge: exp,
				sameSite: 'Strict'
			});

			return new Response(JSON.stringify({ success: true, message: 'Logged in' }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': cookie
				}
			});
		}

		// POST /logout - Clear session
		if (url.pathname === '/logout' && request.method === 'POST') {
			const token = readCookie(request, 'session');
			if (token) {
				await store.delete(token);
			}

			const cookie = buildExpiredCookieString('session', { path: '/' });

			return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': cookie
				}
			});
		}

		// GET /me - Protected route
		if (url.pathname === '/me') {
			const token = readCookie(request, 'session');

			if (!token) {
				return json({ error: 'Unauthorized' }, 401);
			}

			const data = await store.get(token);
			if (!data) {
				return json({ error: 'Session expired' }, 401);
			}

			// Get full user data
			const user = await env.DB.prepare('SELECT id, email, created_at FROM users WHERE id = ?')
				.bind((data as { userId: number }).userId)
				.first<Omit<User, 'password_hash'>>();

			return json({
				authenticated: true,
				user
			});
		}

		// Home
		if (url.pathname === '/') {
			return new Response(
				`D1-Only Auth Example

POST /register  - Register {"email", "password"}
POST /login     - Login {"email", "password"}
POST /logout    - Logout
GET  /me        - Get current user (protected)
`,
				{ headers: { 'Content-Type': 'text/plain' } }
			);
		}

		return json({ error: 'Not Found' }, 404);
	}
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}
