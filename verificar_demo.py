#!/usr/bin/env python3
"""Valida la integridad estructural de El Errante antes de publicar.

La prueba evita que una migración o iteración elimine páginas, modelos, activos
visuales aprobados o referencias locales necesarias para la demo integral.
"""

from pathlib import Path
from urllib.parse import unquote
import re
import sys

ROOT = Path(__file__).resolve().parent
ISSUES: list[str] = []
CHECKS: list[str] = []

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

REQUIRED_SCRIPTS = [
    "assets/data.js", "assets/products-v6.js", "assets/runtime.js",
    "assets/app.js", "assets/preprod.js", "assets/content-v5.js",
    "assets/host-mode.js", "assets/control.js", "assets/presentation.js",
]

VISUAL_ASSETS = [
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

PRODUCT_IDS = [
    "harina-aire-y-tiempo", "crea-la-tuya", "margherita-del-taller",
    "diavola-errante", "bosque", "cuatro-quesos-montana", "la-errante",
    "salsa-tomate", "reduccion-balsamica", "panela-maracuya",
    "combo-primera-ruta",
]

REQUIRED_REPO_FILES = [
    ".github/workflows/pages.yml", "README.md", ".gitignore",
    "service-worker.js", "manifest.webmanifest", "deploy-version.txt",
    "documentacion/AUDITORIA_REGRESION_V040_V061.md",
    "documentacion/SNAPSHOT_AUTOCONTENIDO_V040.md",
    "documentacion/ACCESOS_DEMO.md",
]

EXTERNAL_PREFIXES = (
    "http:", "https:", "//", "mailto:", "tel:", "javascript:",
    "data:", "blob:", "#",
)


def require_file(relative_path: str, label: str) -> None:
    path = ROOT / relative_path
    if not path.is_file():
        ISSUES.append(f"{label} faltante: {relative_path}")
    else:
        CHECKS.append(relative_path)


def clean_reference(reference: str) -> str | None:
    reference = unquote(reference.strip())
    if not reference or reference.startswith(EXTERNAL_PREFIXES):
        return None
    if "${" in reference or "{{" in reference:
        return None
    reference = reference.split("#", 1)[0].split("?", 1)[0]
    if not reference:
        return None
    return reference.removeprefix("./")


def validate_reference(source: Path, reference: str) -> None:
    cleaned = clean_reference(reference)
    if cleaned is None:
        return
    target = ROOT / cleaned
    if not target.exists():
        ISSUES.append(f"{source.relative_to(ROOT)}: referencia faltante {reference}")


for page in PUBLIC_PAGES:
    require_file(page, "Página pública")
for page in INTEGRAL_PAGES:
    require_file(page, "Módulo integral")
for script in REQUIRED_SCRIPTS:
    require_file(script, "Script")
for file_name in REQUIRED_REPO_FILES:
    require_file(file_name, "Archivo de repositorio")
for asset in VISUAL_ASSETS:
    require_file(f"assets/images/v040/{asset}", "Activo visual v0.4")

# Referencias estáticas de HTML.
html_files = sorted(ROOT.glob("*.html"))
attribute_pattern = re.compile(r'(?:href|src|poster|action)=["\']([^"\']+)["\']', re.I)
srcset_pattern = re.compile(r'srcset=["\']([^"\']+)["\']', re.I)

for html in html_files:
    text = html.read_text(encoding="utf-8")
    for reference in attribute_pattern.findall(text):
        validate_reference(html, reference)
    for srcset in srcset_pattern.findall(text):
        for candidate in srcset.split(","):
            reference = candidate.strip().split(" ", 1)[0]
            validate_reference(html, reference)

# Recursos locales usados desde CSS.
for css in sorted((ROOT / "assets").rglob("*.css")):
    text = css.read_text(encoding="utf-8")
    for reference in re.findall(r'url\(["\']?([^\)"\']+)', text, re.I):
        cleaned = clean_reference(reference)
        if cleaned is None:
            continue
        target = (css.parent / cleaned).resolve()
        if not target.exists():
            ISSUES.append(f"{css.relative_to(ROOT)}: recurso CSS faltante {reference}")

# Los alias históricos siguen funcionando y apuntan a la ficha dinámica.
redirect_expectations = {
    "producto-harina.html": "producto.html?id=harina-aire-y-tiempo",
    "producto-crea-tuya.html": "producto.html?id=crea-la-tuya",
}
for file_name, target in redirect_expectations.items():
    text = (ROOT / file_name).read_text(encoding="utf-8") if (ROOT / file_name).exists() else ""
    if target not in text:
        ISSUES.append(f"{file_name}: no conserva la redirección canónica a {target}")

# Catálogo: las once referencias deben permanecer en la capa comercial.
products_text = (ROOT / "assets/products-v6.js").read_text(encoding="utf-8")
for product_id in PRODUCT_IDS:
    if f'"{product_id}"' not in products_text:
        ISSUES.append(f"Catálogo incompleto: falta el producto {product_id}")

# La capa de recuperación y la caché deben conocer los 17 visuales aprobados.
host_mode = (ROOT / "assets/host-mode.js").read_text(encoding="utf-8")
service_worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
for asset in VISUAL_ASSETS:
    if asset not in host_mode and asset not in {
        "v040-pizzas-artesanales.svg",
    }:
        ISSUES.append(f"Mapa visual incompleto: {asset} no está activo en host-mode.js")
    if asset not in service_worker:
        ISSUES.append(f"Caché incompleta: {asset} no está incluido en service-worker.js")

if "el-errante-v0-6-6" not in service_worker:
    ISSUES.append("service-worker.js no usa la caché esperada el-errante-v0-6-6")

# Las tres superficies editoriales deben apuntar directamente a los activos restaurados.
direct_visuals = {
    "bitacora.html": "v040-bitacora-fuego.svg",
    "tienda.html": "v040-pizzas-coleccion.svg",
    "en-casa.html": "v040-pizzas-coleccion.svg",
}
for page, asset in direct_visuals.items():
    text = (ROOT / page).read_text(encoding="utf-8")
    if asset not in text:
        ISSUES.append(f"{page}: no usa directamente el visual recuperado {asset}")

# Versión, despliegue y barrera de CI.
deploy_marker = (ROOT / "deploy-version.txt").read_text(encoding="utf-8")
if "version=0.6.1" not in deploy_marker:
    ISSUES.append("deploy-version.txt no identifica la versión 0.6.1")

workflow = (ROOT / ".github/workflows/pages.yml").read_text(encoding="utf-8")
if 'branches: ["main"]' not in workflow:
    ISSUES.append("El workflow de Pages debe desplegar exclusivamente desde main")
if "python3 verificar_demo.py" not in workflow:
    ISSUES.append("El workflow no ejecuta la barrera de regresión verificar_demo.py")
if "fix/v0.5.1-restore-gold-assets" in workflow:
    ISSUES.append("El workflow todavía referencia la rama histórica bloqueada")

# Evita secretos evidentes en texto plano. Las credenciales ficticias .demo son válidas.
secret_patterns = {
    "llave privada": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "token GitHub": r"\bgh[pousr]_[A-Za-z0-9]{20,}\b",
    "token OpenAI": r"\bsk-[A-Za-z0-9_-]{20,}\b",
}
text_extensions = {".html", ".js", ".css", ".json", ".md", ".txt", ".py", ".yml", ".yaml"}
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in text_extensions:
        continue
    if any(part in {".git", "_site", "__pycache__"} for part in path.parts):
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for label, pattern in secret_patterns.items():
        if re.search(pattern, text):
            ISSUES.append(f"Posible {label} expuesta en {path.relative_to(ROOT)}")

print("EL ERRANTE V0.6.1 — BARRERA DE REGRESIÓN INTEGRAL")
print("=" * 58)
print(f"Páginas HTML encontradas: {len(html_files)}")
print(f"Páginas públicas requeridas: {len(PUBLIC_PAGES)}")
print(f"Módulos integrales requeridos: {len(INTEGRAL_PAGES)}")
print(f"Productos requeridos: {len(PRODUCT_IDS)}")
print(f"Visuales v0.4 requeridos: {len(VISUAL_ASSETS)}")
print(f"Archivos obligatorios validados: {len(CHECKS)}")
print(f"Problemas: {len(ISSUES)}")

if ISSUES:
    for issue in ISSUES:
        print("-", issue)
    sys.exit(1)

print("RESULTADO: PASS")
