#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace(path: str, old: str, new: str) -> None:
    target = ROOT / path
    content = target.read_text(encoding="utf-8")
    if old not in content:
        raise SystemExit(f"No se encontró el marcador esperado en {path}: {old}")
    target.write_text(content.replace(old, new), encoding="utf-8")


replace("assets/host-mode.js", 'PUBLIC_VERSION="1.4.0"', 'PUBLIC_VERSION="1.5.0"')
replace("assets/host-mode.js", 'ACTIVE_CACHE="el-errante-v1-4-0"', 'ACTIVE_CACHE="el-errante-v1-5-0"')

release = ROOT / "scripts/verificar_release_v13.py"
release_text = release.read_text(encoding="utf-8")
release_text = release_text.replace("1.4.0", "1.5.0").replace("el-errante-v1-4-0", "el-errante-v1-5-0")
release.write_text(release_text, encoding="utf-8")

deploy = ROOT / "deploy-version.txt"
deploy_text = deploy.read_text(encoding="utf-8")
deploy_text = re.sub(r"^version=.*$", "version=1.5.0", deploy_text, flags=re.MULTILINE)
deploy_text = re.sub(r"^cache=.*$", "cache=el-errante-v1-5-0", deploy_text, flags=re.MULTILINE)
deploy.write_text(deploy_text, encoding="utf-8")

roadmap = ROOT / "documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md"
roadmap_text = roadmap.read_text(encoding="utf-8")
status = """

## Estado de avance — V1.5 / Iteración 2

Implementado en código:

- Configuración runtime sin credenciales privadas versionadas.
- Sesiones separadas para comprador anónimo y administrador permanente.
- Inicio de sesión administrativo mediante Supabase Auth.
- Verificación de autorización contra `admin_users` y RLS.
- Lectura sincronizada de pedidos, comprobantes, catálogo, inventario, costos y gastos fijos.
- Comprobantes privados abiertos mediante enlaces firmados de corta duración.
- Escritura remota de estados, catálogo, costos y datos públicos de transferencia.
- Migración V1.5 con auditoría administrativa y disparadores `updated_at`.

Pendiente externo de activación:

- Crear o seleccionar el proyecto Supabase.
- Ejecutar `schema-v14.sql` y `schema-v15.sql`.
- Registrar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en GitHub.
- Crear el usuario de Juan e incluir su UUID en `admin_users`.
- Sustituir datos bancarios, precios, costos e inventarios demo por información real.
"""
if "## Estado de avance — V1.5 / Iteración 2" not in roadmap_text:
    roadmap.write_text(roadmap_text.rstrip() + status + "\n", encoding="utf-8")

print("Parche de versionado V1.5 aplicado.")
