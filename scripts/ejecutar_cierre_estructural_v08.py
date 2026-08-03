#!/usr/bin/env python3
"""Corrige en memoria y ejecuta el cierre estructural v0.8."""

from pathlib import Path

path = Path(__file__).with_name("cerrar_estructura_v08.py")
source = path.read_text(encoding="utf-8")
source = source.replace('readme = read("README.md")n = None', 'readme = read("README.md")')
compile(source, str(path), "exec")
exec(compile(source, str(path), "exec"), {"__name__": "__main__", "__file__": str(path)})
