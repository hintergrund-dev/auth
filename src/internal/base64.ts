/**
 * Internal Base64 and Base64URL encoding utilities.
 * @internal
 */

import { bytesToByteString, byteStringToBytes } from './encoding';

/**
 * Converts a string to base64url encoding
 */
export function stringToBase64Url(str: string): string {
	return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	return btoa(bytesToByteString(new Uint8Array(buffer)));
}

/**
 * Converts a base64 string to an ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
	return byteStringToBytes(atob(base64)).buffer as ArrayBuffer;
}

/**
 * Converts an ArrayBuffer to base64url encoding
 */
export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
	return arrayBufferToBase64(buffer).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Converts base64url to an ArrayBuffer
 */
export function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
	const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
	return base64ToArrayBuffer(base64);
}

/**
 * Decodes a base64url-encoded JSON payload
 */
export function decodeBase64UrlJson<T>(raw: string): T | undefined {
	try {
		const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(base64)) as T;
	} catch {
		return undefined;
	}
}
