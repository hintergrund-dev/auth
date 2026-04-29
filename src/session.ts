/**
 * Session-based authentication using server-side storage (KV, database, etc.).
 * Sessions are more secure than JWTs as they can be revoked immediately.
 */

import { verifyPassword } from './crypto';
import { readCookie } from './request';
import { buildCookieString, buildExpiredCookieString } from './internal/cookie';
import type {
	SessionStore,
	SessionData,
	SessionLoginOptions,
	SessionLogoutOptions,
	SessionMiddlewareOptions,
	SessionAuthResult
} from './types';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours in seconds
const DEFAULT_COOKIE_NAME = 'session';
const DEFAULT_COOKIE_PATH = '/';
const TOKEN_LENGTH = 32; // 256 bits

// =============================================================================
// Public API
// =============================================================================

/**
 * Generates a cryptographically secure session token.
 *
 * @returns URL-safe base64 session token
 */
export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_LENGTH));
	return bytesToBase64Url(bytes);
}

/**
 * Handles password-based login with session token generation.
 *
 * @param password - Plain text password provided by user
 * @param storedHash - Stored password hash from database
 * @param secret - Secret key for password verification
 * @param store - Session store implementation (KV, database, etc.)
 * @param options - Login options
 * @returns Response with Set-Cookie header on success, or 401 error on failure
 */
export async function sessionLogin(
	password: string,
	storedHash: string,
	secret: string,
	store: SessionStore,
	options: SessionLoginOptions = {}
): Promise<Response> {
	const {
		redirect,
		exp = DEFAULT_EXPIRATION,
		data = {},
		cookieName = DEFAULT_COOKIE_NAME,
		cookiePath = DEFAULT_COOKIE_PATH,
		cookieDomain,
		sameSite = 'Strict'
	} = options;

	// Verify password
	const isValid = await verifyPassword(password, secret, storedHash);

	if (!isValid) {
		return jsonResponse({ error: 'Invalid credentials' }, 401);
	}

	// Generate session token
	const token = generateSessionToken();

	// Store session data
	await store.set(token, data, exp);

	// Build cookie
	const cookie = buildCookieString(token, cookieName, {
		path: cookiePath,
		domain: cookieDomain,
		maxAge: exp,
		sameSite
	});

	// Build response headers
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		'Set-Cookie': cookie
	};

	if (redirect) {
		headers['Location'] = normalizeRedirectPath(redirect);
	}

	return new Response(JSON.stringify({ success: true, message: 'Logged in successfully' }), {
		status: 200,
		headers
	});
}

/**
 * Handles session logout by clearing the session from storage and cookie.
 *
 * @param request - Incoming request (to read current session token)
 * @param store - Session store implementation
 * @param options - Logout options
 * @returns Response with cleared cookie and optional redirect
 */
export async function sessionLogout(
	request: Request,
	store: SessionStore,
	options: SessionLogoutOptions = {}
): Promise<Response> {
	const {
		redirect = '/',
		cookieName = DEFAULT_COOKIE_NAME,
		cookiePath = DEFAULT_COOKIE_PATH,
		cookieDomain
	} = options;

	// Get current session token and delete from store
	const token = readCookie(request, cookieName);
	if (token) {
		await store.delete(token);
	}

	// Build expired cookie to clear it
	const cookie = buildExpiredCookieString(cookieName, {
		path: cookiePath,
		domain: cookieDomain
	});

	return new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Set-Cookie': cookie,
			Location: normalizeRedirectPath(redirect)
		}
	});
}

/**
 * Middleware function to verify session token from cookie.
 *
 * @param request - Incoming request
 * @param store - Session store implementation
 * @param options - Middleware options
 * @returns Authentication result with status and session data
 */
export async function sessionMiddleware(
	request: Request,
	store: SessionStore,
	options: SessionMiddlewareOptions = {}
): Promise<SessionAuthResult> {
	const { cookieName = DEFAULT_COOKIE_NAME } = options;

	const token = readCookie(request, cookieName);

	if (!token) {
		return { authenticated: false };
	}

	const data = await store.get(token);

	if (!data) {
		return { authenticated: false };
	}

	return {
		authenticated: true,
		data,
		token
	};
}

/**
 * KV-like interface for session storage
 */
interface KVLike {
	get(key: string, type: 'json'): Promise<unknown>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
	delete(key: string): Promise<void>;
}

/**
 * Creates a KV-based session store.
 *
 * @param kv - Cloudflare KV namespace (or compatible interface)
 * @param prefix - Key prefix for session entries (default: 'session:')
 * @returns SessionStore implementation
 */
export function createKVSessionStore(
	kv: KVLike,
	prefix = 'session:'
): SessionStore {
	return {
		async get(token: string): Promise<SessionData | null> {
			const data = await kv.get(`${prefix}${token}`, 'json');
			return data as SessionData | null;
		},
		async set(token: string, data: SessionData, ttl?: number): Promise<void> {
			await kv.put(`${prefix}${token}`, JSON.stringify(data), {
				expirationTtl: ttl
			});
		},
		async delete(token: string): Promise<void> {
			await kv.delete(`${prefix}${token}`);
		}
	};
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Creates a JSON response with proper headers
 */
function jsonResponse(data: Record<string, unknown>, status: number): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

/**
 * Normalizes a redirect path to ensure it starts with /
 */
function normalizeRedirectPath(path: string): string {
	if (!path) return '/';
	return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Converts Uint8Array to URL-safe base64
 */
function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
