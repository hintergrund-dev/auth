/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { passwordLogin, passwordLogout, passwordMiddleware, readRequestBody } from '../../../src/index';

export default {
	async fetch(request, env, ctx) {
		// Get route of the request
		const url = new URL(request.url);
		const route = url.pathname;

		if (route === '/auth/login') {
			if (request.method === 'POST') {
				const { password } = readRequestBody(request);
				return passwordLogin(password, env.SECRET, env.HASH, 'protected');
			}
		}
		if (route === '/auth/logout') {
			return passwordLogout();
		}

		if (/^\/protected/.test(route)) {
			return passwordMiddleware(
				request,
				env.SECRET,
				async (request) => {
					fetch(request);
				},
				'/login',
			);
		}
		return fetch(request);
	},
};
