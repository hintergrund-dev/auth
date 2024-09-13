/**
 * Generates a random token used as a Secret Key
 * @returns string
 */
export function generateRandomSecret() {
	const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...tokenBytes));
}

/**
 *
 * @param {string} password
 * @param {string} secret
 * @returns
 */
export async function hashPw(password, secret) {
	// Create salt
	const salt = crypto.getRandomValues(new Uint8Array(16));

	// Convert password and secret to Uint8Array
	const pass = new TextEncoder().encode(password);
	const pepp = new TextEncoder().encode(secret);

	// Combine salt, secret, and password hash
	const combined = new Uint8Array(salt.length + secret.length + password.length);
	combined.set(salt);
	combined.set(pepp, salt.length);
	combined.set(pass, salt.length + secret.length);

	// Hash combined
	const hashBuffer = await crypto.subtle.digest('SHA-256', combined);

	// Convert hashBuffer to Uint8Array
	const hash = new Uint8Array(hashBuffer);

	// Combine salt and hash
	const combinedHash = new Uint8Array(salt.length + hash.length);
	combinedHash.set(salt);
	combinedHash.set(hash, salt.length);

	// Return combined hash as base64 string
	return btoa(new Uint8Array(combinedHash).reduce((s, b) => s + String.fromCharCode(b), ''));
}

/**
 * @param {string} hash
 * @param {string} password
 * @param {string} secret
 * @returns {Promise<boolean>}
 */
export async function verifyPw(password, secret, hash) {
	// Decode oldCombined Hash from base64 string to Uint8Array
	const combinedOld = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));

	// Get salt from combined hash
	const salt = combinedOld.slice(0, 16);

	// Get hash from combined hash
	const oldHash = combinedOld.slice(16);

	// Combine given password and secret with salt from old hash
	const pass = new TextEncoder().encode(password);
	const pepp = new TextEncoder().encode(secret);
	const combined = new Uint8Array(salt.length + secret.length + password.length);
	combined.set(salt);
	combined.set(pepp, salt.length);
	combined.set(pass, salt.length + secret.length);

	const newHash = await crypto.subtle.digest('SHA-256', combined);

	// Compare new hash with old hash
	return areUint8ArraysEqual(new Uint8Array(newHash), oldHash);
}

/**
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns
 */
function areUint8ArraysEqual(a, b) {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}