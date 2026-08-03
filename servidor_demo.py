#!/usr/bin/env python3
from __future__ import annotations
import http.server
import socketserver
import socket
import webbrowser
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)


def free_port(start: int = 8080, end: int = 8120) -> int:
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise RuntimeError("No hay puertos disponibles entre 8080 y 8120.")

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        print("[El Errante]", format % args)

def main() -> int:
    port = free_port()
    url = f"http://127.0.0.1:{port}/index.html"
    (ROOT / ".demo_port").write_text(str(port), encoding="utf-8")
    print("=" * 62)
    print("EL ERRANTE — DEMO LOCAL AUTOCONTENIDA V0.5.0 GOLD MASTER CONTENT")
    print("=" * 62)
    print(f"Web:          {url}")
    print(f"Control:      http://127.0.0.1:{port}/control.html")
    print(f"Operación:    http://127.0.0.1:{port}/operacion.html")
    print(f"Presentación: http://127.0.0.1:{port}/presentacion.html")
    print("")
    print("Mantén esta ventana abierta mientras usas la demo.")
    print("Para detenerla, presiona Control + C.")
    print("=" * 62)
    webbrowser.open(url)
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), Handler) as server:
        server.daemon_threads = True
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nDemo detenida.")
        finally:
            try:
                (ROOT / ".demo_port").unlink()
            except FileNotFoundError:
                pass
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
