#!/usr/bin/env python3
from pathlib import Path
import re
import json
import sys

root = Path(__file__).resolve().parent
issues = []
html_files = list(root.glob("*.html"))

for html in html_files:
    text = html.read_text(encoding="utf-8")
    for attr in re.findall(r'(?:href|src)="([^"]+)"', text):
        if attr.startswith(("http:", "https:", "#", "mailto:", "tel:", "javascript:")):
            continue
        if "${" in attr:
            continue
        clean = attr.split("#",1)[0].split("?",1)[0]
        if clean and not (root / clean).exists():
            issues.append(f"{html.name}: referencia faltante {attr}")

required_repo = [".github/workflows/pages.yml", "README.md", ".gitignore"]
for name in required_repo:
    if not (root/name).exists():
        issues.append(f"Archivo de repositorio faltante: {name}")

required = [
    "index.html","tienda.html","producto.html","en-casa.html",
    "en-movimiento.html","bitacora.html","recetas.html","herramientas.html",
    "cobertura.html","ayuda.html","checkout.html","cuenta.html",
    "admin.html","operacion.html","studio.html","control.html","presentacion.html"
]
for name in required:
    if not (root/name).exists():
        issues.append(f"Página obligatoria faltante: {name}")

print("EL ERRANTE V0.5 — VERIFICACIÓN LOCAL")
print("="*46)
print(f"Páginas HTML: {len(html_files)}")
print(f"Problemas: {len(issues)}")
if issues:
    for issue in issues:
        print("-",issue)
    sys.exit(1)
print("RESULTADO: PASS")
