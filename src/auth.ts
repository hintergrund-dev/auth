/**
 * High-level authentication functions for login, logout, and middleware.
 */

import { verifyPassword } from './crypto';
import { signJwt, verifyJwt, decodeJwt } from './jwt';
import { readCookie } from './request';
import { buildCookieString, buildExpiredCookieString } from './internal/cookie';
import type { LoginOptions, LogoutOptions, MiddlewareOptions, AuthResult } from './types';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours in seconds
const DEFAULT_COOKIE_NAME = 'token';
const DEFAULT_COOKIE_PATH = '/';

// =============================================================================
// Public API
// =============================================================================

/**
 * Handles password-based login with JWT token generation.
 *
 * @param password - Plain text password provided by user
 * @param storedHash - Stored password hash from database
 * @param secret - Secret key for password verification and JWT signing
 * @param options - Login options (redirect, expiration, payload, cookie settings)
 * @returns Response with Set-Cookie header on success, or 401 error on failure
 */
export async function login(
	password: string,
	storedHash: string,
	secret: string,
	options: LoginOptions = {}
): Promise<Response> {
	const {
		redirect,
		exp = DEFAULT_EXPIRATION,
		payload = {},
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

	// Generate JWT token
	const token = await signJwt(secret, exp, payload);

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
 * Handles user logout by clearing the auth cookie.
 *
 * @param options - Logout options (redirect, cookie settings)
 * @returns Response with cleared cookie and optional redirect
 */
export function logout(options: LogoutOptions = {}): Response {
	const {
		redirect = '/',
		cookieName = DEFAULT_COOKIE_NAME,
		cookiePath = DEFAULT_COOKIE_PATH,
		cookieDomain
	} = options;

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
 * Middleware function to verify JWT token from cookie.
 *
 * @param request - Incoming request
 * @param secret - Secret key used for JWT verification
 * @param options - Middleware options (cookie name)
 * @returns Authentication result with status and payload
 */
export async function authMiddleware(
	request: Request,
	secret: string,
	options: MiddlewareOptions = {}
): Promise<AuthResult> {
	const { cookieName = DEFAULT_COOKIE_NAME } = options;

	const token = readCookie(request, cookieName);

	if (!token) {
		return { authenticated: false };
	}

	const isValid = await verifyJwt(token, secret);

	if (!isValid) {
		return { authenticated: false };
	}

	const { payload } = decodeJwt(token);

	return {
		authenticated: true,
		payload
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
