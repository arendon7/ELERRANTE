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
channels = read("assets/public-channel-settings-v4.js")
actions = read("assets/public-actions-v29.js")

for state in ("ACTIVE", "PREPARED", "INACTIVE", "LEGACY"):
    require(registry, state, f"falta estado {state} en el registro de capacidades")

for capability in (
    "Identidad pública",
    "Tienda / catálogo",
    "Checkout",
    "Handoff público",
    "Configuración de canales",
    "Backend público Supabase",
    "Operación",
    "Finanzas",
    "Costo histórico",
    "Inventario valorizado",
    "Piloto operativo",
):
    require(registry, capability, f"falta capacidad gobernada: {capability}")

require(registry, "ee_v14_settings", "el registro no identifica el store local de canales")
require(registry, "public_settings", "el registro no identifica la fuente remota de configuración")
require(registry, "service_role", "el registro no documenta la prohibición de service_role")
require(registry, "desconocido", "el registro no preserva la semántica de desconocido")
require(registry, "MAPA_VERSIONES_ACTIVAS.md", "el registro no enlaza conceptualmente con el mapa de versiones")

require(roadmap, "Registro de capacidades y versiones", "el roadmap perdió la deuda de registro de capacidades")
require(channels, "supportWhatsapp", "el registro gobierna una capacidad que ya no existe en runtime")
require(channels, "supportEmail", "el registro gobierna una capacidad que ya no existe en runtime")
require(actions, "No ha sido enviado automáticamente", "el contrato de handoff cambió respecto al registro")

print("PASS: registro de capacidades V4.1 consistente con roadmap y runtime público")
