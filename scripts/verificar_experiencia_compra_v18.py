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


ux = require(
    "assets/commerce-ux-v18.js",
    "const VERSION='1.8.0'",
    "Confirma tu pedido con claridad.",
    "Sin producción anticipada",
    "Total transparente",
    "Entrega coordinada",
    "Confirmar solicitud y enviar comprobante",
    "Ningún archivo seleccionado",
    "Compra con criterio",
    "La etiqueta y el empaque real prevalecen",
    "commerceUxVersion=VERSION",
)

require(
    "assets/commerce-v18.css",
    ".ee-v18-progress",
    ".ee-v18-mobile-total",
    ".ee-v18-store-trust",
    ".ee-v18-product-assurance",
)

for page in ("checkout.html", "tienda.html", "producto.html"):
    html = require(page, "assets/commerce-v18.css", "assets/commerce-ux-v18.js")
    if html.index("assets/commerce-v18.css") > html.index("</head>"):
        raise SystemExit(f"{page} carga el CSS V1.8 fuera del head")

require("assets/host-mode.js", 'PUBLIC_VERSION="1.8.0"', 'ACTIVE_CACHE="el-errante-v1-8-0"')
require("service-worker.js", "el-errante-v1-8-0", "assets/commerce-ux-v18.js", "assets/commerce-v18.css")
require("deploy-version.txt", "version=1.8.0", "cache=el-errante-v1-8-0")

for forbidden in (
    "pago garantizado",
    "entrega garantizada",
    "devolución garantizada",
    "disponibilidad garantizada",
):
    if forbidden in ux.lower():
        raise SystemExit(f"Promesa no sustentada en V1.8: {forbidden}")

print("OK: experiencia de compra y conversión V1.8 verificadas")
