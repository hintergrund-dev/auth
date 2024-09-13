#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { bold, cyan, grey, yellow } from 'kleur/colors';
import { generateRandomSecret, hashPw } from './utils/crypto.js';
import { execSync } from 'node:child_process';

let cwd = process.argv[2] || '.';

p.intro('Welcome to @hintergrund/auth!');

// const allOptions = await p.select({
// 	message: 'Do you want to start from scratch or change your existing setup?',
// 	options: [
// 		{ label: 'Start from scratch', value: false, selected: true },
// 		{ label: 'Change existing setup', value: true, selected: false }
// 	]
// });

// let options = {};

// if (!allOptions) {
// 	const opts = await p.multiselect({
// 		message: 'What do you want to do?',
// 		options: [
// 			{ label: 'Set a new password', value: 'password', selected: false },
// 			{ label: 'Create auth/login and auth/logout endpoints', value: 'endpoints', selected: true },
// 			{ label: 'Add middleware to protected routes', value: 'middleware', selected: true },
// 			{
// 				label: 'Push secrets to cloudflare pages project with wrangler',
// 				value: 'wrangler',
// 				selected: false
// 			}
// 		]
// 	});
// 	for (const opt of opts) {
// 		options[opt] = true;
// 	}
// } else {
// 	options = {
// 		password: true,
// 		endpoints: true,
// 		middleware: true
// 	};
// }

if (cwd === '.') {
	const dir = await p.text({
		message: 'Where should we create your project?',
		placeholder: '  (hit Enter to use current directory)'
	});

	if (p.isCancel(dir)) process.exit(1);

	if (dir) {
		cwd = /** @type {string} */ (dir);
	}
}

// Change cwd to cwd/functions
const functionsDir = path.join(cwd, 'functions');
if (fs.existsSync(functionsDir)) {
	if (fs.readdirSync(functionsDir).length > 0) {
		const force = await p.confirm({
			message:
				'./functions directory already exists. Continue?\n' +
				grey('This will overwrite existing files at ./functions/auth'),
			initialValue: false
		});

		// bail if `force` is `false` or the user cancelled with Ctrl-C
		if (force !== true) {
			process.exit(1);
		}
	}
}

// Enter password for hashing
let password = await p.password({
	message: 'Enter a password for your protected routes'
});
let password2 = await p.password({
	message: 'Enter the password again'
});

while (password !== password2) {
	console.error(yellow('Passwords do not match'));
	password = await p.password({
		message: 'Enter a password for your protected routes'
	});
	password2 = await p.password({
		message: 'Enter the password again'
	});
}

let routes = {};
let nextRoute = await p.text({
	message: 'Which route should be protected?',
	placeholder: '  (hit Enter to finish)'
});

while (nextRoute !== undefined) {
	if (nextRoute) {
		const routePath = path.join(cwd, 'functions', nextRoute, '_middleware.js');
		if (fs.existsSync(routePath)) {
			console.error(yellow('_middleware.js file at specified route already exists'));
		} else {
			routes[nextRoute] = {
				'_middleware.js': `import { passwordLogin, readRequestBody, getComponent } from '@hintergrund/auth';\n\nexport async function onRequestPost(context) {\n\tconst { env, request } = context;\n\tconst { password } = await readRequestBody(request);\n\treturn passwordLogin(password, env.HASH, env.SECRET, 'protected');\n}\n\nexport async function onRequestGet() {\n\treturn getComponent('login');\n}\n`
			};
		}
	}
	nextRoute = await p.text({
		message: 'Another route to protect?',
		placeholder: '  (hit Enter to finish)'
	});
}

// p.text({
// 	message: 'Creating files...'
// });

// Create hash and secret
const secret = generateRandomSecret();
const hash = await hashPw(password, secret);

const folderStructure = {
	functions: {
		auth: {
			'login.js': `import { passwordLogin, readRequestBody, getComponent } from '@hintergrund/auth';\n\nexport async function onRequestPost(context) {\n\tconst { env, request } = context;\n\tconst { password } = await readRequestBody(request);\n\treturn passwordLogin(password, env.HASH, env.SECRET, 'protected');\n}\n\nexport async function onRequestGet() {\n\treturn getComponent('login');\n}\n`,
			'logout.js': `import { passwordLogout } from '@hintergrund/auth';\n\nexport async function onRequest() {\n\treturn passwordLogout();\n}\n`
		},
		...routes
	},
	'.dev.vars': `SECRET=${secret}\nHASH=${hash}\n`
};

function createFiles(basePath, structure) {
	for (const [name, content] of Object.entries(structure)) {
		const fullPath = path.join(basePath, name);
		if (name === 'protected') {
			fs.mkdirSync(fullPath, { recursive: true });
			createFiles(fullPath, content);
		} else {
			if (typeof content === 'string') {
				fs.writeFileSync(fullPath, content);
			} else {
				fs.mkdirSync(fullPath, { recursive: true });
				createFiles(fullPath, content);
			}
		}
	}
}
createFiles(process.cwd(), folderStructure);

const wrangler = await p.confirm({
	message: 'Do you want to deploy your environment variables with Wrangler?',
	initialValue: true
});

if (wrangler) {
	try {
		const wranglerVersion = execSync('wrangler --version', { stdio: 'pipe' }).toString().trim();
		console.log(`Wrangler is installed: ${wranglerVersion}`);

		// Parse wrangler.toml
		const wranglerTomlPath = path.join(cwd, 'wrangler.toml');
		if (fs.existsSync(wranglerTomlPath)) {
			execSync(`wrangler secret put SECRET --env dev`, { input: secret, stdio: 'inherit' });
			execSync(`wrangler secret put HASH --env dev`, { input: hash, stdio: 'inherit' });
		}
	} catch (error) {
		console.error(
			'Wrangler is not installed. Please install it by running `npm install -g wrangler`.'
		);
	}
}

// add @hintergrund/auth to package.json
const packagePath = path.join(cwd, 'package.json');
if (fs.existsSync(packagePath)) {
	const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
	packageJson.dependencies = packageJson.dependencies || {};
	packageJson.dependencies['@hintergrund/auth'] = '0.0.1';
	// check if start script exists
	packageJson.scripts = packageJson.scripts || {};
	if (!packageJson.scripts.start) {
		packageJson.scripts.start = 'wrangler pages dev';
	}
	fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
} else {
	fs.writeFileSync(
		packagePath,
		JSON.stringify(
			{
				dependencies: { '@hintergrund/auth': '0.0.1' },
				scripts: { start: 'wrangler pages dev' }
			},
			null,
			2
		)
	);
}

// add .gitignore
const gitignorePath = path.join(cwd, '.gitignore');
if (fs.existsSync(gitignorePath)) {
	const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
	if (!gitignore.includes('.dev.vars')) {
		fs.appendFileSync(gitignorePath, '\n.dev.vars\n');
	}
} else {
	fs.writeFileSync(gitignorePath, '.dev.vars\n');
}
