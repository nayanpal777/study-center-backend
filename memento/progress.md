# Progress — Pal Study Center (Backend)

## What Works

### Core Infrastructure
- [x] Express server with body-parser and CORS middleware
- [x] **Turso (libSQL cloud) database connection** with async schema initialization on startup
- [x] All 6 tables created automatically on first run: `students`, `dashboard`, `student_subjects`, `student_fees`, `notices`, `reviews`
- [x] Thin async wrappers (`dbGet`, `dbAll`, `dbRun`) using `@libsql/client` `execute()` API
- [x] Input validation via `express-validator` on all mutating routes
- [x] **Migrated from sqlite3 → @libsql/client (Turso)** — data now persists across Render deploys

### Student Management
- [x] `POST /createStudent` — register student with hashed password; auto-create subjects + fee records
- [x] `POST /StudentLogin` — authenticate with phone + bcrypt password comparison
- [x] `PUT /forgotpassword` — reset password by phone
- [x] `GET /students` — list all students (admin use)
- [x] `PATCH /UpdateProfileLink` — set/update student profile photo URL
- [x] `PATCH /DisableProfile` — toggle student dashboard access block
- [x] `DELETE /DeleteStudent` — remove student record by id (body param)
- [x] Phone uniqueness enforced at DB level (UNIQUE constraint + pre-check)
- [x] Index on `students.phone` for fast lookup

### Subject Access Control
- [x] `GET /students/:id/subjects` — get subject list with enabled/disabled state
- [x] `PATCH /students/:id/subjects` — toggle a specific subject on/off for a student
- [x] Default subjects auto-assigned at signup based on class level:
  - Class 11/12 → Physics, Chemistry, Mathematics, Biology, Hindi, English
  - Other classes → Science, Mathematics, Hindi, English, Social Science
- [x] Upsert pattern — safe to call multiple times

### Fee Tracking
- [x] `GET /students/:id/fees` — get 12-month fee records
- [x] `PATCH /students/:id/fees` — update fee status for a specific month
- [x] Valid statuses: `'Paid'`, `'Unpaid'`, `'Not applicable'`
- [x] All 12 months auto-initialized to `'Unpaid'` on student creation
- [x] Upsert pattern with `updated_at` timestamp

### Notice System
- [x] `POST /notices` — create notice with optional board/class targeting
- [x] `GET /notices` — list all notices (admin)
- [x] `GET /students/:id/notices` — filtered notices for a specific student
- [x] `DELETE /notices/:id` — remove a notice
- [x] Filtering: null board/class = targets all students

### Review System
- [x] `POST /reviews` — submit a student review (defaults to unapproved)
- [x] `GET /reviews` — list all reviews or filter by `?approved=1` or `?approved=0`
- [x] `GET /reviews/:id` — get a single review
- [x] `PATCH /reviews/:id` — update review fields including `approved` flag
- [x] `DELETE /reviews/:id` — delete a review
- [x] Runtime migration guard for `approved` column in legacy databases

### Dashboard Access Requests
- [x] `POST /Dashboard/createDashboard` — submit dashboard access request
- [x] `GET /Dashboard/Data` — list all dashboard records
- [x] Duplicate email check before creating record

### Database Backup
- [x] `GET /download-db` — token-protected SQLite file download
- [x] Returns 500 if token not configured, 401 if token mismatch, 404 if file missing

## What Is Incomplete / Pending

| Feature | Notes |
|---|---|
| Set Render env vars | `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` must be set on Render dashboard |
| Grant dashboard permission | No `PATCH /Dashboard/:id` endpoint to flip `permission = 1` |
| File/material upload | No file upload endpoint (admin panel has placeholder UI) |
| CORS restriction | Currently open to all origins; should be locked to frontend domain |
| Rate limiting | No rate limiting on auth endpoints |
| Email column on students | Email referenced in some frontend code but not in DB schema |
| `express-session` | Installed but not configured or used |
| `nodemon` in devDependencies | Currently in `dependencies` — should be moved |

## Known Issues

| Issue | Details |
|---|---|
| `dashboard` table `permission` never granted | Only `POST /Dashboard/createDashboard` exists; no endpoint to set `permission = 1` |
| `student.email` in frontend admin | `admin/script.js` references `student.email` but `students` table has no `email` column |
| `DELETE /DeleteStudent` uses request body | Unconventional — `id` passed in request body instead of URL param |
| `study_center.db` still in repo | The old SQLite file is still committed; it is unused but could be removed or gitignored |
| No logging | No structured logging; only `console.log/error` used |

## Current Status
**Live and stable** on Render. Database migrated from local SQLite3 file to **Turso cloud (libSQL)** — data now persists across all deployments. All core endpoints (student auth, subjects, fees, notices, reviews) are implemented and functional.

**Action required**: Set `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` on Render dashboard before deploying.