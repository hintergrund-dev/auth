import { passwordLogout } from '../../../../src/password-auth';
/**
 *
 * @param {import('@cloudflare/workers-types').EventContext<any,any,any>} context
 * @returns
 */
export async function onRequest() {
	return passwordLogout();
}
