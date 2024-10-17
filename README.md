# 🔐 @hintergrund/auth

## Add authentication to your site with a single command

### Password authentication

#### Usage (in a cloudflare pages environment)

```bash
npx @hintergrund/auth add
```

npx @hintergrund/auth user

Create endpoints for login, logout and any other protected routes.

```
functions/
├── auth/
│   ├── login.js
│   └── logout.js
└── protected/
    └── _middleware.js/
```
