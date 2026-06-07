# Tech Context — Pal Study Center (Backend)

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | (LTS) | Runtime environment |
| Express | ^4.18.2 | HTTP server and routing |
| @libsql/client | ^0.14.0 | Turso/libSQL cloud database client (replaces sqlite3) |
| bcryptjs | ^3.0.2 | Password hashing (salt rounds = 10) |
| body-parser | ^1.20.2 | Parse `application/x-www-form-urlencoded` and JSON request bodies |
| cors | ^2.8.5 | Enable cross-origin requests (open CORS policy) |
| express-validator | ^7.0.1 | Input validation and sanitization on routes |
| express-session | ^1.18.2 | Installed but not actively used in current routes |
| nodemon | ^3.1.10 | Dev auto-restart (listed as dependency, not devDependency) |

## Project Scripts
```json
{
  "start": "node index.js"
}
```
- `npm start` → starts the server (connects to Turso on startup and initializes schema)

## Environment Variables
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Server listen port |
| `TURSO_DB_URL` | Yes | — | Turso database URL e.g. `libsql://studycenter-nayanpal777.aws-ap-south-1.turso.io` |
| `TURSO_AUTH_TOKEN` | Yes | — | Turso auth token (generated from Turso dashboard or CLI) |

Set these in a `.env` file locally or in Render's environment variable settings.

## Deployment — Render
- Platform: [Render](https://render.com) free tier
- Service type: Web Service
- Build command: `npm install`
- Start command: `npm start`
- Database: **Turso cloud** — data persists across all deploys, no disk needed. Set `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` as Render environment variables.
- The local `database/study_center.db` file is no longer used or needed in production.

## Local Development Setup
```bash
cd study-center-backend
npm install
node index.js
# Server starts on http://localhost:3000
```

To use with the frontend locally:
1. Start this server (`node index.js`)
2. In frontend [`config.js`](../../palstudycenter.github.io/config.js), uncomment `BASE_URL: 'http://localhost:3000'`

## Database
```
study-center-backend/
  database/
    db.js                ← Turso client creation + async schema init
    models/
      student.js
      dashboard.js
      notice.js
      review.js
```
The Turso database is cloud-hosted at `libsql://studycenter-nayanpal777.aws-ap-south-1.turso.io`. No local `.db` file is used in production.

## Input Validation Pattern
All mutating routes use `express-validator` `check()` arrays before the async handler:
```js
router.post('/createStudent', [
  check('name').not().isEmpty().trim().escape(),
  check('phone').not().isEmpty().trim().escape(),
  ...
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) { return res.json({ status: false, ... }); }
  // ... handler logic
});
```

## Security Notes
- CORS is fully open: `app.use(cors())` — no origin restriction. Acceptable for a small institute app.
- No JWT or session-based auth. Login returns the raw student record; the client stores it.
- `/download-db` is protected by a static token comparison — only works if `DB_DOWNLOAD_TOKEN` env var is set on the server.
- Passwords are hashed with bcryptjs (10 salt rounds) — never stored in plaintext.
- `express-validator` `.escape()` is used on text fields to prevent XSS injection into the DB.

## .gitignore
The [`study-center-backend/.gitignore`](../.gitignore) excludes `node_modules/`. The `study_center.db` file is no longer actively used — consider adding it to `.gitignore` since Turso is now the production database.