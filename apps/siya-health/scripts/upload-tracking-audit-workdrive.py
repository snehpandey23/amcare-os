#!/usr/bin/env python3
"""
Upload monthly tracking-audit markdown to Zoho WorkDrive.

Reuses OAuth + upload helpers from workdrive_phase3_sync.py (same secrets as
the cloud content / Phase-3 pipeline):

  ZOHO_CLIENT_ID · ZOHO_CLIENT_SECRET · ZOHO_REFRESH_TOKEN · ZOHO_ACCOUNTS_URL
  WORKDRIVE_DRYRUN_04_ID

Destination (no new folder-id secret required):

  Siya Knowledge Editorial/_API-DRY-RUN/04-Content-Tracker/tracking-audits/

Optional override: WORKDRIVE_TRACKING_AUDIT_FOLDER_ID (direct parent folder id).

Usage:
  python3 apps/siya-health/scripts/upload-tracking-audit-workdrive.py \\
    --md apps/siya-health/docs/tracking-audits/2026-10.md
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "apps/siya-health/brand/scripts"))

from workdrive_phase3_sync import (  # noqa: E402
    api_create_folder,
    api_find_child_id,
    api_upload_file,
    zoho_access_token,
)

SUBFOLDER_NAME = "tracking-audits"
TRUE_SYNC_PATH = (
    "Common Folder/Siya Knowledge Editorial/_API-DRY-RUN/04-Content-Tracker/tracking-audits/"
)


def ensure_tracking_audits_folder(token: str) -> str:
    override = "".join(os.environ.get("WORKDRIVE_TRACKING_AUDIT_FOLDER_ID", "").split())
    if override:
        print(f"Using WORKDRIVE_TRACKING_AUDIT_FOLDER_ID …{override[-6:]}")
        return override

    dry04 = "".join(os.environ.get("WORKDRIVE_DRYRUN_04_ID", "").split())
    if not dry04:
        raise SystemExit("Missing WORKDRIVE_DRYRUN_04_ID (same secret as Phase-3 sync)")

    # Create/find under the known dry-run 04 folder (avoids cross-region parent lookup).
    existing = api_find_child_id(token, dry04, SUBFOLDER_NAME)
    if existing:
        print(f"Found existing {SUBFOLDER_NAME} under DRYRUN_04 …{existing[-6:]}")
        return existing
    created = api_create_folder(token, dry04, SUBFOLDER_NAME)
    if not created:
        raise SystemExit(f"Failed to create {SUBFOLDER_NAME} under WORKDRIVE_DRYRUN_04_ID")
    print(f"Created {SUBFOLDER_NAME} under DRYRUN_04 …{created[-6:]}")
    return created


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--md", required=True, help="Path to tracking audit .md summary")
    args = ap.parse_args()
    md = Path(args.md).resolve()
    if not md.is_file() or md.suffix.lower() != ".md":
        raise SystemExit(f"Expected .md file, got {md}")

    token = zoho_access_token()
    folder_id = ensure_tracking_audits_folder(token)
    api_upload_file(token, folder_id, md, upload_name=md.name)
    print(f"Uploaded {md.name}")
    print(f"WorkDrive path: {TRUE_SYNC_PATH}{md.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
