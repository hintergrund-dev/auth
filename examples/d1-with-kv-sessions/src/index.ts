/**
 * D1 + KV Sessions Example
 *
 * Uses D1 for user storage and KV for session management.
 * Best of both worlds: relational data for users, fast KV for sessions.
 */

import {
	hashPassword,
	verifyPassword,
	generateSessionToken,
	sessionMiddleware,
	createKVSessionStore,
	readRequestBody,
	readCookie,
	type SessionData
} from '@hintergrund/auth';
import { buildCookieString, buildExpiredCookieString } from './cookie';

interface Env {
	AUTH_SECRET: string;
	DB: D1Database;
	SESSIONS: KVNamespace;
}

interface User {
	id: number;
	email: string;
	password_hash: string;
	created_at: number;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const sessionStore = createKVSessionStore(env.SESSIONS);

		// POST /register - Create new user in D1
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

		// POST /login - Authenticate with D1, create session in KV
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

			// Create session in KV
			const token = generateSessionToken();
			const exp = 60 * 60 * 24 * 7; // 7 days
			const sessionData: SessionData = { userId: user.id, email: user.email };

			await sessionStore.set(token, sessionData, exp);

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

		// POST /logout - Clear session from KV
		if (url.pathname === '/logout' && request.method === 'POST') {
			const token = readCookie(request, 'session');
			if (token) {
				await sessionStore.delete(token);
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

		// GET /me - Protected route (session from KV, user from D1)
		if (url.pathname === '/me') {
			const auth = await sessionMiddleware(request, sessionStore);

			if (!auth.authenticated) {
				return json({ error: 'Unauthorized' }, 401);
			}

			// Get full user data from D1
			const user = await env.DB.prepare('SELECT id, email, created_at FROM users WHERE id = ?')
				.bind((auth.data as { userId: number }).userId)
				.first<Omit<User, 'password_hash'>>();

			if (!user) {
				return json({ error: 'User not found' }, 404);
			}

			return json({
				authenticated: true,
				user,
				sessionToken: auth.token?.slice(0, 8) + '...'
			});
		}

		// Home
		if (url.pathname === '/') {
			return new Response(
				`D1 + KV Sessions Auth Example

D1: User storage (relational)
KV: Session storage (fast, auto-expiring)

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
