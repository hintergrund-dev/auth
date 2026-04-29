# Claude Code Guidelines

This document contains guidelines for Claude Code when working with this project.

## Development Server Guidelines

**DO NOT** run development servers or start long-running processes:
- ❌ Never run `npm run dev`, `wrangler dev`, or similar dev server commands
- ❌ Never start servers in background mode
- ❌ Never attempt to test the application by starting servers

**Rationale**: Dev servers are long-running processes that should be managed by the user. Claude should focus on code changes, testing configurations, and preparing the project, but leave server execution to the user.

## What Claude Can Do

✅ Install dependencies (`npm install`)
✅ Run builds (`npm run build`)
✅ Run tests (`npm test`)
✅ Generate types (`npm run cf-typegen`)
✅ Create configuration files
✅ Update code and imports
✅ Verify configurations

## Package Development Workflow

When working with the npm package:

1. Make changes to source files in `/src`
2. Run `npm run build` to compile
3. Update example projects to use the package
4. Let the user test with `npm run dev` or `wrangler dev`

## Example Project Testing

The example project (`examples/worker-kv-auth`) uses the `@hintergrund/auth` package:
- Package is linked via `"@hintergrund/auth": "file:../.."`
- User should run `npm run dev` to test
- Claude can verify the setup but should not start the server
