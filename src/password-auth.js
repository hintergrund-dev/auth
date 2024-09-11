import { verifyPw } from './crypto';
import { sign, verify } from './jwt';
import { readCookie } from './utils';

export async function passwordLogin(
	password,
	hash,
	secret,
	redirect = '',
	exp = 60 * 60 * 24,
	payload = {}
) {
	if (await verifyPw(password, secret, hash)) {
		const token = await sign(secret, exp, payload);

		return new Response(null, {
			status: 302,
			statusText: 'Logged in successfully',
			headers: {
				location: `/${redirect}`,
				'set-cookie': `token=${token}; Secure; HttpOnly; Path=/; SameSite=Strict`
			}
		});
	}
	return new Response(null, {
		status: 302,
		statusText: 'Password is incorrect',
		headers: {
			location: `/auth/login?error=Password%20is%20incorrect`
		}
	});
}

export async function passwordLogout() {
	return new Response(null, {
		status: 303,
		headers: {
			location: `/`,
			'set-cookie': `token=; Secure; HttpOnly; Path=/; Max-Age=0`
		}
	});
}

export async function passwordMiddleware(request, secret) {
	const token = readCookie(request, 'token');
	console.log(token !== null && (await verify(token, secret)));
	return token !== null && (await verify(token, secret));
}
