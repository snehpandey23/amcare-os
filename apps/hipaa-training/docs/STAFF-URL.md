# Staff URL — Siya Assistant (no GoDaddy)

## Easiest path

1. **New Vercel project:** `siya-staff-assist`  
2. **Staff bookmark:** https://siya-staff-assist.vercel.app  
3. **Deploy config:** [apps/siya-staff-assist/README.md](../../siya-staff-assist/README.md)

Same codebase as `apps/hipaa-training`. No DNS changes.

## Why not `siya-assistant.vercel.app`?

That hostname is registered to **another Vercel user** (unrelated app). Fresh deploys cannot take it — only a different project name works on `*.vercel.app`.

## Optional later

`assist.siya.health` only if you want a custom domain on GoDaddy — not required for v1.

## Legacy

- `hipaa-training` / `hipaa-training-eight` — old experiments; migrate staff to **siya-staff-assist** and ignore duplicates.
