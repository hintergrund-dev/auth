/**
 * JWT (JSON Web Token) utilities for signing, verifying, and decoding tokens.
 * Uses HMAC-SHA256 for signing.
 */

import {
	stringToBase64Url,
	arrayBufferToBase64Url,
	base64UrlToArrayBuffer,
	decodeBase64UrlJson
} from './internal';
import { textToArrayBuffer } from './internal/encoding';
import type { JwtPayload, JwtHeader, DecodedJwt } from './types';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours in seconds

const ALGORITHM: HmacImportParams = {
	name: 'HMAC',
	hash: { name: 'SHA-256' }
};

// =============================================================================
// Public API
// =============================================================================

/**
 * Signs a JWT token with the given secret and payload.
 *
 * @param secret - Secret key for signing
 * @param exp - Expiration time in seconds (default: 86400 = 24 hours)
 * @param payload - Additional payload data
 * @returns Signed JWT token string
 */
export async function signJwt(
	secret: string,
	exp: number = DEFAULT_EXPIRATION,
	payload: Record<string, unknown> = {}
): Promise<string> {
	const header: JwtHeader = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const now = Math.floor(Date.now() / 1000);

	const jwtPayload: JwtPayload = {
		iat: now,
		exp: now + exp,
		...payload
	};

	// Build header.payload
	const headerB64 = stringToBase64Url(JSON.stringify(header));
	const payloadB64 = stringToBase64Url(JSON.stringify(jwtPayload));
	const unsignedToken = `${headerB64}.${payloadB64}`;

	// Sign
	const key = await importSigningKey(secret);
	const signature = await crypto.subtle.sign(ALGORITHM, key, textToArrayBuffer(unsignedToken));

	return `${unsignedToken}.${arrayBufferToBase64Url(signature)}`;
}

/**
 * Verifies a JWT token's signature and expiration.
 *
 * Security: Signature is verified BEFORE checking expiration to prevent
 * timing attacks that could reveal token structure.
 *
 * @param token - JWT token string
 * @param secret - Secret key used for signing
 * @returns True if token is valid and not expired, false otherwise
 */
export async function verifyJwt(token: string, secret: string): Promise<boolean> {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return false;
		}

		const [headerB64, payloadB64, signatureB64] = parts;

		// SECURITY: Verify signature FIRST before trusting any payload data
		const key = await importVerifyKey(secret);
		const isValidSignature = await crypto.subtle.verify(
			ALGORITHM,
			key,
			base64UrlToArrayBuffer(signatureB64),
			textToArrayBuffer(`${headerB64}.${payloadB64}`)
		);

		if (!isValidSignature) {
			return false;
		}

		// Only check expiration after signature is verified
		const payload = decodeBase64UrlJson<JwtPayload>(payloadB64);
		if (payload?.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Decodes a JWT token without verifying its signature.
 *
 * WARNING: Always verify the token with verifyJwt() before trusting the payload!
 *
 * @param token - JWT token string
 * @returns Decoded header and payload
 */
export function decodeJwt(token: string): DecodedJwt {
	const parts = token.split('.');

	return {
		header: decodeBase64UrlJson<JwtHeader>(parts[0]) ?? { alg: '', typ: '' },
		payload: decodeBase64UrlJson<JwtPayload>(parts[1]) ?? {}
	};
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Imports a secret key for signing operations
 */
async function importSigningKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', textToArrayBuffer(secret), ALGORITHM, false, ['sign']);
}

/**
 * Imports a secret key for verification operations
 */
async function importVerifyKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', textToArrayBuffer(secret), ALGORITHM, false, ['verify']);
}
