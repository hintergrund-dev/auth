/**
 * Cookie utilities (copied from internal for standalone example)
 */

interface CookieOptions {
	path?: string;
	domain?: string;
	maxAge?: number;
	sameSite?: 'Strict' | 'Lax' | 'None';
	secure?: boolean;
	httpOnly?: boolean;
}

export function buildCookieString(
	value: string,
	name: string,
	options: CookieOptions = {}
): string {
	const {
		path = '/',
		domain,
		maxAge,
		sameSite = 'Strict',
		secure = true,
		httpOnly = true
	} = options;

	const parts = [`${name}=${value}`];

	if (secure) parts.push('Secure');
	if (httpOnly) parts.push('HttpOnly');
	parts.push(`Path=${path}`);
	parts.push(`SameSite=${sameSite}`);
	if (domain) parts.push(`Domain=${domain}`);
	if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);

	return parts.join('; ');
}

export function buildExpiredCookieString(name: string, options: CookieOptions = {}): string {
	return buildCookieString('', name, { ...options, maxAge: 0 });
}
