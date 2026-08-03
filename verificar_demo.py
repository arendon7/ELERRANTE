#!/usr/bin/env python3
"""Barrera estructural, visual y de seguridad para El Errante."""

from __future__ import annotations

from pathlib import Path
from urllib.parse import unquote
import re
import sys

ROOT = Path(__file__).resolve().parent
ISSUES: list[str] = []
CHECKED: list[str] = []

PUBLIC_PAGES = [
    "index.html", "historia.html", "tienda.html", "producto.html",
    "producto-harina.html", "producto-crea-tuya.html", "en-casa.html",
    "en-movimiento.html", "bitacora.html", "articulo.html", "recetas.html",
    "receta.html", "herramientas.html", "cobertura.html", "ayuda.html",
    "checkout.html", "cuenta.html", "caso-evento.html", "legal.html",
    "nosotros.html", "offline.html",
]
INTEGRAL_PAGES = [
    "equipo.html", "admin.html", "control.html", "operacion.html",
    "studio.html", "presentacion.html",
]
SCRIPTS = [
    "assets/data.js", "assets/products-v6.js", "assets/runtime.js",
    "assets/app.js", "assets/preprod.js", "assets/content-v5.js",
    "assets/host-mode.js", "assets/control.js", "assets/presentation.js",
]
VISUALS = [
    "v040-hero-desktop.svg", "v040-hero-mobile.svg",
    "v040-harina-empaques.svg", "v040-harina-manos.svg",
    "v040-harina-horno.svg", "v040-manos-masa.svg",
    "v040-masa-apertura.svg", "v040-alveolos.svg",
    "v040-fermentacion.svg", "v040-pizza-neo.svg",
    "v040-pizza-errante.svg", "v040-despensa.svg",
    "v040-aplicaciones-empaque.svg", "v040-pizzeria-movil.svg",
    "v040-bitacora-fuego.svg", "v040-pizzas-artesanales.svg",
    "v040-pizzas-coleccion.svg",
]
PRODUCTS = [
    "harina-aire-y-tiempo", "crea-la-tuya", "margherita-del-taller",
    "diavola-errante", "bosque", "cuatro-quesos-montana", "la-errante",
    "salsa-tomate", "reduccion-balsamica", "panela-maracuya",
    "combo-primera-ruta",
]
REPO_FILES = [
    ".github/workflows/pages.yml", "README.md", ".gitignore",
    "service-worker.js", "manifest.webmanifest", "deploy-version.txt",
    "documentacion/AUDITORIA_REGRESION_V040_V061.md",
    "documentacion/SNAPSHOT_AUTOCONTENIDO_V040.md",
    "documentacion/ACCESOS_DEMO.md",
]
EXTERNAL = ("http:", "https:", "//", "mailto:", "tel:", "javascript:", "data:", "blob:", "#")


def require(relative: str, label: str) -> None:
    if not (ROOT / relative).is_file():
        ISSUES.append(f"{label} faltante: {relative}")
    else:
        CHECKED.append(relative)


def text(relative: str) -> str:
    path = ROOT / relative
    return path.read_text(encoding="utf-8", errors="ignore") if path.is_file() else ""


def clean_reference(value: str) -> str | None:
    value = unquote(value.strip())
    if not value or value.startswith(EXTERNAL) or "${" in value or "{{" in value:
        return None
    value = value.split("#", 1)[0].split("?", 1)[0].removeprefix("./")
    return value or None


for page in PUBLIC_PAGES:
    require(page, "Página pública")
for page in INTEGRAL_PAGES:
    require(page, "Módulo integral")
for script in SCRIPTS:
    require(script, "Script")
for required in REPO_FILES:
    require(required, "Archivo de repositorio")
for visual in VISUALS:
    require(f"assets/images/v040/{visual}", "Visual v0.4")

# Referencias locales de HTML y CSS.
html_files = sorted(ROOT.glob("*.html"))
attribute_pattern = re.compile(r'(?:href|src|poster|action)=["\']([^"\']+)["\']', re.I)
srcset_pattern = re.compile(r'srcset=["\']([^"\']+)["\']', re.I)
for html in html_files:
    content = html.read_text(encoding="utf-8")
    references = attribute_pattern.findall(content)
    references += [candidate.strip().split(" ", 1)[0] for group in srcset_pattern.findall(content) for candidate in group.split(",")]
    for reference in references:
        cleaned = clean_reference(reference)
        if cleaned and not (ROOT / cleaned).exists():
            ISSUES.append(f"{html.name}: referencia faltante {reference}")

for css in sorted((ROOT / "assets").rglob("*.css")):
    for reference in re.findall(r'url\(["\']?([^\)"\']+)', css.read_text(encoding="utf-8"), re.I):
        cleaned = clean_reference(reference)
        if cleaned and not (css.parent / cleaned).resolve().exists():
            ISSUES.append(f"{css.relative_to(ROOT)}: recurso faltante {reference}")

# Alias históricos de producto.
redirects = {
    "producto-harina.html": "producto.html?id=harina-aire-y-tiempo",
    "producto-crea-tuya.html": "producto.html?id=crea-la-tuya",
}
for file_name, target in redirects.items():
    if target not in text(file_name):
        ISSUES.append(f"{file_name}: no redirige a {target}")

# Catálogo y visuales.
products_source = text("assets/products-v6.js")
for product_id in PRODUCTS:
    if f'"{product_id}"' not in products_source:
        ISSUES.append(f"Catálogo incompleto: falta {product_id}")

host_mode = text("assets/host-mode.js")
service_worker = text("service-worker.js")
for visual in VISUALS:
    if visual != "v040-pizzas-artesanales.svg" and visual not in host_mode:
        ISSUES.append(f"Mapa visual incompleto: {visual}")
    if visual not in service_worker:
        ISSUES.append(f"Caché visual incompleta: {visual}")

for page, visual in {
    "bitacora.html": "v040-bitacora-fuego.svg",
    "tienda.html": "v040-pizzas-coleccion.svg",
    "en-casa.html": "v040-pizzas-coleccion.svg",
}.items():
    if visual not in text(page):
        ISSUES.append(f"{page}: no usa directamente {visual}")

# Una única versión de caché declarada.
deploy_marker = text("deploy-version.txt")
cache_match = re.search(r"^cache=(.+)$", deploy_marker, re.M)
cache_name = cache_match.group(1).strip() if cache_match else ""
if "version=0.6.1" not in deploy_marker:
    ISSUES.append("deploy-version.txt no identifica version=0.6.1")
if not cache_name:
    ISSUES.append("deploy-version.txt no declara cache=")
else:
    if cache_name not in service_worker:
        ISSUES.append(f"service-worker.js no usa la caché declarada {cache_name}")
    if cache_name not in host_mode:
        ISSUES.append(f"host-mode.js no usa la caché declarada {cache_name}")

# CI y despliegue.
workflow = text(".github/workflows/pages.yml")
for required in [
    'branches: ["main"]', "pull_request:", "github.event_name != 'pull_request'",
    "python3 verificar_demo.py", "python3 scripts/verificar_fuentes.py",
    "node scripts/exportar-fuente-canonica.mjs",
]:
    if required not in workflow:
        ISSUES.append(f"Workflow incompleto: falta {required}")
if "fix/v0.5.1-restore-gold-assets" in workflow:
    ISSUES.append("El workflow todavía referencia la rama histórica bloqueada")

# Patrones evidentes de secretos reales.
secret_patterns = {
    "llave privada": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "token GitHub": r"\bgh[pousr]_[A-Za-z0-9]{20,}\b",
    "token OpenAI": r"\bsk-[A-Za-z0-9_-]{20,}\b",
}
text_extensions = {".html", ".js", ".css", ".json", ".md", ".txt", ".py", ".yml", ".yaml"}
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in text_extensions:
        continue
    if any(part in {".git", "_site", ".artifacts", "__pycache__"} for part in path.parts):
        continue
    content = path.read_text(encoding="utf-8", errors="ignore")
    for label, pattern in secret_patterns.items():
        if re.search(pattern, content):
            ISSUES.append(f"Posible {label} expuesta en {path.relative_to(ROOT)}")

print("EL ERRANTE V0.6.1 — BARRERA DE REGRESIÓN INTEGRAL")
print("=" * 58)
print(f"Páginas HTML encontradas: {len(html_files)}")
print(f"Páginas públicas requeridas: {len(PUBLIC_PAGES)}")
print(f"Módulos integrales requeridos: {len(INTEGRAL_PAGES)}")
print(f"Productos requeridos: {len(PRODUCTS)}")
print(f"Visuales v0.4 requeridos: {len(VISUALS)}")
print(f"Caché declarada: {cache_name or 'NO DEFINIDA'}")
print(f"Archivos obligatorios validados: {len(CHECKED)}")
print(f"Problemas: {len(ISSUES)}")

if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)

print("RESULTADO: PASS")
