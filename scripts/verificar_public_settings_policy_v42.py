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


base = read("backend/supabase/schema-v14.sql")
migration = read("backend/supabase/schema-v26.sql")
checkout = read("assets/checkout-v15.js")
actions = read("assets/public-actions-v29.js")
channels = read("assets/public-channel-settings-v4.js")
admin = read("assets/admin-v15.js")

OPEN_POLICY = 'create policy "public reads public settings" on public.public_settings for select to anon, authenticated using (true);'
ALLOWLIST_POLICY = 'create policy "public reads approved public settings" on public.public_settings for select to anon, authenticated using (key in (\'ordering\',\'payment\'));'

forbid(base, OPEN_POLICY, "el bootstrap conserva lectura pública irrestricta de public_settings")
require(base, ALLOWLIST_POLICY, "el bootstrap no limita public_settings a ordering/payment")
require(base, 'create policy "admins manage public settings"', "el bootstrap perdió la política administrativa")
require(base, "using (public.is_admin()) with check (public.is_admin());", "el bootstrap perdió acceso administrativo gobernado")

require(migration, 'drop policy if exists "public reads public settings"', "la migración no elimina la política pública histórica")
require(migration, 'create policy "public reads approved public settings"', "la migración no crea la política allowlist")
require(migration, "using (key in ('ordering','payment'));", "la migración no limita lectura a ordering/payment")
require(migration, 'drop policy if exists "admins manage public settings"', "la migración no reafirma política administrativa")
require(migration, "using (public.is_admin())", "la migración perdió autorización administrativa")
require(migration, "with check (public.is_admin())", "la migración perdió control de escritura administrativa")
require(migration, "insert into public.schema_migrations(version,description)", "la migración V2.6 no se registra")
require(migration, "values('2.6'", "schema_migrations no registra la versión 2.6")
forbid(migration, "using (true)", "la migración contiene una política RLS pública abierta")

# Contratos consumidores públicos conocidos.
require(checkout, '.from("public_settings")', "checkout dejó de usar public_settings")
require(checkout, '.in("key",["payment","ordering"])', "checkout solicita claves fuera de payment/ordering")
require(actions, ".from('public_settings').select('value').eq('key','ordering').maybeSingle()", "handoff público dejó de limitarse a ordering")
require(channels, ".from('public_settings').select('value').eq('key','ordering').maybeSingle()", "editor V4 dejó de leer ordering explícitamente")
require(channels, ".from('public_settings').upsert({key:'ordering'", "editor V4 dejó de escribir ordering explícitamente")
require(admin, 'client.from("public_settings").upsert({key:"payment"', "admin dejó de escribir payment explícitamente")

# No se permite ampliar la allowlist sin tocar deliberadamente este gate.
for public_key in ("ordering", "payment"):
    require(migration, f"'{public_key}'", f"falta {public_key} en allowlist pública")

print("PASS: public_settings limita lectura pública a ordering/payment, conserva acceso admin y registra V2.6")
