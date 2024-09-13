import { passwordLogout } from '../../../../src/password-auth';

export async function onRequest() {
	return passwordLogout();
}
