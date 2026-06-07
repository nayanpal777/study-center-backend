# Active Context — Pal Study Center (Backend)

## Current Work Focus
**Database migration from SQLite3 (local file) to Turso (libSQL cloud) is complete.** The backend is deployed on Render and serving the frontend at `https://palstudycenter.github.io`. The core API is stable.

Key features in place:
- Per-student subject access control (`student_subjects` table + endpoints)
- Monthly fee tracking (`student_fees` table + endpoints)
- Full review CRUD with admin approval workflow
- Notice system with board/class targeting

## Recent Changes (Known from Code)

### Newly Added Tables
- **`student_subjects`**: Per-student, per-subject enabled/disabled flags. Created automatically on student signup with defaults based on class level.
- **`student_fees`**: 12-month fee records per student, all initialized to `'Unpaid'` on signup.

### New Endpoints Added
- `GET/PATCH /students/:id/subjects` — subject access management
- `GET/PATCH /students/:id/fees` — fee status management
- Full review CRUD: `GET/POST /reviews`, `GET/PATCH/DELETE /reviews/:id`
- `GET /students/:id/notices` — filtered notice delivery

### Schema Migration Guard
[`db.js`](../database/db.js) contains a runtime check using `SELECT name FROM pragma_table_info('reviews') WHERE name = 'approved'` — adds the `approved` column if missing. Works on both SQLite and Turso/libSQL.

### Turso Migration (completed)
- Replaced `sqlite3` npm package with `@libsql/client`
- [`database/db.js`](../database/db.js) now creates a Turso client using `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` env vars
- All model files updated: `dbGet`/`dbAll`/`dbRun` wrappers now use `client.execute({ sql, args })` instead of callback-based sqlite3 API
- [`index.js`](../index.js) cleaned up — removed `fs`, `path`, `/download-db` endpoint (no local db file with Turso)
- All SQL queries unchanged — libSQL is fully SQLite-compatible

## Active Decisions & Considerations
- **No ORM**: All SQL is written by hand using raw SQLite3 with promise wrappers. This is intentional for simplicity but means schema changes require manual `ALTER TABLE` or the migration guard pattern.
- **Phone as login ID**: Login uses `phone` as the unique identifier. The `students` table does **not** have an `email` column — email references in older frontend code are legacy.
- **`dashboard` table purpose**: The `dashboard` table stores students who have requested access to a dashboard feature. It has a `permission` field but no endpoint to grant permission currently exists — only creation is implemented.
- **Open CORS**: `app.use(cors())` has no origin restriction. This is fine for current usage but would need to be restricted if the API were made public.
- **`express-session` installed but unused**: Session management is installed as a dependency but no session middleware is applied in the current routes.

## Next Steps
- [ ] Set `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` environment variables on Render dashboard
- [ ] Add endpoint to `PATCH /Dashboard/:id/permission` to grant/revoke dashboard permission
- [ ] Add file upload endpoint for study materials (admin panel upload button is a placeholder)
- [ ] Restrict CORS to known frontend origin (`https://palstudycenter.github.io`) for better security
- [ ] Move `nodemon` to `devDependencies` in [`package.json`](../package.json)
- [ ] Add `email` column to `students` table if email-based features are needed
- [ ] Consider adding rate limiting to auth endpoints (`/createStudent`, `/StudentLogin`)