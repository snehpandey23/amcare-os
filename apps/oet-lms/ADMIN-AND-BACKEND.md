# OET LMS – Backend, Admin, and Supervisor

## Is the app connected to a backend?

**Yes.** When the frontend is built with **`VITE_API_ORIGIN`** set (e.g. in AWS Amplify environment variables), it talks to the **OET LMS Submissions API** for:

- **Sign in / Create account** → `POST /api/auth/login`, `POST /api/auth/register`
- **Your profile** → `GET /api/auth/me`
- **Your sessions (reports)** → `GET /api/sessions`, `POST /api/sessions`
- **Admin: all users and all sessions** → `GET /api/admin/users`, `GET /api/admin/sessions` (admin only)

The API runs separately (e.g. on **Railway**). Set `VITE_API_ORIGIN` to your API base URL including `/api`, e.g. `https://your-app.up.railway.app/api`, then redeploy the frontend so the build picks it up.

---

## Who is the admin?

**Admin** = any user whose **`role`** in the database is **`admin`**.

- New accounts created via **Create account** get **`role = 'trainee'`** by default.
- There is **no separate “supervisor” role** in the app. “Supervisor” in the LMS means: trainees can **email their chat transcript** to a supervisor (any email they enter). That does not create a supervisor account in the system.

So:

- **Trainees** → sign in, use Chat Simulator, see their own Progress and reports.
- **Admins** → same as trainees, plus they see **“All reports”** in the sidebar and can view **all users** and **all session reports**.

---

## How to create an admin (first admin / supervisor account)

The app does **not** let you choose “admin” when registering. You make someone an admin by updating the database.

1. **Create the account in the app**  
   Have the person (or you) sign up via **Create account** on the login page.

2. **Set their role to admin in the database**  
   Connect to your **PostgreSQL** database (e.g. Railway Postgres) and run:

   ```sql
   UPDATE lms_users SET role = 'admin' WHERE email = 'their@email.com';
   ```

   Use the **exact email** they used to register.

3. **Sign in again**  
   After the next sign-in (or refresh), they will see **“All reports”** in the sidebar and can open the admin reports page.

To create an admin **without** using the app’s Create account flow, you can insert a user manually (you’ll need a bcrypt hash for the password). See **integrations/oet-lms-submissions/README.md** for an example.

---

## How to see accounts and their reports (admin)

1. **Sign in** with a user that has **`role = 'admin'`** in the database.
2. In the sidebar, click **“All reports”** (this link is only visible to admins).
3. On the **All reports** page you can:
   - **See all users** (accounts): list of users with email, name, role.
   - **See all sessions/reports**: session list from all trainees (and admins), with persona, scores, etc.

So: **accounts** = the user list on the admin reports page; **reports** = the session/report list on the same page. Both are visible only when signed in as an admin.

---

## Supervisor account vs admin

- **Supervisor** in this app = the person (email address) that trainees can **send their transcript to** from the Dashboard (“Send transcript to supervisor”). That is just an email destination; there is **no supervisor login or supervisor account** in the app.
- **Admin** = a **user account** with `role = 'admin'` that can sign in and see **All reports** (all users and all session reports). If you want a “supervisor” to see everyone’s reports, make that person an **admin** (set `role = 'admin'` for their email in the DB) and they sign in like any other user and use **All reports**.

---

## Summary

| Question | Answer |
|----------|--------|
| Connected to backend? | Yes, when `VITE_API_ORIGIN` is set to your Submissions API URL (e.g. Railway). |
| Who is the admin? | Any user with `role = 'admin'` in the `lms_users` table. |
| How to create admin? | Register in the app, then run `UPDATE lms_users SET role = 'admin' WHERE email = '...';` in the database. |
| How to see accounts and reports? | Sign in as admin → sidebar → **All reports**. |
| Supervisor account? | There is no supervisor account. To see all reports, use an **admin** account. |
