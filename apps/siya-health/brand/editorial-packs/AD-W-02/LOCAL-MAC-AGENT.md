# Local Mac agent — paste this prompt

```text
You are on my Mac with Zoho TrueSync connected (Amcare Medical Consultancy India Pvt Ltd).

1. Checkout branch `cursor/adhd-post-standards-refine-f70a` (or pull latest).
2. Run:
   bash apps/siya-health/brand/06-Statics/AD-W-02/COPY-TO-TRUESYNC.sh
3. Confirm files appear at:
   ~/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/06-Statics/AD-W-02/
4. Ensure Content Tracker has row AD-W-02 (CSV synced; merge into Siya-Content-Tracker.xlsx if that’s the live sheet).
5. Do not reinvent folders. Do not use zoho-common/. Knowledge Editorial only.
```

## One-liner (Terminal on Mac)

```bash
cd /path/to/amcare-os && git fetch origin && git checkout cursor/adhd-post-standards-refine-f70a && git pull && bash apps/siya-health/brand/06-Statics/AD-W-02/COPY-TO-TRUESYNC.sh
```
