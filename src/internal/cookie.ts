/**
 * Internal cookie utilities.
 * @internal
 */

import type { CookieOptions } from '../types';

/**
 * Builds a Set-Cookie header value from options
 */
export function buildCookieString(value: string, name: string, options: CookieOptions = {}): string {
	const {
		path = '/',
		domain,
		maxAge,
		sameSite = 'Strict',
		secure = true,
		httpOnly = true
	} = options;

	const parts = [`${name}=${value}`];

	if (secure) {
		parts.push('Secure');
	}

	if (httpOnly) {
		parts.push('HttpOnly');
	}

	parts.push(`Path=${path}`);
	parts.push(`SameSite=${sameSite}`);

	if (domain) {
		parts.push(`Domain=${domain}`);
	}

	if (maxAge !== undefined) {
		parts.push(`Max-Age=${maxAge}`);
	}

	return parts.join('; ');
}

/**
 * Builds a cookie string that clears/expires the cookie
 */
export function buildExpiredCookieString(name: string, options: CookieOptions = {}): string {
	return buildCookieString(name, '', { ...options, maxAge: 0 });
}

/**
 * Parses a cookie header string into key-value pairs
 */
export function parseCookieHeader(cookieHeader: string): Map<string, string> {
	const cookies = new Map<string, string>();

	const pairs = cookieHeader.split(';');
	for (const pair of pairs) {
		const equalsIndex = pair.indexOf('=');
		if (equalsIndex === -1) continue;

		const name = pair.slice(0, equalsIndex).trim();
		const value = pair.slice(equalsIndex + 1).trim();

		if (name) {
			// Decode URL-encoded cookie values
			try {
				cookies.set(name, decodeURIComponent(value));
			} catch {
				// If decoding fails, use raw value
				cookies.set(name, value);
			}
		}
	}

	return cookies;
}
