/**
 * Request parsing utilities for handling HTTP requests.
 */

import { parseCookieHeader } from './internal/cookie';

// =============================================================================
// Public API
// =============================================================================

/**
 * Parses request body from JSON or form data.
 *
 * @param request - Incoming request
 * @returns Parsed body as an object
 * @throws Error if Content-Type is not supported or not set
 */
export async function readRequestBody(request: Request): Promise<Record<string, unknown>> {
	const contentType = request.headers.get('content-type');

	if (!contentType) {
		throw new Error('Content-Type header not set');
	}

	if (contentType.includes('application/json')) {
		return (await request.json()) as Record<string, unknown>;
	}

	if (contentType.includes('form')) {
		const formData = await request.formData();
		const body: Record<string, unknown> = {};

		for (const [key, value] of formData.entries()) {
			body[key] = value;
		}

		return body;
	}

	throw new Error(`Unsupported Content-Type: ${contentType}`);
}

/**
 * Reads a cookie value from request headers.
 *
 * Handles URL-encoded cookie values automatically.
 *
 * @param request - Incoming request
 * @param name - Cookie name to read
 * @returns Cookie value or null if not found
 */
export function readCookie(request: Request, name: string): string | null {
	const cookieHeader = request.headers.get('cookie');

	if (!cookieHeader) {
		return null;
	}

	const cookies = parseCookieHeader(cookieHeader);
	return cookies.get(name) ?? null;
}
