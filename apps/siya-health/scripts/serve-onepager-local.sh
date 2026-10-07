#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=8788
PIDFILE=/tmp/siya-onepager-http.pid
LOG=/tmp/siya-onepager-http.log
if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "Already running pid $(cat "$PIDFILE") → http://127.0.0.1:$PORT/employers/one-pager.html"
  exit 0
fi
cd "$ROOT"
nohup python3 -m http.server "$PORT" --bind 127.0.0.1 >"$LOG" 2>&1 &
echo $! >"$PIDFILE"
echo "Started pid $(cat "$PIDFILE")"
echo "http://127.0.0.1:$PORT/employers/one-pager.html"
