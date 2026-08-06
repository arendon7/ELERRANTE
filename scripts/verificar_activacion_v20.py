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
styles = read("assets/activation-v20.css")
schema = read("backend/supabase/schema-v20.sql")
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
    ('assets/activation-v20.js', "La página no carga el diagnóstico V2.0."),
    ('assets/activation-v20.css', "La página no carga los estilos V2.0."),
    ('Activación V2.1', "La navegación no identifica la activación."),
]:
    require(page, marker, label)

for marker, label in [
    ("RUNTIME.environment==='connected'", "El diagnóstico no distingue entorno conectado."),
    ('Supabase aún no está conectado', "Falta el estado honesto de modo previo."),
    ('signInWithPassword', "Falta autenticación administrativa en el diagnóstico."),
    ("rpc('is_admin')", "Falta verificación del rol administrativo."),
    ("activation_health_v20", "Falta el diagnóstico remoto V2.0."),
    ("set_admin_user_v20", "Falta la gestión protegida de administradores."),
    ("register_first_admin_v20", "Falta el comando controlado del primer administrador."),
    ("dataset.activationVersion='2.1.0'", "El módulo no declara su versión."),
]:
    require(script, marker, label)

for marker, label in [
    ('create table if not exists public.app_migrations', "Falta el registro de migraciones."),
    ('register_first_admin_v20', "Falta la función de primer administrador."),
    ('revoke execute on function public.register_first_admin_v20', "La función inicial no está restringida."),
    ('grant execute on function public.register_first_admin_v20(uuid,text) to postgres', "El alta inicial no queda limitada al SQL Editor."),
    ('set_admin_user_v20', "Falta el RPC de gobierno administrativo."),
    ('activation_health_v20', "Falta la función de diagnóstico."),
    ('receipt_bucket_private', "El diagnóstico no revisa privacidad de comprobantes."),
    ('No puedes desactivar tu propio acceso', "Falta protección contra autobloqueo."),
]:
    require(schema, marker, label)

require(admin, 'href="activacion.html"', "Administración no enlaza el centro V2.0.")
require(admin, 'Operación diaria, finanzas y activación · V2.1', "Administración no declara V2.0.")
require(styles, '.ee-v20-checklist', "Faltan estilos del checklist de activación.")
require(test, 'Supabase aún no está conectado', "La prueba no protege el modo previo.")
require(test, 'no solicita credenciales', "La prueba no protege la ausencia de login falso.")

for forbidden in ['SUPABASE_SERVICE', 'postgres://', 'eyJhbGciOi']:
    for label, content in [('activación', script), ('página', page), ('configuración', config)]:
        if forbidden.lower() in content.lower():
            PROBLEMS.append(f"Posible secreto expuesto en {label}: {forbidden}")

require(config, 'version: "2.1.0"', "La configuración comercial no declara V2.0.")
require(host, 'PUBLIC_VERSION="2.1.0"', "Host mode no declara V2.0.")
require(host, 'ACTIVE_CACHE="el-errante-v2-1-0"', "Host mode no usa la caché V2.0.")
require(worker, "const CACHE = 'el-errante-v2-1-0';", "Service worker no usa la caché V2.0.")
for asset in ['activacion.html','assets/activation-v20.js','assets/activation-v20.css','backend/supabase/schema-v20.sql']:
    require(worker, asset, f"Service worker no incluye {asset}.")
require(pages, 'version=2.1.0', "Pages no publica la versión V2.0.")
require(pages, 'verificar_activacion_v20.py', "Pages no ejecuta la barrera V2.0.")
require(pages, 'schema-v20.sql', "Pages no incluye la migración V2.0.")
require(health, 'el-errante-v2-1-0', "Public Health no verifica la caché V2.0.")
require(health, 'public-activation-v20.js', "Public Health no verifica el diagnóstico V2.0.")

print("EL ERRANTE V2.0 — BARRERA DE ACTIVACIÓN OPERATIVA")
print("Superficies: activación, administración, Supabase, Pages y Public Health")
print(f"Problemas: {len(PROBLEMS)}")
for problem in PROBLEMS:
    print("-", problem)
if PROBLEMS:
    sys.exit(1)
print("RESULTADO: PASS")
