import { passwordMiddleware } from '../../../../src/password-auth';

export async function onRequest(context) {
	const { request, env } = context;
	if (await passwordMiddleware(request, env.SECRET)) {
		return await context.next();
	} else {
		return new Response(null, {
			status: 302,
			statusText: 'Redirecting to login',
			headers: {
				location: `/auth/login/?error=Unauthorized%20access%20to%20${request.url}`
			}
		});
	}
}
