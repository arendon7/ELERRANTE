#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PROBLEMS: list[str] = []


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        PROBLEMS.append(f"Falta archivo requerido: {path}")
        return ""
    return target.read_text(encoding="utf-8")


def require(content: str, marker: str, label: str) -> None:
    if marker not in content:
        PROBLEMS.append(label)


page = read("activacion.html")
script = read("assets/activation-v20.js")
extension = read("assets/activation-v23.js")
styles = read("assets/activation-v20.css")
schema = read("backend/supabase/schema-v20.sql")
schema23 = read("backend/supabase/schema-v23.sql")
admin = read("admin.html")
worker = read("service-worker.js")
host = read("assets/host-mode.js")
config = read("assets/commerce-config-v14.js")
pages = read(".github/workflows/pages.yml")
health = read(".github/workflows/public-health.yml")
test = read("tests/e2e/activation-v20.spec.js")

for marker, label in [
    ('data-page="activacion"', "La página no declara el contrato de activación."),
    ('noindex,nofollow', "La activación no está excluida de indexación."),
    ('assets/activation-v20.js', "La página no carga el diagnóstico base."),
    ('assets/activation-v23.js', "La página no carga la extensión V2.3."),
    ('assets/activation-v20.css', "La página no carga los estilos."),
    ('Activación V2.3', "La navegación no identifica la activación vigente."),
]:
    require(page, marker, label)

for marker, label in [
    ("RUNTIME.environment==='connected'", "El diagnóstico no distingue entorno conectado."),
    ('Supabase aún no está conectado', "Falta el estado honesto de modo previo."),
    ('signInWithPassword', "Falta autenticación administrativa en el diagnóstico."),
    ("rpc('is_admin')", "Falta verificación del rol administrativo."),
    ("activation_health_v20", "Falta el diagnóstico remoto."),
    ("set_admin_user_v20", "Falta la gestión protegida de administradores."),
    ("register_first_admin_v20", "Falta el comando controlado del primer administrador."),
    ('Agenda de producción y despacho', "El diagnóstico base no revisa alistamiento."),
]:
    require(script, marker, label)

for marker, label in [
    ("dataset.activationVersion='2.3.0'", "La extensión no declara V2.3."),
    ("schema_migrations", "La extensión no consulta migraciones."),
    ("eq('version','2.3')", "La extensión no exige schema 2.3."),
    ("schema-v23.sql", "La extensión no orienta la migración V2.3."),
]:
    require(extension, marker, label)

for marker, label in [
    ('create table if not exists public.app_migrations', "Falta el registro de migraciones."),
    ('register_first_admin_v20', "Falta la función de primer administrador."),
    ('revoke execute on function public.register_first_admin_v20', "La función inicial no está restringida."),
    ('set_admin_user_v20', "Falta el RPC de gobierno administrativo."),
    ('activation_health_v20', "Falta la función de diagnóstico."),
    ('receipt_bucket_private', "El diagnóstico no revisa privacidad de comprobantes."),
    ('No puedes desactivar tu propio acceso', "Falta protección contra autobloqueo."),
]:
    require(schema, marker, label)

for marker in ['material_master','product_bom','material_inventory','save_material_inventory_v23']:
    require(schema23, marker, f"La migración V2.3 no incluye {marker}.")

require(admin, 'href="activacion.html"', "Administración no enlaza el centro de activación.")
require(admin, 'Operación diaria, producción, materiales y despacho · V2.3', "Administración no declara V2.3.")
require(styles, '.ee-v20-checklist', "Faltan estilos del checklist de activación.")
require(test, 'Supabase aún no está conectado', "La prueba no protege el modo previo.")

for forbidden in ['SUPABASE_SERVICE', 'postgres://', 'eyJhbGciOi']:
    for label, content in [('activación', script + extension), ('página', page), ('configuración', config)]:
        if forbidden.lower() in content.lower():
            PROBLEMS.append(f"Posible secreto expuesto en {label}: {forbidden}")

require(config, 'version: "2.3.0"', "La configuración comercial no declara V2.3.")
require(host, 'PUBLIC_VERSION="2.3.0"', "Host mode no declara V2.3.")
require(host, 'ACTIVE_CACHE="el-errante-v2-3-0"', "Host mode no usa la caché V2.3.")
require(worker, "const CACHE = 'el-errante-v2-3-0';", "Service worker no usa la caché V2.3.")
for asset in ['activacion.html','assets/activation-v20.js','assets/activation-v23.js','assets/activation-v20.css','backend/supabase/schema-v20.sql','backend/supabase/schema-v22.sql','backend/supabase/schema-v23.sql']:
    require(worker, asset, f"Service worker no incluye {asset}.")
require(pages, 'version=2.3.0', "Pages no publica V2.3.")
require(pages, 'verificar_activacion_v20.py', "Pages no ejecuta la barrera de activación.")
require(pages, 'schema-v23.sql', "Pages no incluye la migración V2.3.")
require(health, 'el-errante-v2-3-0', "Public Health no verifica la caché V2.3.")
require(health, 'public-activation-v23.js', "Public Health no verifica la extensión V2.3.")
require(health, 'public-materials-v23.js', "Public Health no verifica materiales V2.3.")

print("EL ERRANTE V2.3 — BARRERA DE ACTIVACIÓN OPERATIVA")
print("Superficies: activación, administración, Supabase, materiales, Pages y Public Health")
print(f"Problemas: {len(PROBLEMS)}")
for problem in PROBLEMS:
    print("-", problem)
if PROBLEMS:
    sys.exit(1)
print("RESULTADO: PASS")