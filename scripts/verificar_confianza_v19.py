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

schema = require(
    "backend/supabase/schema-v19.sql",
    "order_status_events",
    "record_order_status_event_v19",
    "lookup_order_status_v19",
    "grant execute on function public.lookup_order_status_v19(text,text) to anon, authenticated",
    "No devuelve dirección, teléfono, comprobante ni notas internas",
)

trust = require(
    "assets/trust-v19.js",
    "Consulta segura · V1.9",
    "lookup_order_status_v19",
    "Esta consulta no muestra dirección, teléfono, comprobante ni notas internas",
    "Cobertura, soporte y seguimiento",
    "Copiar actualización",
    "data-v19-admin",
    "dataset.trustVersion='1.9.0'",
)

require(
    "assets/trust-v19.css",
    ".ee-v19-tracker",
    ".ee-v19-progress",
    ".ee-v19-admin",
)

require("cuenta.html", "Seguimiento de pedidos", "assets/trust-v19.js", "assets/trust-v19.css")
require("checkout.html", "Consultar un pedido existente", "assets/trust-v19.js", "assets/trust-v19.css")
require("admin.html", "Operación, finanzas y activación · V2.0", "assets/trust-v19.js", "assets/trust-v19.css")
require("assets/commerce-config-v14.js", 'version: "2.0.0"', "deliveryFeePolicy", "expectedResponseHours")
require("assets/host-mode.js", 'PUBLIC_VERSION="2.0.0"', 'ACTIVE_CACHE="el-errante-v2-0-0"')
require("service-worker.js", "el-errante-v2-0-0", "assets/trust-v19.js", "assets/trust-v19.css", "schema-v19.sql")
require("deploy-version.txt", "version=2.0.0", "cache=el-errante-v2-0-0")

for forbidden in (
    "select('*')",
    'select("*")',
    "customer_phone",
    "delivery_notes",
    "storage_path",
):
    rpc_section = schema[schema.index("create or replace function public.lookup_order_status_v19"):]
    if forbidden in rpc_section.split("revoke all", 1)[0]:
        raise SystemExit(f"La consulta pública contiene un campo o patrón no permitido: {forbidden}")

for forbidden in (
    "entrega garantizada",
    "disponibilidad garantizada",
    "pago garantizado",
):
    if forbidden in trust.lower():
        raise SystemExit(f"Promesa no sustentada en V1.9: {forbidden}")

print("OK: confianza comercial, consulta limitada y trazabilidad V1.9 verificadas")
