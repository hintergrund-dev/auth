#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { bold, grey, yellow } from 'kleur/colors';
import { create } from './index.js';

const { version } = JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8'));
let cwd = process.argv[2] || '.';

console.log(`
${grey(`create-hg-auth version ${version}`)}
`);

p.intro('Welcome to @hintergrund/auth!');

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
const options = await p.group(
	{
		password: () =>
			p.password({
				message: 'Enter a password for your protected routes'
			}),
		passwordConfirm: () =>
			p.password({
				message: 'Enter the password again'
			}),
		routes: async () => {
			let routes = {};
			let nextRoute = await p.text({
				message: 'Which route should be protected? (hit Enter to finish)',
				placeholder: '  (e.g., "admin" or "dashboard")'
			});
			if (nextRoute && !p.isCancel(nextRoute)) {
				routes[nextRoute] = true;
			}
			while (nextRoute && !p.isCancel(nextRoute)) {
				nextRoute = await p.text({
					message: 'Another route to protect? (hit Enter to finish)',
					placeholder: '  (e.g., "admin" or "dashboard")'
				});
				if (nextRoute && !p.isCancel(nextRoute)) {
					routes[nextRoute] = true;
				}
			}
			return routes;
		},
		wrangler: () =>
			p.confirm({
				message: 'Do you want to deploy your environment variables with Wrangler?',
				initialValue: true
			})
	},
	{ onCancel: () => process.exit(1) }
);

while (options.password !== options.passwordConfirm) {
	p.outro(yellow('Passwords do not match!'));
	options.password = await p.password({
		message: 'Enter a password for your protected routes'
	});
	options.passwordConfirm = await p.password({
		message: 'Enter the password again'
	});
}
let packageManager = 'npm';
if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
	packageManager = 'yarn';
} else if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
	packageManager = 'pnpm';
}
options.packageManager = packageManager;
// Call the create function with the gathered options
await create(cwd, options);

p.outro(
	`@hintergrund/auth has been successfully added to your project.\n\n` +
		`To start your project, run ${bold(`${packageManager} start`)}.\n` +
		`Push your project to see the changes live.`
);
