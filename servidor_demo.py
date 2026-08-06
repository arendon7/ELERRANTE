#!/usr/bin/env python3
"""Servidor local autocontenido de El Errante V2.8."""
from __future__ import annotations

import http.server
import os
import socket
import socketserver
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT_FILE = ROOT / '.demo_port'
ALLOWED_PAGES = {
    'index.html','tienda.html','admin.html','activacion.html','control.html',
    'operacion.html','studio.html','actas.html','presentacion.html','equipo.html'
}


def available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(('127.0.0.1', port))
        except OSError:
            return False
    return True


def choose_port() -> int:
    for port in range(8787, 8801):
        if available(port):
            return port
    raise RuntimeError('No hay puertos disponibles entre 8787 y 8800.')


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        print('[El Errante V2.8]', format % args)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> int:
    os.chdir(ROOT)
    requested = Path(sys.argv[1]).name if len(sys.argv) > 1 else 'index.html'
    page = requested if requested in ALLOWED_PAGES and (ROOT / requested).is_file() else 'index.html'
    port = choose_port()
    base = f'http://127.0.0.1:{port}'
    url = f'{base}/{page}?brand=2.8.0'
    PORT_FILE.write_text(str(port), encoding='utf-8')

    print('=' * 68)
    print('EL ERRANTE LOCAL V2.8 — CANON DE MARCA Y CONTENIDO')
    print('=' * 68)
    print(f'Web pública:    {base}/index.html')
    print(f'Tienda:         {base}/tienda.html')
    print(f'Administración: {base}/admin.html')
    print(f'Activación:     {base}/activacion.html')
    print(f'Control:        {base}/control.html')
    print(f'Presentación:   {base}/presentacion.html')
    print('')
    print('Mantén esta ventana abierta. Para detener, presiona Control + C.')
    print('=' * 68)

    webbrowser.open(url)
    with Server(('127.0.0.1', port), Handler) as server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nServidor local detenido.')
        finally:
            try:
                PORT_FILE.unlink()
            except FileNotFoundError:
                pass
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
