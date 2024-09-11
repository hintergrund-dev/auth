# Auth utilities for cloudflare workers/pages

### Password authentication

## Usage (in a cloudflare pages environment)

Create endpoints for login, logout and any other protected routes.

```
functions/
├── auth/
│   ├── login.js
│   └── logout.js
└── protected/
    └── _middleware.js/
```

### login.js

```javascript
import { passwordLogin, readRequestBody, getComponent } from '@hintergrund/auth';

export async function onRequestPost(context) {
	const { env, request } = context;
	const { password } = await readRequestBody(request);
	return passwordLogin(password, env.HASH, env.SECRET, 'protected');
}

export async function onRequestGet() {
	return getComponent('login');
}
```

### logout.js

```javascript
import { passwordLogout } from '@hintergrund/auth';

export async function onRequest() {
	return passwordLogout();
}
```

### \_middleware.js

```javascript
import { passwordMiddleware } from '@hintergrund/auth';

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
```

As you can see we are using the `HASH` and `SECRET` environment variables. You can set them in the cloudflare dashboard. The `HASH` is the hash of the password you want to use for authentication. You can generate it here.

<input type="password" id="password" name="password" placeholder="Password" />
<button onclick="hash()">Generate hash</button>

result: <span id="hash"></span>

<script>
    function hash() {
        const password = document.getElementById('password').value;
        const hash = new TextEncoder().encode(password);
        crypto.subtle.digest('SHA-256', hash).then(h => {
            const hashArray = Array.from(new Uint8Array(h));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            document.getElementById('hash').innerText = hashHex;
        });
    }
</script>
