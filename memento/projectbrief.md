# Project Brief — Pal Study Center (Backend)

## Project Name
Study Center Backend — `study-center-backend`

## Overview
A **Node.js/Express REST API** that serves as the backend for the Pal Study Center website. It manages all dynamic data including student registration, authentication, notices, reviews, subject access, and fee tracking. The database is **Turso (libSQL)** — a cloud-hosted SQLite-compatible database that persists across deployments.

## Core Goals
1. Provide secure student registration and login endpoints (bcrypt password hashing)
2. Manage student records — create, read, update, delete
3. Control per-student subject access and fee status (admin manages, student reads)
4. Publish notices targeted by board/class for students to read on their dashboard
5. Handle student review submission and admin approval workflow
6. Provide a secure database download endpoint for backup purposes

## Deployment
- **Platform**: Render (free tier)
- **Production URL**: `https://study-center.onrender.com`
- **Database**: Turso (libSQL cloud) — `libsql://studycenter-nayanpal777.aws-ap-south-1.turso.io` — data persists across all deployments
- **Start command**: `node index.js`

## Consuming Client
- Frontend: `https://palstudycenter.github.io`
- API config managed in frontend [`config.js`](../../palstudycenter.github.io/config.js)

## Environment Variables
| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `TURSO_DB_URL` | Turso database URL | required |
| `TURSO_AUTH_TOKEN` | Turso auth token | required |

## Tech Lead Notes
- No ORM — raw libSQL queries via `@libsql/client` with thin async wrappers (`dbGet`, `dbAll`, `dbRun`)
- No authentication middleware/JWT — auth is done per-endpoint via bcrypt comparison
- CORS is fully open (`app.use(cors())`) — acceptable for this use case
- SQL dialect is fully SQLite-compatible — all existing queries work unchanged on Turso