from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise SystemExit(f"Falta {path}")
    return target.read_text(encoding="utf-8")


def require(path: str, *markers: str) -> str:
    text = read(path)
    for marker in markers:
        if marker not in text:
            raise SystemExit(f"{path} no contiene: {marker}")
    return text


data = require(
    "assets/materials-data-v23.js",
    "version:'2.3.0'",
    "EE-MAR-01",
    "EE-CPR-01",
    "MP-HFS",
    "MP-HHO",
    "REC-MASA-BASE-V23",
    "Agua adicional inferida",
    "stage:'Piloto'",
    "monthly:370000",
)

for sku in (
    "EE-MAR-01", "EE-BOS-01", "EE-DIA-01", "EE-CQM-01", "EE-ERR-01",
    "EE-CTP-02", "EE-CTG-02", "EE-HAT-1000", "EE-HAT-2500", "EE-HAT-5000",
    "EE-RBA-250", "EE-PYM-250", "EE-STP-500", "EE-CPR-01",
):
    if data.count(f"{{sku:'{sku}',ids:") != 1:
        raise SystemExit(f"Definición maestra ausente o duplicada: {sku}")

ui = require(
    "assets/materials-v23.js",
    "Lo necesario para producir, sin saturar el panel.",
    "Faltantes confirmados",
    "Conteos pendientes",
    "Actualizar conteo de materiales",
    "Consultar receta y costo provisional",
    "Resumen financiero y análisis avanzado",
    "dataset.materialsVersion='2.3.0'",
    "ee:admin:ready",
)
if "Sin conteo" not in ui or "Cero" not in ui:
    raise SystemExit("La interfaz no distingue inventario desconocido de cero confirmado")
if "explodeProduct" not in ui or "components" not in ui:
    raise SystemExit("Falta explosión de combos o BOM")

require(
    "admin.html",
    "assets/materials-v23.css",
    "id=\"materials-v23\"",
    "assets/materials-data-v23.js",
    "assets/materials-v23.js",
    "Activación V2.3",
    "Iteración 10",
)

admin = read("admin.html")
if admin.index("assets/materials-data-v23.js") > admin.index("assets/materials-v23.js"):
    raise SystemExit("El maestro V2.3 debe cargar antes del motor")
if admin.index("assets/materials-v23.js") > admin.index("assets/operations-v16.js"):
    raise SystemExit("V2.3 debe envolver el análisis financiero después de renderizarse")

config = require(
    "assets/commerce-config-v14.js",
    'version: "2.3.0"',
    'stage: "Piloto"',
    'dataStatus: "ESTIMADO"',
    'amount: 90000',
    'amount: 40000',
)
if "amount: 2000000" in config or "amount: 2500000" in config:
    raise SystemExit("La configuración aún conserva la cifra fija demostrativa como etapa activa")

admin_runtime = require(
    "assets/admin-v15.js",
    "legacyDemo",
    "legacyIds",
    "Etapa ${escapeHtml(BASE.finance?.stage",
    "ee:admin:ready",
    "Administración V2.3",
    "V2.2 y V2.3",
)
if "La base temporal continúa en $6.000.000 mensuales" in admin_runtime:
    raise SystemExit("El runtime administrativo aún muestra la cifra demo antigua")

schema = require(
    "backend/supabase/schema-v23.sql",
    "create table if not exists public.material_master",
    "create table if not exists public.product_bom",
    "create table if not exists public.material_inventory",
    "save_material_inventory_v23",
    "public.is_admin()",
    "values ('2.3'",
)
if "service_role" in schema.lower():
    raise SystemExit("schema-v23 no debe depender de service_role")

require("assets/materials-v23.css", ".ee-v23-grid", ".ee-v23-finance", "@media(max-width:620px)")

print("OK: materias primas, BOM, inventario inteligente y panel compacto V2.3 verificados")