/**
 *
 * @param {import('@cloudflare/workers-types').Request} request
 * @returns
 */
export async function readRequestBody(request) {
	const contentType = request.headers.get('content-type');
	if (!contentType) throw new Error('Content-Type not set');

	if (contentType.includes('application/json')) {
		return await request.json();
	} else if (contentType.includes('form')) {
		const formData = await request.formData();
		const body = {};
		for (const entry of formData.entries()) {
			// @ts-ignore
			body[entry[0]] = entry[1];
		}
		return body;
	}
	throw new Error('Content-Type not supported');
}

export function readCookie(request, name) {
	const cookieHeader = request.headers.get('cookie');
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(';').map((cookie) => cookie.split('='));
	const cookie = cookies.find((c) => c[0].trim() === name);
	if (!cookie) return null;

	return cookie[1];
}
