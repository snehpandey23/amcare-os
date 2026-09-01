# Prescription Generator — Clinic Profile (2026-08)

Near-term customization: staff auth + per-user clinic letterhead.

## What shipped

1. **Auth** — Siya staff JWT (`hipaa-training-users`). Login at `/login`. Same token key as staff portal (`hipaa-training-jwt`).
2. **ClinicProfile** — Postgres `prescription_clinic_profiles` (one row per user). Fields: clinic name, address, contact, doctor, degree, reg no, logo + signature data URLs.
3. **API** — `GET/PUT /api/clinic-profile` on auth API (`requireAuth`).
4. **PDF** — Uses form/profile fields (no hardcoded Amcare `PRACTICE_INFO`).
5. **UI** — Mounted `DoctorDetails`, `LetterheadUpload`, new `SignatureUpload`, Save clinic profile.

## Env

```bash
# apps/prescription-generator (.env.local + Vercel project env)
NEXT_PUBLIC_HIPAA_TRAINING_API_URL=https://siya-staff-auth-api.vercel.app
```

**Host:** Vercel `amcare-os-prescription-generator` — see `DEPLOY-VERCEL.md` (not Amplify).

## Verify multi-user isolation

1. Deploy auth API (table created on boot) — done via staff auth API deploy.
2. Deploy Rx: `cd apps/prescription-generator && npx vercel deploy --prod --yes`
3. User A: sign in → set Clinic A → **Save clinic profile** → Generate PDF → confirm Clinic A.
4. Sign out.
5. User B: sign in → empty/own profile (not A’s) → save Clinic B → PDF shows B only.

## Out of scope (still)

- Multi-clinic entities, Rx history, PHI audit of generated PDFs, blob storage.
