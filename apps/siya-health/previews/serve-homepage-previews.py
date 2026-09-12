#!/usr/bin/env python3
"""Serve homepage color previews on two ports (A=8766, B=8767). Preview only."""
from __future__ import annotations

import http.server
import os
import socketserver
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)


def make_handler(variant_file: str):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            path = self.path.split("?", 1)[0]
            if path in ("/", "/index.html"):
                self.path = "/" + variant_file
            return super().do_GET()

        def log_message(self, fmt, *args):
            print(f"[{variant_file}] {fmt % args}")

    return Handler


def serve(port: int, variant_file: str) -> None:
    handler = make_handler(variant_file)
    with socketserver.TCPServer(("", port), handler) as httpd:
        httpd.allow_reuse_address = True
        print(f"Serving {variant_file} → http://127.0.0.1:{port}/")
        httpd.serve_forever()


if __name__ == "__main__":
    threads = [
        threading.Thread(target=serve, args=(8766, "preview-home-a.html"), daemon=True),
        threading.Thread(target=serve, args=(8767, "preview-home-b.html"), daemon=True),
    ]
    for t in threads:
        t.start()
    print("Variant A → http://127.0.0.1:8766/")
    print("Variant B → http://127.0.0.1:8767/")
    print("Ctrl+C to stop")
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        print("\nstopped")
