# OET LMS Submissions API

- **Auth and reports:** Register/login, save session reports, admin view of all reports (requires `DATABASE_URL`, `JWT_SECRET`).
- **Recordings:** Receives Patient Simulator recordings and emails them to the supervisor (optional SMTP).

**Supervisor email:** `concierge1@siya.health` (override via `LMS_SUPERVISOR_EMAIL`).

## Endpoints

**Auth**
- **POST** `/api/auth/register` – `{ email, password, name? }` → `{ token, user }`
- **POST** `/api/auth/login` – `{ email, password }` → `{ token, user }`
- **GET** `/api/auth/me` – Bearer token → user

**Sessions**
- **GET** `/api/sessions` – Bearer token → my sessions
- **POST** `/api/sessions` – Bearer token, body: session record → save session
- **GET** `/api/admin/sessions` – Bearer token (admin only) → all sessions
- **GET** `/api/admin/users` – Bearer token (admin only) → all users

**Recordings**
- **POST** `/api/submit-simulator`  
  - **Content-Type:** `multipart/form-data`  
  - **Fields:** `activityId`, `scenarioId`, `scenarioTitle`, `learnerId` (optional)  
  - **Files:** `recordings` (array of audio blobs, e.g. `recording_0.webm`, …)

## Run locally

1. From repo root: `npm install`.
2. **For auth and reports:** Set `DATABASE_URL` (PostgreSQL) and `JWT_SECRET` in `.env`. If unset, auth/sessions return 503.
3. **For email:** Set SMTP (see below). If unset, submissions are logged only.
4. Start the API:
   ```bash
   npm run dev --workspace=@amcare/oet-lms-submissions
   ```
   Default port: **3006**.

5. Start the OET LMS frontend (it proxies `/api` to `http://localhost:3006`). From repo root you can run everything in one go:
   ```bash
   npm run dev:oet-lms
   ```
   That starts: chat backend (3007), this API (3006), and OET LMS app (e.g. 3005). Open the URL Vite prints.

## Env

Create `.env` in this folder:

- **DATABASE_URL** – PostgreSQL connection string (required for auth/sessions).
- **JWT_SECRET** (or **OET_LMS_JWT_SECRET**) – Secret for JWT (required for auth).
- **JWT_EXPIRES_IN** – Token expiry (default: `7d`).
- **LMS_SUPERVISOR_EMAIL** – Recipient (default: `concierge1@siya.health`).
- **OET_LMS_SUBMISSIONS_PORT** – Server port (default: `3006`).
- **SMTP_HOST**, **SMTP_PORT**, **SMTP_USER**, **SMTP_PASS** – Used to send email. If unset, no email is sent; submission is logged only.
- **SMTP_FROM** – From address (defaults to SMTP_USER).
- **SMTP_SECURE** – `true` for 465.

Example (Gmail or SendGrid SMTP):

```env
LMS_SUPERVISOR_EMAIL=concierge1@siya.health
OET_LMS_SUBMISSIONS_PORT=3006
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-app@gmail.com
SMTP_PASS=your-app-password
```

## Create first admin user

After the DB is set up, create an admin (e.g. in `psql`):

```sql
-- Register a user in the app first, then:
UPDATE lms_users SET role = 'admin' WHERE email = 'your@email.com';
```

Or insert directly (password hash from bcrypt, e.g. `require('bcryptjs').hashSync('your-password', 12)` in Node):

```sql
INSERT INTO lms_users (email, password_hash, name, role)
VALUES ('admin@example.com', '$2a$12$...', 'Admin', 'admin');
```
