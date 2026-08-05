from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(path: str, *markers: str) -> str:
    file = ROOT / path
    if not file.is_file():
        raise SystemExit(f"Falta {path}")
    text = file.read_text(encoding="utf-8")
    for marker in markers:
        if marker not in text:
            raise SystemExit(f"{path} no contiene: {marker}")
    return text


content = require(
    "assets/content-v17.js",
    "Masa con tiempo. Fuego con carácter.",
    "Calidad que puede explicarse y también probarse.",
    "Elige cómo quieres vivir la pizza.",
    "Aprendimos la tradición para construir una voz propia.",
    "El último fuego cambia todo.",
    "Una pizzería encendida dentro de tu evento.",
    "Nuestra pizza insignia",
    "Balsámico, panela y maracuyá",
    "dataset.contentVersion='1.7.0'",
    "dataset.v17ProductPromise",
    "root.dataset.v17Product",
)

for product_id in (
    "harina-aire-y-tiempo",
    "crea-la-tuya",
    "margherita-del-taller",
    "diavola-errante",
    "bosque",
    "cuatro-quesos-montana",
    "la-errante",
    "salsa-tomate",
    "reduccion-balsamica",
    "panela-maracuya",
    "combo-primera-ruta",
):
    if f"'{product_id}'" not in content:
        raise SystemExit(f"Falta copy premium para {product_id}")

for page in ("index.html", "tienda.html", "producto.html", "historia.html", "en-casa.html", "en-movimiento.html"):
    text = require(page, "assets/content-v17.js")
    if text.index("assets/content-v17.js") > text.index("assets/app.js"):
        raise SystemExit(f"{page} carga content-v17 después de app.js")

require("assets/host-mode.js", 'PUBLIC_VERSION="1.7.0"', 'ACTIVE_CACHE="el-errante-v1-7-0"')
require("service-worker.js", "el-errante-v1-7-0", "assets/content-v17.js")
require("deploy-version.txt", "version=1.7.0", "cache=el-errante-v1-7-0")

for forbidden in (
    "la mejor pizza de colombia",
    "la mejor pizza de medellín",
    "100% artesanal",
    "auténtica napolitana certificada",
):
    if forbidden in content.lower():
        raise SystemExit(f"Afirmación no sustentada en contenido V1.7: {forbidden}")

print("OK: contenido gastronómico y conversión V1.7 verificados")
