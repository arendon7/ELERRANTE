#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "documentacion/sesiones/aire-y-tiempo-paquete-comite-v09.json"
GUIDE = ROOT / "documentacion/sesiones/AIRE_Y_TIEMPO_PAQUETE_COMITE_V09.md"
HTML = ROOT / "actas.html"
JS = ROOT / "assets/aire-tiempo-committee-v09.js"
CSS = ROOT / "assets/aire-tiempo-committee-v09.css"

EXPECTED_GATES = {
    "concepto_y_rol", "narrativa_comercial", "visual_editorial", "formula",
    "costo_unitario", "precio_final", "margen", "empaque_fisico", "etiqueta",
    "sanitario", "vida_util", "conservacion_validada", "fotografia_fisica",
    "capacidad_produccion", "inventario_real", "cobertura_real",
    "instrucciones_validadas",
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"ERROR: {message}")


def main() -> None:
    for path in (PACK, GUIDE, HTML, JS, CSS):
        require(path.is_file(), f"falta {path.relative_to(ROOT)}")

    data = json.loads(PACK.read_text(encoding="utf-8"))
    require(data.get("schema") == "ee-committee-pack-v09", "schema inesperado")
    require(data.get("product_id") == "harina-aire-y-tiempo", "producto inesperado")
    require(data.get("status") == "preparacion_sin_aprobaciones", "el paquete no debe declarar aprobaciones")
    require(set(data.get("gates", {})) == EXPECTED_GATES, "las 17 puertas no coinciden")
    require(len(data.get("roles_required", [])) >= 7, "faltan disciplinas requeridas")
    require(len(data.get("variant_proposal", [])) == 3, "deben existir tres variantes propuestas")
    require(sum(item.get("minutes", 0) for item in data.get("session", {}).get("agenda", [])) == data.get("session", {}).get("duration_minutes"), "la agenda no suma la duración declarada")

    for key, gate in data["gates"].items():
        for field in ("owner_role", "question", "expected_evidence", "minimum_decision"):
            require(gate.get(field), f"{key}: falta {field}")
        require(isinstance(gate["expected_evidence"], list) and gate["expected_evidence"], f"{key}: evidencia esperada inválida")

    serialized = json.dumps(data, ensure_ascii=False).lower()
    require("aprobado real" not in serialized, "el paquete no debe afirmar aprobaciones reales")
    require("por asignar" in GUIDE.read_text(encoding="utf-8").lower(), "la guía debe mantener nombres pendientes")

    html = HTML.read_text(encoding="utf-8")
    require("aire-tiempo-committee-v09.css" in html, "actas.html no carga el CSS")
    require("aire-tiempo-committee-v09.js" in html, "actas.html no carga el JS")

    js = JS.read_text(encoding="utf-8")
    for token in ("PACK_URL", "data-load-committee-pack", "interceptFinalize", "EE_AIRE_TIEMPO_COMMITTEE_V09"):
        require(token in js, f"falta contrato JS {token}")
    require("window.EE_DATA" not in js, "el paquete no debe mutar ni depender de EE_DATA")

    print("PASS paquete guiado Aire y Tiempo v0.9")


if __name__ == "__main__":
    main()
