#!/usr/bin/env python3
"""Exporta el MFO canónico de El Errante a un snapshot JSON V3.0.

El workbook y el snapshot son privados. Este script vive en el repositorio, pero
no contiene cifras financieras. El mapeo de columnas debe ser explícito: nunca
se infieren columnas por posición.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any

SCHEMA_VERSION = "3.0"
REQUIRED_SHEETS = {
    "planSales": "01_Plan_Ventas",
    "productCosts": "02_Productos_Costos",
    "cashFlow": "03_Flujo_24M",
    "scenarios": "04_Escenarios_PE",
    "assumptions": "05_Supuestos",
    "pending": "06_Pendientes",
}
VALID_STATES = {"CONFIRMADO", "ESTIMADO", "INFERIDO", "CONTRADICTORIO", "PENDIENTE"}
REQUIRED_FIELDS = {
    "planSales": ("month", "sku", "quantity"),
    "productCosts": ("sku",),
    "cashFlow": ("month",),
    "scenarios": (),
    "assumptions": (),
    "pending": (),
}


def die(message: str) -> None:
    raise SystemExit(message)


def load_openpyxl():
    try:
        import openpyxl  # type: ignore
    except ImportError:
        die("Falta openpyxl. Instala localmente con: python3 -m pip install openpyxl")
    return openpyxl


def iso_value(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def normalize_month(value: Any) -> str:
    if value is None or value == "":
        return ""
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m")
    text = str(value).strip()
    if len(text) >= 7 and text[4] in "-/" and text[:4].isdigit():
        return text[:7].replace("/", "-")
    return text


def normalize_state(value: Any, default: str) -> str:
    state = str(value or default).strip().upper()
    if state not in VALID_STATES:
        die(f"Estado no reconocido: {state}")
    return state


def workbook_headers(path: Path, max_rows: int = 20) -> dict[str, list[dict[str, Any]]]:
    openpyxl = load_openpyxl()
    wb = openpyxl.load_workbook(path, read_only=True, data_only=False)
    result: dict[str, list[dict[str, Any]]] = {}
    for logical, sheet_name in REQUIRED_SHEETS.items():
        if sheet_name not in wb.sheetnames:
            result[logical] = [{"error": f"Falta hoja {sheet_name}"}]
            continue
        ws = wb[sheet_name]
        rows = []
        for idx, row in enumerate(ws.iter_rows(min_row=1, max_row=max_rows, values_only=True), start=1):
            labels = [str(value).strip() for value in row if isinstance(value, str) and value.strip()]
            if labels:
                rows.append({"row": idx, "labels": labels})
        result[logical] = rows
    return result


def load_mapping(path: Path) -> dict[str, Any]:
    try:
        mapping = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        die(f"No se pudo leer el mapeo: {exc}")
    if not isinstance(mapping, dict) or not isinstance(mapping.get("sheets"), dict):
        die("El mapeo debe contener un objeto 'sheets'.")
    return mapping


def validate_mapping(mapping: dict[str, Any]) -> None:
    sheets = mapping["sheets"]
    for logical, canonical_name in REQUIRED_SHEETS.items():
        cfg = sheets.get(logical)
        if not isinstance(cfg, dict):
            die(f"Falta configuración explícita para {logical}.")
        if cfg.get("sheet") != canonical_name:
            die(f"{logical}: la hoja debe ser exactamente {canonical_name}.")
        header_row = cfg.get("headerRow")
        if not isinstance(header_row, int) or header_row < 1:
            die(f"{logical}: headerRow debe ser un entero >= 1.")
        columns = cfg.get("columns")
        if not isinstance(columns, dict):
            die(f"{logical}: falta columns.")
        for field in REQUIRED_FIELDS[logical]:
            if not isinstance(columns.get(field), str) or not columns[field].strip():
                die(f"{logical}: falta encabezado explícito para {field}.")
        for field, header in columns.items():
            if header is not None and (not isinstance(header, str) or not header.strip()):
                die(f"{logical}: encabezado inválido para {field}.")


def header_index(ws, header_row: int) -> dict[str, int]:
    values = [cell.value for cell in ws[header_row]]
    result: dict[str, int] = {}
    duplicates: set[str] = set()
    for idx, value in enumerate(values, start=1):
        if value is None:
            continue
        label = str(value).strip()
        if not label:
            continue
        if label in result:
            duplicates.add(label)
        result[label] = idx
    if duplicates:
        die(f"Encabezados duplicados en {ws.title}: {', '.join(sorted(duplicates))}")
    return result


def extract_rows(ws_values, ws_formulas, cfg: dict[str, Any], logical: str, defaults: dict[str, str]) -> list[dict[str, Any]]:
    header_row = cfg["headerRow"]
    columns: dict[str, str | None] = cfg["columns"]
    headers = header_index(ws_formulas, header_row)
    missing = sorted({header for header in columns.values() if header and header not in headers})
    if missing:
        die(f"{ws_values.title}: faltan encabezados configurados: {', '.join(missing)}")

    output: list[dict[str, Any]] = []
    max_row = max(ws_values.max_row, ws_formulas.max_row)
    for row_idx in range(header_row + 1, max_row + 1):
        record: dict[str, Any] = {}
        has_data = False
        for field, header in columns.items():
            if not header:
                continue
            col_idx = headers[header]
            value = ws_values.cell(row=row_idx, column=col_idx).value
            formula = ws_formulas.cell(row=row_idx, column=col_idx).value
            if isinstance(formula, str) and formula.startswith("=") and value is None:
                die(
                    f"{ws_values.title}!{ws_values.cell(row=row_idx,column=col_idx).coordinate}: "
                    "la fórmula no tiene valor calculado en el XLSX. Abre y guarda el archivo en Excel/LibreOffice antes de exportar."
                )
            if value not in (None, ""):
                has_data = True
            record[field] = iso_value(value)
        if not has_data:
            continue
        if "month" in record:
            record["month"] = normalize_month(record.get("month"))
        record["status"] = normalize_state(record.get("status"), defaults["status"])
        record["confidence"] = str(record.get("confidence") or defaults["confidence"])
        record["source"] = str(record.get("source") or ws_values.title)
        if logical == "planSales" and (not record.get("month") or not record.get("sku")):
            die(f"{ws_values.title} fila {row_idx}: planSales exige month y sku.")
        if logical == "productCosts" and not record.get("sku"):
            die(f"{ws_values.title} fila {row_idx}: productCosts exige sku.")
        if logical == "cashFlow" and not record.get("month"):
            die(f"{ws_values.title} fila {row_idx}: cashFlow exige month.")
        output.append(record)
    return output


def export_snapshot(workbook: Path, mapping_path: Path, output: Path) -> dict[str, Any]:
    openpyxl = load_openpyxl()
    mapping = load_mapping(mapping_path)
    validate_mapping(mapping)

    wb_values = openpyxl.load_workbook(workbook, read_only=False, data_only=True)
    wb_formulas = openpyxl.load_workbook(workbook, read_only=False, data_only=False)
    missing_sheets = [name for name in REQUIRED_SHEETS.values() if name not in wb_values.sheetnames]
    if missing_sheets:
        die("Faltan hojas canónicas: " + ", ".join(missing_sheets))

    defaults = mapping.get("defaults") or {}
    default_status = normalize_state(defaults.get("status"), "ESTIMADO")
    default_confidence = str(defaults.get("confidence") or "Media")
    row_defaults = {"status": default_status, "confidence": default_confidence}

    snapshot: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "meta": {
            "modelName": mapping.get("modelName") or workbook.name,
            "modelDate": str(mapping.get("modelDate") or ""),
            "exportedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
            "status": normalize_state(mapping.get("status"), default_status),
            "confidence": str(mapping.get("confidence") or default_confidence),
            "source": workbook.name,
        },
        "planSales": [],
        "productCosts": [],
        "cashFlow": [],
        "scenarios": [],
        "assumptions": [],
    }

    for logical in ("planSales", "productCosts", "cashFlow", "scenarios", "assumptions"):
        cfg = mapping["sheets"][logical]
        name = REQUIRED_SHEETS[logical]
        snapshot[logical] = extract_rows(wb_values[name], wb_formulas[name], cfg, logical, row_defaults)

    pending_cfg = mapping["sheets"]["pending"]
    pending_rows = extract_rows(
        wb_values[REQUIRED_SHEETS["pending"]],
        wb_formulas[REQUIRED_SHEETS["pending"]],
        pending_cfg,
        "pending",
        row_defaults,
    )
    snapshot["meta"]["pendingCount"] = len(pending_rows)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    return snapshot


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Exportador privado MFO → snapshot V3.0")
    parser.add_argument("workbook", type=Path, help="Ruta local al XLSX canónico")
    parser.add_argument("--mapping", type=Path, help="Mapeo JSON explícito de hojas/encabezados")
    parser.add_argument("--output", type=Path, default=Path("private-data/mfo_snapshot_v30.json"))
    parser.add_argument("--inspect", action="store_true", help="Lista solo etiquetas de las primeras filas para construir el mapeo")
    parser.add_argument("--inspect-output", type=Path, default=Path("private-data/mfo_headers_v30.json"))
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.workbook.is_file():
        die(f"No existe el workbook: {args.workbook}")
    if args.inspect:
        result = workbook_headers(args.workbook)
        args.inspect_output.parent.mkdir(parents=True, exist_ok=True)
        args.inspect_output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Inspección privada escrita en {args.inspect_output}")
        return 0
    if not args.mapping:
        die("Para exportar debes indicar --mapping. No se adivinan columnas.")
    snapshot = export_snapshot(args.workbook, args.mapping, args.output)
    print(
        "Snapshot V3.0 generado localmente: "
        f"{len(snapshot['planSales'])} plan, {len(snapshot['productCosts'])} costos, "
        f"{len(snapshot['cashFlow'])} meses de flujo, {len(snapshot['scenarios'])} escenarios, "
        f"{len(snapshot['assumptions'])} supuestos."
    )
    print(f"Salida privada: {args.output}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
