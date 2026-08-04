#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ISSUES: list[str] = []

PAGES = [
    "index.html", "historia.html", "nosotros.html", "tienda.html",
    "producto.html", "en-casa.html", "en-movimiento.html", "bitacora.html",
    "recetas.html", "herramientas.html", "cobertura.html", "ayuda.html",
    "checkout.html", "cuenta.html", "legal.html", "equipo.html",
    "admin.html", "control.html", "operacion.html", "studio.html",
    "actas.html", "presentacion.html",
]
VISUALS = [
    "home-hero", "home-masa-fuego", "home-fermentacion", "home-ingredientes",
    "home-compartir", "home-en-casa", "home-despensa", "evento-hero",
    "evento-noche", "evento-servicio", "producto-harina",
    "producto-crea-tuya", "producto-margherita", "producto-diavola",
    "producto-bosque", "producto-cuatro-quesos", "producto-la-errante",
    "producto-salsa-tomate", "producto-reduccion-balsamica",
    "producto-panela-maracuya", "producto-combo-primera-ruta",
]
PRODUCTS = [
    "harina-aire-y-tiempo", "crea-la-tuya", "margherita-del-taller",
    "diavola-errante", "bosque", "cuatro-quesos-montana", "la-errante",
    "salsa-tomate", "reduccion-balsamica", "panela-maracuya",
    "combo-primera-ruta",
]

for page in PAGES:
    if not (ROOT / page).is_file():
        ISSUES.append(f"Página faltante: {page}")

for name in VISUALS:
    path = ROOT / "assets/images/brand-final" / f"{name}.svg"
    if not path.is_file() or path.stat().st_size < 200:
        ISSUES.append(f"Visual faltante o vacío: {name}.svg")
        continue
    content = path.read_text(encoding="utf-8", errors="ignore")
    if "data:image/avif;base64," not in content:
        ISSUES.append(f"Visual sin AVIF autocontenido: {name}.svg")

manifest_path = ROOT / "assets/images/brand-final/manifest.json"
if not manifest_path.is_file():
    ISSUES.append("Manifest visual faltante")
else:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("count") != 21:
        ISSUES.append("El manifest visual no declara 21 activos")

host = (ROOT / "assets/host-mode.js").read_text(encoding="utf-8")
worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
workflow = (ROOT / ".github/workflows/pages.yml").read_text(encoding="utf-8")
for marker in [
    'PUBLIC_VERSION="1.2.0"', 'ACTIVE_CACHE="el-errante-v1-2-0"',
    'brand-final-direct', 'producto-panela-maracuya.svg',
]:
    if marker not in host:
        ISSUES.append(f"Host visual incompleto: {marker}")
if "el-errante-v1-2-0" not in worker:
    ISSUES.append("Service worker no usa la caché V1.2")
if "materializar_activos_visuales.py" not in workflow:
    ISSUES.append("El despliegue no materializa los activos visuales")

catalog = (ROOT / "assets/products-v6.js").read_text(encoding="utf-8")
for product in PRODUCTS:
    if product not in catalog:
        ISSUES.append(f"Producto faltante: {product}")

if "reducción balsámica endulzada con panela e infusionada con maracuyá" not in catalog.lower():
    ISSUES.append("Definición de Panela y Maracuyá incompleta")

print("EL ERRANTE V1.2 — BARRERA DE PUBLICACIÓN")
print(f"Páginas: {len(PAGES)}")
print(f"Visuales: {len(VISUALS)}")
print(f"Productos: {len(PRODUCTS)}")
print(f"Problemas: {len(ISSUES)}")
for issue in ISSUES:
    print("-", issue)
if ISSUES:
    sys.exit(1)
print("RESULTADO: PASS")
