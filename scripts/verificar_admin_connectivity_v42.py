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


admin_html = read("admin.html")
connectivity = read("assets/admin-connectivity-v42.js")
channels = read("assets/public-channel-settings-v4.js")
e2e = read("tests/e2e/v42-admin-connectivity.spec.js")
connected_e2e = read("tests/e2e/v42-public-channel-connected.spec.js")

# La capa debe cargarse al final de la superficie administrativa, después de los módulos
# que gobierna, para poder bloquearlos sin reescribir sus motores.
require(admin_html, 'assets/admin-connectivity-v42.js', "admin.html no carga la capa de conectividad")
if admin_html.index('assets/admin-connectivity-v42.js') < admin_html.index('assets/trust-v19.js'):
    raise SystemExit("FAIL: admin-connectivity-v42.js debe cargarse después de trust-v19.js")

for state in ("CONNECTED", "AUTH_REQUIRED", "FORBIDDEN", "REMOTE_ERROR", "LOCAL_PREVIEW"):
    require(connectivity, f"{state}:'{state}'", f"falta estado {state}")

require(connectivity, "auth.getSession()", "la capa no revalida la sesión actual")
require(connectivity, "client.rpc('is_admin')", "la capa no revalida autorización is_admin")
require(connectivity, "auth.onAuthStateChange", "la capa no observa cambios de autenticación")
require(connectivity, "event==='SIGNED_OUT'", "SIGNED_OUT no tiene tratamiento explícito")
require(connectivity, "'TOKEN_REFRESHED'", "TOKEN_REFRESHED no dispara revalidación")
require(connectivity, "node.inert=shouldBlock", "las regiones no se bloquean semánticamente con inert")
require(connectivity, "aria-disabled", "el bloqueo no expone estado accesible")
require(connectivity, "aria-live", "el estado de conectividad no es anunciado")
require(connectivity, "ee:admin-connectivity", "la capa no publica un evento de estado auditable")
require(connectivity, "document.addEventListener('click',blockStaleMutation,true)", "falta barrera de captura para mutaciones obsoletas")
require(connectivity, "window.EL_ERRANTE_ADMIN_CONNECTIVITY=api", "falta API central de conectividad")
require(connectivity, "assertConnected", "falta preflight explícito reutilizable")
require(connectivity, "setTimeout(()=>", "los callbacks auth deben diferir revalidación fuera del callback")
forbid(connectivity, "setInterval(", "la capa introduce polling periódico agresivo")
forbid(connectivity.lower(), "service_role", "la capa de cliente referencia service_role")
forbid(connectivity, "localStorage.setItem", "la capa de conectividad no debe persistir datos de negocio")

# El editor de canales mantiene su aislamiento existente; la nueva capa gobierna su región
# y el harness conectado ahora declara sesión administrativa explícita.
require(channels, "data-public-channel-settings", "el editor V4 dejó de ser identificable para el guard")
require(connected_e2e, "__v42AdminState", "el harness de canales no modela sesión administrativa")
require(connected_e2e, "adminConnectivityState", "el harness de canales no espera CONNECTED")

for marker in (
    "toBe('CONNECTED')",
    "toBe('AUTH_REQUIRED')",
    "toBe('FORBIDDEN')",
    "toBe('REMOTE_ERROR')",
    "toBe('LOCAL_PREVIEW')",
    "SIGNED_OUT",
    "TOKEN_REFRESHED",
    "SIGNED_IN",
    "expect(value.upserts).toBe(0)",
    "expect(value.inert).toBe(true)",
    "expect(value.inert).toBe(false)",
):
    require(e2e, marker, f"E2E V4.2 no cubre contrato: {marker}")

print("PASS: conectividad admin V4.2 observa auth, distingue estados, bloquea mutaciones y conserva preview local")
