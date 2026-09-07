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


registry = read("documentacion/REGISTRO_CAPACIDADES_V41.md")
roadmap = read("documentacion/ROADMAP_V41_V43.md")
v42_scope = read("documentacion/V42_CONNECTED_CHANNEL_SCOPE.md")
channels = read("assets/public-channel-settings-v4.js")
actions = read("assets/public-actions-v29.js")
promotion = read("assets/admin-config-promotion-v42.js")
remote_spec = read("tests/e2e/v42-public-channel-connected.spec.js")
promotion_spec = read("tests/e2e/v42-config-promotion.spec.js")

for state in ("ACTIVE", "PREPARED", "INACTIVE", "LEGACY"):
    require(registry, state, f"falta estado {state} en el registro de capacidades")

for capability in (
    "Identidad pública",
    "Tienda / catálogo",
    "Checkout",
    "Handoff público",
    "Configuración de canales · local",
    "Configuración de canales · remoto",
    "Verdad de sesión / conectividad administrativa",
    "Promoción explícita local → remota",
    "Backend público Supabase",
    "Política pública de `public_settings`",
    "Operación",
    "Finanzas",
    "Costo histórico",
    "Inventario valorizado",
    "Piloto operativo",
):
    require(registry, capability, f"falta capacidad gobernada: {capability}")

require(registry, "ee_v14_settings", "el registro no identifica el store local de canales")
require(registry, "public_settings.ordering", "el registro no identifica la fuente remota de canales")
require(registry, "`ordering` y `payment`", "el registro no documenta la allowlist pública prevista")
require(registry, "service_role", "el registro no documenta la prohibición de service_role")
require(registry, "desconocido", "el registro no preserva la semántica de desconocido")
require(registry, "MAPA_VERSIONES_ACTIVAS.md", "el registro no enlaza conceptualmente con el mapa de versiones")
require(registry, "V42_CONNECTED_CHANNEL_SCOPE.md", "el registro no enlaza la evidencia V4.2")
require(registry, "CONFLICT", "el registro no gobierna concurrencia de promoción local/remota")

require(roadmap, "Registro de capacidades y versiones", "el roadmap perdió la deuda de registro de capacidades")
require(roadmap, "allowlist", "el roadmap perdió la necesidad de limitar public_settings")
require(v42_scope, "test-first", "el alcance V4.2 no declara estrategia test-first")
require(v42_scope, "is_admin", "el alcance V4.2 no exige autorización administrativa")
require(v42_scope, "RLS", "el alcance V4.2 no exige rechazo gobernado")
require(v42_scope, "ee_v14_settings", "el alcance V4.2 no protege aislamiento local/remoto")
require(v42_scope, "allowlist", "el alcance V4.2 no registra la siguiente ola de política pública")

require(channels, "supportWhatsapp", "el registro gobierna una capacidad que ya no existe en runtime")
require(channels, "supportEmail", "el registro gobierna una capacidad que ya no existe en runtime")
require(actions, "No ha sido enviado automáticamente", "el contrato de handoff cambió respecto al registro")
require(remote_spec, "V4.2 contrato conectado", "falta evidencia E2E del estado PREPARED remoto")
require(promotion, "data-config-promotion-v42", "el registro declara promoción pero falta su runtime")
require(promotion_spec, "promoción explícita local → remoto", "falta evidencia E2E de promoción explícita")

print("PASS: registro de capacidades V4.1/V4.2 consistente con roadmap, alcance y runtime público")
