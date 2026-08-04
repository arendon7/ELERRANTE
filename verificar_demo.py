#!/usr/bin/env python3
"""Barrera estructural, visual y de seguridad para El Errante V1.1."""

from __future__ import annotations

from pathlib import Path
from urllib.parse import unquote
import base64
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
    "studio.html", "actas.html", "presentacion.html",
]
SCRIPTS = [
    "assets/data.js", "assets/products-v6.js", "assets/runtime.js",
    "assets/app.js", "assets/preprod.js", "assets/content-v5.js",
    "assets/host-mode.js", "assets/control.js", "assets/presentation.js",
]
DIRECT_VISUALS = [
    "assets/images/brand-final/home-hero.svg",
    "assets/images/brand-final/home-masa-fuego.svg",
    "assets/images/brand-final/home-fermentacion.svg",
    "assets/images/brand-final/home-ingredientes.svg",
]
VISUAL_PACKS = {
    "assets/brand-final-editorial.js": [
        "home-compartir", "home-en-casa", "home-despensa", "evento-hero",
    ],
    "assets/brand-final-products-a.js": [
        "producto-harina", "producto-crea-tuya", "producto-margherita", "producto-diavola",
    ],
    "assets/brand-final-products-b.js": [
        "producto-bosque", "producto-cuatro-quesos", "producto-la-errante", "producto-combo-primera-ruta",
    ],
    "assets/brand-final-products-c.js": [
        "producto-salsa-tomate", "producto-reduccion-balsamica", "producto-panela-maracuya", "evento-noche",
    ],
}
PRODUCTS = [
    "harina-aire-y-tiempo", "crea-la-tuya", "margherita-del-taller",
    "diavola-errante", "bosque", "cuatro-quesos-montana", "la-errante",
    "salsa-tomate", "reduccion-balsamica", "panela-maracuya",
    "combo-primera-ruta",
]
REPO_FILES = [
    ".github/workflows/pages.yml", ".github/workflows/public-health.yml",
    "README.md", ".gitignore", "service-worker.js", "manifest.webmanifest",
    "deploy-version.txt", "assets/logo-mark.svg", "assets/logo-lockup.svg",
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


def validate_avif_payload(payload: str, label: str) -> None:
    compact = "".join(payload.split())
    compact += "=" * ((4 - len(compact) % 4) % 4)
    try:
        raw = base64.b64decode(compact, validate=False)
    except Exception as error:
        ISSUES.append(f"{label}: AVIF base64 ilegible ({error})")
        return
    if len(raw) < 20 or b"ftypavif" not in raw[:32]:
        ISSUES.append(f"{label}: contenido AVIF inválido")


for page in PUBLIC_PAGES:
    require(page, "Página pública")
for page in INTEGRAL_PAGES:
    require(page, "Módulo integral")
for script in SCRIPTS:
    require(script, "Script")
for required in REPO_FILES:
    require(required, "Archivo de repositorio")
for visual in DIRECT_VISUALS:
    require(visual, "Visual final")
for pack in VISUAL_PACKS:
    require(pack, "Paquete visual final")

for relative in DIRECT_VISUALS:
    content = text(relative)
    match = re.search(r"data:image/avif;base64,([^'\"]+)", content)
    if not match:
        ISSUES.append(f"{relative}: no contiene AVIF autocontenido")
    else:
        validate_avif_payload(match.group(1), relative)

for relative, expected_keys in VISUAL_PACKS.items():
    content = text(relative)
    for key in expected_keys:
        if f'"{key}"' not in content:
            ISSUES.append(f"{relative}: falta activo {key}")
    payloads = re.findall(r"data:image/avif;base64,([A-Za-z0-9+/=]+)", content)
    if len(payloads) != len(expected_keys):
        ISSUES.append(f"{relative}: contiene {len(payloads)} AVIF; se esperaban {len(expected_keys)}")
    for index, payload in enumerate(payloads, start=1):
        validate_avif_payload(payload, f"{relative} activo {index}")

host_mode = text("assets/host-mode.js")
service_worker = text("service-worker.js")
for marker in [
    'PUBLIC_VERSION="1.1.0"', 'ACTIVE_CACHE="el-errante-v1-1-0"',
    'dataset.visualSystem="brand-final"', 'dataset.eeVisualSystem="brand-final"',
    *DIRECT_VISUALS, *VISUAL_PACKS.keys(),
]:
    if marker not in host_mode and marker not in service_worker:
        ISSUES.append(f"Sistema visual final incompleto: falta {marker}")
for keys in VISUAL_PACKS.values():
    for key in keys:
        if key not in host_mode and key not in text(next(pack for pack, pack_keys in VISUAL_PACKS.items() if key in pack_keys)):
            ISSUES.append(f"Activo visual sin asociación: {key}")
if "assets/images/v040/" in service_worker:
    ISSUES.append("La caché pública todavía depende de visuales v0.4")

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

redirects = {
    "producto-harina.html": "producto.html?id=harina-aire-y-tiempo",
    "producto-crea-tuya.html": "producto.html?id=crea-la-tuya",
}
for file_name, target in redirects.items():
    if target not in text(file_name):
        ISSUES.append(f"{file_name}: no redirige a {target}")

products_source = text("assets/products-v6.js")
for product_id in PRODUCTS:
    if f'"{product_id}"' not in products_source:
        ISSUES.append(f"Catálogo incompleto: falta {product_id}")
if "reducción balsámica endulzada con panela e infusionada con maracuyá" not in products_source.lower():
    ISSUES.append("Panela y Maracuyá no conserva su definición balsámica correcta")

deploy_marker = text("deploy-version.txt")
cache_match = re.search(r"^cache=(.+)$", deploy_marker, re.M)
cache_name = cache_match.group(1).strip() if cache_match else ""
if "version=1.1.0" not in deploy_marker:
    ISSUES.append("deploy-version.txt no identifica version=1.1.0")
if cache_name != "el-errante-v1-1-0":
    ISSUES.append(f"Caché declarada incorrecta: {cache_name or 'vacía'}")
for relative, content in [("service-worker.js", service_worker), ("assets/host-mode.js", host_mode)]:
    if cache_name not in content:
        ISSUES.append(f"{relative} no usa la caché declarada {cache_name}")

workflow = text(".github/workflows/pages.yml")
for required in [
    'branches: ["main"]', "pull_request:", "github.event_name != 'pull_request'",
    "python3 verificar_demo.py", "python3 scripts/verificar_fuentes.py",
    "node scripts/exportar-fuente-canonica.mjs", "version=1.1.0",
    "cache=el-errante-v1-1-0", "brand-final-products-c.js",
]:
    if required not in workflow:
        ISSUES.append(f"Workflow incompleto: falta {required}")
for obsolete in ["aplicar_paquete_visual_v1.py", "unzip -q", "se conserva la línea visual estable v0.4"]:
    if obsolete in workflow:
        ISSUES.append(f"Workflow conserva flujo obsoleto: {obsolete}")
if (ROOT / "scripts/aplicar_paquete_visual_v1.py").exists():
    ISSUES.append("El aplicador ZIP visual obsoleto todavía existe")

secret_patterns = {
    "llave privada": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "token GitHub": r"\bgh[pousr]_[A-Za-z0-9]{20,}\b",
    "token OpenAI": r"\bsk-[A-Za-z0-9_-]{20,}\b",
}
text_extensions = {".html", ".js", ".css", ".json", ".md", ".txt", ".py", ".yml", ".yaml"}
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in text_extensions:
        continue
    if any(part in {".git", "_site", ".artifacts", "__pycache__", "node_modules"} for part in path.parts):
        continue
    content = path.read_text(encoding="utf-8", errors="ignore")
    for label, pattern in secret_patterns.items():
        if re.search(pattern, content):
            ISSUES.append(f"Posible {label} expuesta en {path.relative_to(ROOT)}")

print("EL ERRANTE V1.1.0 — BARRERA DE REGRESIÓN INTEGRAL")
print("=" * 59)
print(f"Páginas HTML encontradas: {len(html_files)}")
print(f"Páginas públicas requeridas: {len(PUBLIC_PAGES)}")
print(f"Módulos integrales requeridos: {len(INTEGRAL_PAGES)}")
print(f"Productos requeridos: {len(PRODUCTS)}")
print(f"Visuales finales validados: {len(DIRECT_VISUALS) + sum(map(len, VISUAL_PACKS.values()))}")
print(f"Caché declarada: {cache_name or 'NO DEFINIDA'}")
print(f"Archivos obligatorios validados: {len(CHECKED)}")
print(f"Problemas: {len(ISSUES)}")

if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)

print("RESULTADO: PASS")
