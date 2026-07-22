#!/usr/bin/env bash
# Prefer the 06-Statics pack as source of truth for WorkDrive statics.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec bash "$ROOT/06-Statics/AD-W-02/COPY-TO-TRUESYNC.sh"
