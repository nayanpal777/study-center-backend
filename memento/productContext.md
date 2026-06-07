# Product Context — Pal Study Center (Backend)

## Why This Project Exists
The Pal Study Center frontend is a static GitHub Pages site — it cannot store or query data on its own. This backend API provides the dynamic data layer that powers:
- Student registration and authentication
- Per-student personalized dashboard (subjects, fees, notices)
- Admin management capabilities
- Public review/testimonial display

## Problems It Solves
| Problem | Solution |
|---|---|
| Static site cannot store student data | Express API + SQLite3 database |
| Passwords must be stored securely | bcryptjs hashing with salt rounds = 10 |
| Students need personalized subject access | `student_subjects` table with per-student per-subject flags |
| Monthly fee tracking needed per student | `student_fees` table with 12 months auto-initialized on signup |
| Admin needs to send targeted announcements | `notices` table with board/class filters |
| Student reviews need moderation before display | `reviews.approved` column with admin approval flow |
| Database needs to be backed up remotely | Token-protected `/download-db` endpoint |

## How It Should Work

### Student Lifecycle
1. **Signup** → `POST /createStudent` → password hashed, student inserted, default subjects + fees auto-created
2. **Login** → `POST /StudentLogin` → phone + password verified via bcrypt → full student record returned
3. **Dashboard load** → frontend fetches subjects, notices, fees using student `id` from stored user object
4. **Password reset** → `PUT /forgotpassword` → phone + new password → password updated

### Admin Lifecycle
1. Admin account is a student record with `usertype = 'admin'`
2. **List students** → `GET /students` → full table returned
3. **Manage student** → PATCH endpoints for profile link, disable toggle, subject access, fee status
4. **Publish notice** → `POST /notices` with optional board/class targeting
5. **Manage reviews** → PATCH to approve/reject, DELETE to remove

### Data Auto-Initialization on Student Creation
When a student is created via `POST /createStudent`, **three things happen automatically**:
1. Student record inserted into `students` table
2. Default subjects created in `student_subjects` based on class:
   - Class 11/12: Physics, Chemistry, Mathematics, Biology, Hindi, English
   - Other classes: Science, Mathematics, Hindi, English, Social Science
3. All 12 monthly fee records created in `student_fees` with status `Unpaid`

## Business Rules
- Phone number must be **unique** — used as the primary login identifier
- Subject access defaults to **enabled (1)** for all default subjects
- Fee status valid values: `'Paid'`, `'Unpaid'`, `'Not applicable'`
- Reviews default to **unapproved (0)** — admin must approve before public display
- Notices with `null` board/class target **all students**
- Dashboard access block is controlled by `disable_profile` field on the student record