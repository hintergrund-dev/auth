// =============================================================================
// JWT Types
// =============================================================================

/**
 * JWT payload structure with standard claims
 */
export interface JwtPayload {
	/** Issued at (timestamp in seconds) */
	iat?: number;
	/** Expiration time (timestamp in seconds) */
	exp?: number;
	/** Additional custom claims */
	[key: string]: unknown;
}

/**
 * JWT header structure
 */
export interface JwtHeader {
	/** Algorithm used for signing */
	alg: string;
	/** Token type */
	typ: string;
}

/**
 * Decoded JWT structure (header + payload)
 */
export interface DecodedJwt {
	header: JwtHeader;
	payload: JwtPayload;
}

// =============================================================================
// Cookie Types
// =============================================================================

/**
 * Options for cookie configuration
 */
export interface CookieOptions {
	/** Cookie path (default: '/') */
	path?: string;
	/** Cookie domain */
	domain?: string;
	/** Max age in seconds */
	maxAge?: number;
	/** SameSite attribute (default: 'Strict') */
	sameSite?: 'Strict' | 'Lax' | 'None';
	/** Secure flag (default: true) */
	secure?: boolean;
	/** HttpOnly flag (default: true) */
	httpOnly?: boolean;
}

// =============================================================================
// Auth Types
// =============================================================================

/**
 * Options for password login
 */
export interface LoginOptions {
	/** Redirect path after successful login */
	redirect?: string;
	/** Token expiration in seconds (default: 86400 = 24 hours) */
	exp?: number;
	/** Additional JWT payload data */
	payload?: Record<string, unknown>;
	/** Cookie name (default: 'token') */
	cookieName?: string;
	/** Cookie path (default: '/') */
	cookiePath?: string;
	/** Cookie domain */
	cookieDomain?: string;
	/** SameSite attribute (default: 'Strict') */
	sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Options for logout
 */
export interface LogoutOptions {
	/** Redirect path after logout (default: '/') */
	redirect?: string;
	/** Cookie name (default: 'token') */
	cookieName?: string;
	/** Cookie path (default: '/') */
	cookiePath?: string;
	/** Cookie domain */
	cookieDomain?: string;
}

/**
 * Options for auth middleware
 */
export interface MiddlewareOptions {
	/** Cookie name to read token from (default: 'token') */
	cookieName?: string;
}

/**
 * Result of authentication check
 */
export interface AuthResult {
	/** Whether authentication was successful */
	authenticated: boolean;
	/** Decoded JWT payload if authenticated */
	payload?: JwtPayload;
}

// =============================================================================
// Session Types
// =============================================================================

/**
 * Session data stored in KV or database
 */
export interface SessionData {
	/** User identifier or additional data */
	[key: string]: unknown;
}

/**
 * Session store interface - implement this for KV or database storage
 */
export interface SessionStore {
	/** Get session data by token */
	get(token: string): Promise<SessionData | null>;
	/** Set session data with optional TTL in seconds */
	set(token: string, data: SessionData, ttl?: number): Promise<void>;
	/** Delete a session */
	delete(token: string): Promise<void>;
}

/**
 * Options for session-based login
 */
export interface SessionLoginOptions {
	/** Redirect path after successful login */
	redirect?: string;
	/** Session expiration in seconds (default: 86400 = 24 hours) */
	exp?: number;
	/** Additional session data to store */
	data?: SessionData;
	/** Cookie name (default: 'session') */
	cookieName?: string;
	/** Cookie path (default: '/') */
	cookiePath?: string;
	/** Cookie domain */
	cookieDomain?: string;
	/** SameSite attribute (default: 'Strict') */
	sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Options for session-based logout
 */
export interface SessionLogoutOptions {
	/** Redirect path after logout (default: '/') */
	redirect?: string;
	/** Cookie name (default: 'session') */
	cookieName?: string;
	/** Cookie path (default: '/') */
	cookiePath?: string;
	/** Cookie domain */
	cookieDomain?: string;
}

/**
 * Options for session middleware
 */
export interface SessionMiddlewareOptions {
	/** Cookie name to read session from (default: 'session') */
	cookieName?: string;
}

/**
 * Result of session authentication check
 */
export interface SessionAuthResult {
	/** Whether authentication was successful */
	authenticated: boolean;
	/** Session data if authenticated */
	data?: SessionData;
	/** Session token if authenticated */
	token?: string;
}

// =============================================================================
// Crypto Types
// =============================================================================

/**
 * Options for password hashing
 */
export interface HashOptions {
	/** Number of PBKDF2 iterations (default: 50000) */
	iterations?: number;
}
