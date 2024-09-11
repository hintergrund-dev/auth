import { passwordLogin, readRequestBody, getComponent } from '../../../../src/index';

export async function onRequestPost(context) {
	const { env, request } = context;
	const { password } = await readRequestBody(request);
	return passwordLogin(password, env.HASH, env.SECRET, 'protected');
}

export async function onRequestGet() {
	return getComponent('login');
}
