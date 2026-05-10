/**
 * Cryptographic utilities for password hashing and secret generation.
 * Uses PBKDF2 with SHA-256 for secure password hashing.
 */

import type { HashOptions } from './types';

// =============================================================================
// Constants
// =============================================================================

const SALT_LENGTH = 16;
const HASH_LENGTH = 32;
const DEFAULT_ITERATIONS = 50000;
const textEncoder = new TextEncoder();

// =============================================================================
// Public API
// =============================================================================

/**
 * Generates a cryptographically secure random secret.
 *
 * @param length - Number of random bytes (default: 32)
 * @returns Base64-encoded random secret
 */
export function generateRandomSecret(length = 32): string {
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return bytesToBase64(bytes);
}

export async function randomToken(prefix: string, bytes = 32): Promise<string> {
	const random = crypto.getRandomValues(new Uint8Array(bytes));
	return `${prefix}_${bytesToBase64Url(random)}`;
}

/**
 * Hashes a password using PBKDF2-SHA256 with salt and secret (pepper).
 *
 * Storage format: iterations (4 bytes) + salt (16 bytes) + hash (32 bytes)
 *
 * @param password - Plain text password
 * @param secret - Secret key (pepper) for additional security
 * @param options - Hashing options
 * @returns Base64-encoded string containing iterations, salt, and hash
 */
export async function hashPassword(
	password: string,
	secret: string,
	options: HashOptions = {}
): Promise<string> {
	const { iterations = DEFAULT_ITERATIONS } = options;

	// Generate random salt
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

	// Derive key using PBKDF2
	const hash = await deriveKey(password, secret, salt, iterations);

	// Combine iterations + salt + hash for storage
	const result = new Uint8Array(4 + SALT_LENGTH + HASH_LENGTH);
	const view = new DataView(result.buffer);
	view.setUint32(0, iterations, false); // Big-endian
	result.set(salt, 4);
	result.set(hash, 4 + SALT_LENGTH);

	return bytesToBase64(result);
}

/**
 * Verifies a password against a stored hash.
 *
 * @param password - Plain text password to verify
 * @param secret - Secret key (pepper) used during hashing
 * @param storedHash - Base64-encoded hash from storage
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
	password: string,
	secret: string,
	storedHash: string
): Promise<boolean> {
	try {
		// Decode stored hash
		const data = base64ToBytes(storedHash);

		// Validate minimum length
		if (data.length < 4 + SALT_LENGTH + HASH_LENGTH) {
			return false;
		}

		// Extract components
		const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
		const iterations = view.getUint32(0, false);
		const salt = data.slice(4, 4 + SALT_LENGTH);
		const storedHashBytes = data.slice(4 + SALT_LENGTH);

		// Derive key with same parameters
		const computedHash = await deriveKey(password, secret, salt, iterations);

		// Constant-time comparison
		return constantTimeEqual(computedHash, storedHashBytes);
	} catch {
		return false;
	}
}

export async function sha256Hex(value: string | Uint8Array): Promise<string> {
	const input = typeof value === 'string' ? textEncoder.encode(value).buffer : toArrayBuffer(value);
	return bytesToHex(await crypto.subtle.digest('SHA-256', input));
}

export async function hmacSha256(
	key: ArrayBuffer | Uint8Array | string,
	value: string
): Promise<Uint8Array> {
	const rawKey = typeof key === 'string'
		? textEncoder.encode(key).buffer
		: key instanceof Uint8Array
			? toArrayBuffer(key)
			: key;
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		rawKey,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	return new Uint8Array(
		await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(value))
	);
}

export async function hashSecret(secret: string, pepper: string): Promise<string> {
	return sha256Hex(`${pepper}:${secret}`);
}

// =============================================================================
// Encryption
// =============================================================================

/**
 * Encrypts a string value using AES-GCM
 * @param plaintext - The string to encrypt
 * @param secret - Secret key (AUTH_SECRET)
 * @returns Base64-encoded string containing IV and encrypted data
 */
export async function encrypt(plaintext: string, secret: string): Promise<string> {
	// Generate random IV (12 bytes for AES-GCM)
	const iv = crypto.getRandomValues(new Uint8Array(12));

	// Derive encryption key
	const key = await deriveEncryptionKey(secret);

	// Convert plaintext to bytes
	const plaintextBytes = new TextEncoder().encode(plaintext);

	// Encrypt
	const encryptedBuffer = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		plaintextBytes
	);

	const encryptedBytes = new Uint8Array(encryptedBuffer);

	// Combine IV and encrypted data for storage
	const combined = new Uint8Array(iv.length + encryptedBytes.length);
	combined.set(iv);
	combined.set(encryptedBytes, iv.length);

	// Return as base64 string
	return bytesToBase64(combined);
}

/**
 * Decrypts an encrypted string
 * @param ciphertext - Base64-encoded encrypted data
 * @param secret - Secret key (AUTH_SECRET)
 * @returns Decrypted plaintext string
 */
export async function decrypt(ciphertext: string, secret: string): Promise<string> {
	try {
		// Decode from base64
		const combined = base64ToBytes(ciphertext);

		// Extract IV (first 12 bytes)
		const iv = combined.slice(0, 12);

		// Extract encrypted data (remaining bytes)
		const encryptedData = combined.slice(12);

		// Derive decryption key
		const key = await deriveEncryptionKey(secret);

		// Decrypt
		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv },
			key,
			encryptedData
		);

		// Convert bytes back to string
		return new TextDecoder().decode(decryptedBuffer);
	} catch (error) {
		throw new Error('Decryption failed');
	}
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Derives a cryptographic key from the secret string for AES-GCM encryption
 * @param secret - The secret string (AUTH_SECRET)
 * @returns CryptoKey for AES-GCM encryption
 */
async function deriveEncryptionKey(secret: string): Promise<CryptoKey> {
	// Convert secret to bytes
	const secretBytes = new TextEncoder().encode(secret);

	// Hash the secret to get a consistent 256-bit key
	const keyMaterial = await crypto.subtle.digest('SHA-256', secretBytes);

	// Import as a CryptoKey for AES-GCM
	return await crypto.subtle.importKey(
		'raw',
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

/**
 * Derives a key using PBKDF2-SHA256
 */
async function deriveKey(
	password: string,
	secret: string,
	salt: Uint8Array,
	iterations: number
): Promise<Uint8Array> {
	// Combine password with secret (pepper)
	const passwordWithPepper = password + secret;

	// Import password as key material
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(passwordWithPepper),
		'PBKDF2',
		false,
		['deriveBits']
	);

	// Derive bits using PBKDF2
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt.buffer as ArrayBuffer,
			iterations: iterations,
			hash: 'SHA-256'
		},
		keyMaterial,
		HASH_LENGTH * 8
	);

	return new Uint8Array(derivedBits);
}

/**
 * Constant-time comparison to prevent timing attacks.
 * Always compares full length regardless of mismatch position.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	// Use fixed-length comparison to prevent length oracle
	const maxLen = Math.max(a.length, b.length);
	let result = a.length ^ b.length; // Will be non-zero if lengths differ

	for (let i = 0; i < maxLen; i++) {
		// Use 0 as fallback to maintain constant time
		const aVal = i < a.length ? a[i] : 0;
		const bVal = i < b.length ? b[i] : 0;
		result |= aVal ^ bVal;
	}

	return result === 0;
}

/**
 * Converts Uint8Array to base64 string
 */
function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function bytesToBase64Url(bytes: Uint8Array): string {
	return bytesToBase64(bytes)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');
}

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
	const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	return [...array].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * Converts base64 string to Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}
