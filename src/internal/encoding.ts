/**
 * Internal encoding utilities for converting between text, bytes, and ArrayBuffers.
 * @internal
 */

/**
 * Converts a Uint8Array to a byte string
 */
export function bytesToByteString(bytes: Uint8Array): string {
	let result = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		result += String.fromCharCode(bytes[i]);
	}
	return result;
}

/**
 * Converts a byte string to a Uint8Array
 */
export function byteStringToBytes(byteStr: string): Uint8Array {
	const bytes = new Uint8Array(byteStr.length);
	for (let i = 0; i < byteStr.length; i++) {
		bytes[i] = byteStr.charCodeAt(i);
	}
	return bytes;
}

/**
 * Converts text to an ArrayBuffer using UTF-8 encoding
 */
export function textToArrayBuffer(str: string): ArrayBuffer {
	return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

/**
 * Converts an ArrayBuffer to a UTF-8 string
 */
export function arrayBufferToText(buffer: ArrayBuffer): string {
	return new TextDecoder().decode(buffer);
}
