/**
 * KV-Only Example
 *
 * Uses Cloudflare KV for both user storage and session management.
 * Simple and fast, ideal for smaller applications.
 */

import {
	hashPassword,
	sessionLogin,
	sessionLogout,
	sessionMiddleware,
	createKVSessionStore,
	readRequestBody
} from '@hintergrund/auth';

interface Env {
	AUTH_SECRET: string;
	USERS: KVNamespace;
	SESSIONS: KVNamespace;
}

interface User {
	email: string;
	hash: string;
	createdAt: number;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const store = createKVSessionStore(env.SESSIONS);

		// POST /register - Create new user
		if (url.pathname === '/register' && request.method === 'POST') {
			const body = await readRequestBody(request);
			const email = body.email as string;
			const password = body.password as string;

			if (!email || !password) {
				return json({ error: 'Email and password required' }, 400);
			}

			// Check if user exists
			const existing = await env.USERS.get(email);
			if (existing) {
				return json({ error: 'User already exists' }, 409);
			}

			// Hash password and store user
			const hash = await hashPassword(password, env.AUTH_SECRET);
			const user: User = { email, hash, createdAt: Date.now() };
			await env.USERS.put(email, JSON.stringify(user));

			return json({ success: true, message: 'User registered' }, 201);
		}

		// POST /login - Authenticate and create session
		if (url.pathname === '/login' && request.method === 'POST') {
			const body = await readRequestBody(request);
			const email = body.email as string;
			const password = body.password as string;

			if (!email || !password) {
				return json({ error: 'Email and password required' }, 400);
			}

			// Get user from KV
			const userData = await env.USERS.get(email);
			if (!userData) {
				return json({ error: 'Invalid credentials' }, 401);
			}

			const user: User = JSON.parse(userData);

			// Verify password and create session
			return sessionLogin(password, user.hash, env.AUTH_SECRET, store, {
				exp: 60 * 60 * 24 * 7, // 7 days
				data: { email: user.email }
			});
		}

		// POST /logout - Clear session
		if (url.pathname === '/logout' && request.method === 'POST') {
			return sessionLogout(request, store);
		}

		// GET /me - Protected route
		if (url.pathname === '/me') {
			const auth = await sessionMiddleware(request, store);

			if (!auth.authenticated) {
				return json({ error: 'Unauthorized' }, 401);
			}

			return json({
				authenticated: true,
				user: auth.data
			});
		}

		// GET /hash - Generate password hash (utility)
		if (url.pathname === '/hash') {
			const password = url.searchParams.get('password');
			if (!password) {
				return json({ error: 'Missing password param' }, 400);
			}

			const hash = await hashPassword(password, env.AUTH_SECRET);
			return json({ hash });
		}

		// Home
		if (url.pathname === '/') {
			return new Response(
				`KV-Only Auth Example

POST /register  - Register {"email", "password"}
POST /login     - Login {"email", "password"}
POST /logout    - Logout
GET  /me        - Get current user (protected)
GET  /hash?password=xxx - Generate hash
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
