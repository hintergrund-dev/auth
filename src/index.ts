/**
 * @hintergrund/auth
 *
 * Lightweight authentication library for Cloudflare Workers.
 *
 * Features:
 * - Secure password hashing with PBKDF2 and pepper
 * - JWT token generation and verification (HS256)
 * - Session-based auth with KV/database storage
 * - Cookie-based session management
 * - Request body parsing utilities
 */

// =============================================================================
// Crypto
// =============================================================================

export { generateRandomSecret, hashPassword, verifyPassword, encrypt, decrypt } from './crypto';

// =============================================================================
// JWT
// =============================================================================

export { signJwt, verifyJwt, decodeJwt } from './jwt';

// =============================================================================
// JWT Auth (stateless)
// =============================================================================

export { login, logout, authMiddleware } from './auth';

// =============================================================================
// Session Auth (stateful)
// =============================================================================

export {
	generateSessionToken,
	sessionLogin,
	sessionLogout,
	sessionMiddleware,
	createKVSessionStore
} from './session';

// =============================================================================
// Request Utilities
// =============================================================================

export { readRequestBody, readCookie } from './request';

// =============================================================================
// Types
// =============================================================================

export type {
	// JWT types
	JwtPayload,
	JwtHeader,
	DecodedJwt,
	// JWT Auth types
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
	HashOptions
} from './types';
