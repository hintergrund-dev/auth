import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import * as p from '@clack/prompts';
import { generateRandomSecret, hashPw } from './utils.js';

/** @type {import('./types/index.js').create} */
export async function create(cwd, options) {
	const secret = generateRandomSecret();
	const hash = await hashPw(options.password, secret);

	const middlewareContent = `import { passwordMiddleware } from '@hintergrund/auth';\n\nexport async function onRequest(context) {\n\tconst { request, env } = context;\n\tif (await passwordMiddleware(request, env.SECRET)) {\n\t\treturn await context.next();\n\t} else {\n\t\treturn new Response(null, {\n\t\t\tstatus: 302,\n\t\t\tstatusText: 'Redirecting to login',\n\t\t\theaders: {\n\t\t\t\tlocation: \`/auth/login/?error=Unauthorized%20access%20to%20\${request.url}\`\n\t\t\t}\n\t\t});\n\t}\n}`;

	const folderStructure = {
		functions: {
			auth: {
				'login.js': `import { passwordLogin, readRequestBody, getComponent } from '@hintergrund/auth';\n\nexport async function onRequestPost(context) {\n\tconst { env, request } = context;\n\tconst { password } = await readRequestBody(request);\n\treturn passwordLogin(password, env.HASH, env.SECRET, 'protected');\n}\n\nexport async function onRequestGet() {\n\treturn getComponent('login');\n}\n`,
				'logout.js': `import { passwordLogout } from '@hintergrund/auth';\n\nexport async function onRequest() {\n\treturn passwordLogout();\n}\n`
			},
			// Create _middleware.js for each route in options.routes
			...Object.fromEntries(
				Object.keys(options.routes).map((route) => [
					route,
					{
						'_middleware.js': middlewareContent
					}
				])
			)
		},
		'.dev.vars': `SECRET=${secret}\nHASH=${hash}\n`
	};

	createFiles(process.cwd(), folderStructure);

	if (options.wrangler) {
		try {
			const wranglerVersion = execSync('wrangler --version', { stdio: 'pipe' }).toString().trim();
			console.log(`Wrangler is installed: ${wranglerVersion}`);

			// Parse wrangler.toml
			const wranglerTomlPath = path.join(cwd, 'wrangler.toml');
			if (!fs.existsSync(wranglerTomlPath)) {
				const projectName = await p.text({
					message: 'Enter your Cloudflare Pages project name'
				});
				const outputDir = await p.text({
					message: 'Enter your Cloudflare Pages output directory',
					placeholder: 'public'
				});
				// Create wrangler.toml
				fs.writeFileSync(
					wranglerTomlPath,
					`name = "${projectName}"
compatibility_date = "2024-09-09"
pages_build_output_dir = "${outputDir}"`
				);
			}
			fs.writeFileSync(path.join(cwd, 'tmp.json'), JSON.stringify({ SECRET: secret, HASH: hash }));
			execSync('wrangler pages secret bulk tmp.json', { stdio: 'inherit' });
			fs.unlinkSync(path.join(cwd, 'tmp.json'));
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
		packageJson.dependencies['@hintergrund/auth'] = '0.0.2-next.0';
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

	execSync(`${options.packageManager} install`, { stdio: 'inherit' });

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
}

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
