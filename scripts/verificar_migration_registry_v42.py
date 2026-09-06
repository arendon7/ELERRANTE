#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise SystemExit(f"FAIL: falta {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, marker: str, message: str) -> None:
    if marker not in text:
        raise SystemExit(f"FAIL: {message}")


def forbid(text: str, marker: str, message: str) -> None:
    if marker in text:
        raise SystemExit(f"FAIL: {message}")


v20 = read("backend/supabase/schema-v20.sql")
v23 = read("backend/supabase/schema-v23.sql")
v24 = read("backend/supabase/schema-v24.sql")
v25 = read("backend/supabase/schema-v25.sql")
v26 = read("backend/supabase/schema-v26.sql")
v27 = read("backend/supabase/schema-v27.sql")
a23 = read("assets/activation-v23.js")
a24 = read("assets/activation-v24.js")
a25 = read("assets/activation-v25.js")

require(v20, "create table if not exists public.app_migrations", "V2.0 no crea app_migrations")

for version, schema, activation in (
    ("2.3", v23, a23),
    ("2.4", v24, a24),
    ("2.5", v25, a25),
):
    require(schema, "insert into public.app_migrations(version,label)", f"schema V{version} no registra app_migrations")
    require(schema, f"values('{version}'", f"schema V{version} no registra su versión")
    forbid(schema, "public.schema_migrations", f"schema V{version} todavía depende de schema_migrations")
    require(activation, ".from('app_migrations').select('version')", f"activation V{version} no consulta app_migrations")
    require(activation, f".eq('version','{version}')", f"activation V{version} no verifica su versión")
    forbid(activation, "schema_migrations", f"activation V{version} todavía consulta schema_migrations")

require(v26, "insert into public.app_migrations(version,label)", "V2.6 dejó de registrar app_migrations")
forbid(v26, "public.schema_migrations", "V2.6 volvió a depender de schema_migrations")

# El bridge V2.7 puede nombrar la tabla legacy, pero sólo después de comprobar que existe
# y que conserva las columnas mínimas de evidencia.
require(v27, "to_regclass('public.schema_migrations')", "V2.7 no detecta condicionalmente la tabla legacy")
require(v27, "information_schema.columns", "V2.7 no valida columnas de la tabla legacy")
require(v27, "column_name='version'", "V2.7 no exige columna version")
require(v27, "column_name='description'", "V2.7 no exige columna description")
require(v27, "if v_legacy is not null then", "V2.7 no condiciona el bridge a existencia real")
require(v27, "if v_has_version and v_has_description then", "V2.7 no condiciona la importación a columnas válidas")
require(v27, "from public.schema_migrations", "V2.7 no contiene el bridge legacy")
require(v27, "where version::text in ('2.3','2.4','2.5')", "V2.7 importa versiones fuera del alcance")
require(v27, "on conflict(version) do nothing", "V2.7 podría sobrescribir evidencia canónica existente")
require(v27, "insert into public.app_migrations(version,label)", "V2.7 no registra su propia migración")
require(v27, "values('2.7'", "V2.7 no registra la versión 2.7")

# La referencia legacy debe aparecer dentro del bloque condicional, nunca antes.
legacy_guard = v27.index("if v_legacy is not null then")
column_guard = v27.index("if v_has_version and v_has_description then")
legacy_read = v27.index("from public.schema_migrations")
if not (legacy_guard < column_guard < legacy_read):
    raise SystemExit("FAIL: V2.7 consulta schema_migrations antes de validar existencia/columnas")

# El bridge jamás puede fabricar 2.3–2.5 mediante VALUES directos.
for version in ("2.3", "2.4", "2.5"):
    forbid(v27, f"values('{version}'", f"V2.7 fabrica evidencia para {version}")

print("PASS: app_migrations es canónico; V2.3–V2.6 lo usan y V2.7 sólo reconcilia evidencia legacy real")
