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


admin = read("admin.html")
asset = read("assets/admin-config-promotion-v42.js")
test = read("tests/e2e/v42-config-promotion.spec.js")
registry = read("documentacion/REGISTRO_CAPACIDADES_V41.md")
schema = read("backend/supabase/schema-v26.sql")

# Orden de carga: la promoción depende del guard de conectividad ya instalado.
require(admin, "assets/admin-config-promotion-v42.js", "admin.html no carga el asistente de promoción")
if admin.index("assets/admin-config-promotion-v42.js") < admin.index("assets/admin-connectivity-v42.js"):
    raise SystemExit("FAIL: admin-config-promotion-v42.js debe cargar después del guard V4.2")

# Fuente local y allowlists deliberadas.
require(asset, "SETTINGS_KEY='ee_v14_settings'", "falta store local canónico")
require(asset, "payment:Object.freeze(['bank','accountType','accountNumber','key','accountHolder','instructions'])", "allowlist payment incompleta")
require(asset, "ordering:Object.freeze(['deliveryPolicy','deliveryFeePolicy','coverageDetails','supportWhatsapp','supportEmail','expectedResponseHours','requireReceipt','maxReceiptBytesPreview'])", "allowlist ordering incompleta")
require(asset, "localStorage.getItem(SETTINGS_KEY)", "el asistente no lee la copia local explícita")
forbid(asset, "localStorage.setItem", "el asistente no debe borrar ni mutar configuración local")
forbid(asset, "localStorage.removeItem", "el asistente no debe limpiar configuración local")

# Reutiliza sesión/cliente central y nunca crea credenciales privilegiadas.
require(asset, "window.__EE_ADMIN_SUPABASE__", "el asistente no reutiliza el cliente administrativo")
forbid(asset, "createClient(", "el asistente no debe crear un segundo cliente Supabase")
forbid(asset.lower(), "service_role", "el asistente referencia service_role")
require(asset, "window.EL_ERRANTE_ADMIN_CONNECTIVITY", "falta dependencia explícita del guard V4.2")
require(asset, "await guard.assertConnected()", "falta revalidación central de sesión/autorización")
if asset.count("await assertConnected();") < 2:
    raise SystemExit("FAIL: debe haber preflight conectado antes de lectura inicial y antes de escritura")

# Lectura/escritura sólo sobre public_settings y grupos aprobados.
require(asset, "from('public_settings').select('key,value,updated_at').eq('key',group).maybeSingle()", "falta lectura determinista por fila")
require(asset, "from('public_settings').upsert({key:group,value:nextRaw", "falta upsert explícito por fila aprobada")
require(asset, "GROUPS[group].includes(field)", "la selección no se filtra contra allowlist")
require(asset, "unknownFields", "no se identifican campos locales desconocidos")
require(asset, "nextRaw=clone(beforeWrite.raw)||{}", "la promoción no preserva el JSON remoto existente")
require(asset, "approved.forEach(field=>{nextRaw[field]=clone(localAllowed[field]);})", "la promoción no aplica únicamente campos seleccionados")

# Concurrencia y confirmación humana.
require(asset, "window.confirm", "falta confirmación humana explícita")
require(asset, "snapshotRemote(beforeWrite)!==remoteSnapshots[group]", "falta detección de remoto cambiado")
require(asset, "'CONFLICT'", "falta estado CONFLICT")
require(asset, "replaceGroup(root,group,beforeWrite)", "CONFLICT no refresca valores remotos visibles")
require(asset, "const confirmed=await readRemoteGroup(db,group)", "falta relectura posterior al upsert")
require(asset, "!confirmed.exists||!same(confirmed.raw,nextRaw)", "la relectura no confirma el valor exacto")
require(asset, "La copia local permanece intacta", "la UX no declara separación de la copia local")

# RLS pública preparada sigue limitada a las dos claves expuestas; la gestión admin general no se redefine aquí.
require(schema, "using (key in ('ordering','payment'))", "schema-v26 perdió allowlist pública ordering/payment")
require(schema, "with check (public.is_admin())", "schema-v26 perdió protección administrativa")

# E2E exigidos por #169.
for marker in (
    "local == remoto queda IGUAL",
    "SÓLO LOCAL promueve selección explícita",
    "SÓLO REMOTO permite conservar remoto",
    "DIFERENTE promueve sólo campos marcados",
    "futureSecret:'NO-COPIAR'",
    "serverOnly:'PRESERVAR'",
    "entra CONFLICT",
    "AUTH_REQUIRED",
    "RLS reject",
    "network unavailable",
    "expect(state.writes).toBe(0)",
    "expect(JSON.parse(state.local)).toEqual(local)",
):
    require(test, marker, f"E2E V4.2 no cubre contrato: {marker}")

require(registry, "Promoción explícita local → remota", "registro canónico no declara la capacidad de promoción")

print("PASS: promoción V4.2 es explícita, allowlisted, conflict-aware, fail-closed y no muta la copia local")
