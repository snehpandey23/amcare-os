#!/usr/bin/env python3
"""
Local dev server for Siya Health — clean URLs like production (/adhd-care → adhd-care.html).

Usage (from this folder):
  python3 serve_local.py
  python3 serve_local.py 9000

Then open http://localhost:8888/  and use nav links normally.
"""
from __future__ import annotations

import argparse
import os
import http.server
import socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PORT = 8888


class SiyaHealthRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        raw = self.path
        q = ""
        if "?" in raw:
            raw, q = raw.split("?", 1)
            q = "?" + q
        frag = ""
        if "#" in raw:
            raw, frag = raw.split("#", 1)
            frag = "#" + frag

        path_part = raw
        if path_part != "/":
            rel = path_part.lstrip("/")
            abs_path = os.path.join(ROOT, rel)
            if os.path.isfile(abs_path):
                pass
            elif os.path.isdir(abs_path):
                idx = os.path.join(abs_path, "index.html")
                if os.path.isfile(idx):
                    path_part = path_part.rstrip("/") + "/index.html"
            elif "." not in os.path.basename(path_part):
                html_name = rel + ".html"
                if os.path.isfile(os.path.join(ROOT, html_name)):
                    path_part = "/" + html_name

        self.path = path_part + q + frag
        return super().do_GET()


def main():
    p = argparse.ArgumentParser(description="Siya Health local server (clean URLs)")
    p.add_argument("port", nargs="?", type=int, default=DEFAULT_PORT, help="Port (default 8888)")
    args = p.parse_args()
    port = args.port

    with socketserver.TCPServer(("", port), SiyaHealthRequestHandler) as httpd:
        print(f"Siya Health — http://localhost:{port}/")
        print("  Clean URLs work: /adhd-care, /about, /blog, /blog/adhd, /blog/all, …")
        print("  Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
