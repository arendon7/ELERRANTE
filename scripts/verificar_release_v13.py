#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
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
    "home-hero", "home-hero-mobile", "home-masa-fuego",
    "home-fermentacion", "home-ingredientes", "home-compartir",
    "home-en-casa", "home-despensa", "evento-hero", "evento-noche",
    "evento-operacion", "evento-servicio", "og-el-errante",
    "producto-harina", "producto-crea-tuya", "producto-margherita",
    "producto-diavola", "producto-bosque", "producto-cuatro-quesos",
    "producto-la-errante", "producto-salsa-tomate",
    "producto-reduccion-balsamica", "producto-panela-maracuya",
    "producto-combo-primera-ruta",
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

visual_dir = ROOT / "assets/images/brand-final"
for name in VISUALS:
    path = visual_dir / f"{name}.webp"
    if not path.is_file() or path.stat().st_size < 100_000:
        ISSUES.append(f"Visual HQ faltante o insuficiente: {name}.webp")
        continue
    header = path.read_bytes()[:12]
    if not (header.startswith(b"RIFF") and header[8:12] == b"WEBP"):
        ISSUES.append(f"Formato WebP inválido: {name}.webp")

manifest_path = visual_dir / "manifest-hq-v13.json"
if not manifest_path.is_file():
    ISSUES.append("Manifest HQ V13 faltante")
else:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("version") != "1.3.0":
        ISSUES.append("El manifest HQ no declara la versión 1.3.0")
    if manifest.get("unique_assets") != 23:
        ISSUES.append("El manifest HQ no declara 23 activos únicos")
    if manifest.get("aliases", {}).get("evento-servicio.webp") != "evento-operacion.webp":
        ISSUES.append("Alias evento-servicio incompleto")
    for item in manifest.get("assets", []):
        path = visual_dir / item.get("file", "")
        if not path.is_file():
            ISSUES.append(f"Activo declarado pero ausente: {item.get('file')}")
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != item.get("sha256"):
            ISSUES.append(f"SHA-256 inconsistente: {item.get('file')}")
        if path.stat().st_size != item.get("bytes"):
            ISSUES.append(f"Tamaño inconsistente: {item.get('file')}")
        if int(item.get("width", 0)) < 960 or int(item.get("height", 0)) < 630:
            ISSUES.append(f"Resolución insuficiente: {item.get('file')}")

host = (ROOT / "assets/host-mode.js").read_text(encoding="utf-8")
worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
workflow = (ROOT / ".github/workflows/pages.yml").read_text(encoding="utf-8")
for marker in [
    'PUBLIC_VERSION="1.8.0"', 'ACTIVE_CACHE="el-errante-v1-8-0"',
    'brand-final-hq', 'home-hero-mobile.webp', 'producto-panela-maracuya.webp',
]:
    if marker not in host:
        ISSUES.append(f"Host HQ incompleto: {marker}")
index_html = (ROOT / "index.html").read_text(encoding="utf-8")
if "home-compartir.webp" not in host or "home-ingredientes.webp" not in host:
    ISSUES.append("Los editoriales Compartir e Ingredientes no están integrados en el runtime")
if "og-el-errante.webp" not in index_html or 'property="og:image"' not in index_html:
    ISSUES.append("La portada social oficial no está integrada en index.html")
if "el-errante-v1-8-0" not in worker:
    ISSUES.append("Service worker no usa la caché V1.3")
if "home-hero.webp" not in worker or "producto-margherita.webp" not in worker:
    ISSUES.append("Service worker no precarga los WebP HQ")
if "verificar_release_v13.py" not in workflow:
    ISSUES.append("El despliegue no ejecuta la barrera V1.3")

catalog = (ROOT / "assets/products-v6.js").read_text(encoding="utf-8")
for product in PRODUCTS:
    if product not in catalog:
        ISSUES.append(f"Producto faltante: {product}")
if "reducción balsámica endulzada con panela e infusionada con maracuyá" not in catalog.lower():
    ISSUES.append("Definición de Panela y Maracuyá incompleta")

print("EL ERRANTE V1.3 — BARRERA DE PUBLICACIÓN HQ")
print(f"Páginas: {len(PAGES)}")
print(f"Rutas visuales WebP: {len(VISUALS)}")
print(f"Productos: {len(PRODUCTS)}")
print(f"Problemas: {len(ISSUES)}")
for issue in ISSUES:
    print("-", issue)
if ISSUES:
    sys.exit(1)
print("RESULTADO: PASS")
