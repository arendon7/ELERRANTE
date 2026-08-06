#!/usr/bin/env python3
"""Inventario reproducible de dependencias, versiones y activos de El Errante.

La fase inicial es deliberadamente no destructiva: produce evidencia para decidir
qué consolidar, archivar o retirar. Use --strict únicamente cuando la migración
canónica haya eliminado las barreras registradas en el informe.
"""

from __future__ import annotations

import argparse
import json
import posixpath
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / ".artifacts" / "depuracion-v26"
IGNORE_PARTS = {
    ".git",
    ".artifacts",
    "node_modules",
    "_site",
    "playwright-report",
    "test-results",
    "__pycache__",
}
TEXT_SUFFIXES = {
    ".html",
    ".js",
    ".css",
    ".json",
    ".webmanifest",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
    ".py",
    ".sql",
    ".command",
    ".bat",
}
ASSET_SUFFIXES = {
    ".js",
    ".css",
    ".svg",
    ".webp",
    ".avif",
    ".png",
    ".jpg",
    ".jpeg",
    ".json",
    ".webmanifest",
    ".b64",
    ".woff",
    ".woff2",
    ".ttf",
}
PATH_LITERAL_RE = re.compile(
    r"(?:\./)?((?:assets|backend|documentacion)/[A-Za-z0-9_./-]+\.(?:"
    r"js|css|svg|webp|avif|png|jpe?g|json|webmanifest|b64|woff2?|ttf|sql))"
)
CSS_URL_RE = re.compile(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", re.I)
SW_ENTRY_RE = re.compile(r"['\"](\./[^'\"]+)['\"]")
STORAGE_KEY_RE = re.compile(r"['\"](ee_v(\d+)[A-Za-z0-9_-]*)['\"]")
VERSION_TOKEN_RE = re.compile(r"(?:^|[-_/])v(\d+(?:\.\d+)*)", re.I)
SYNC_XHR_RE = re.compile(r"\.open\([^;\n]*,\s*false\s*\)", re.I)
EVAL_RE = re.compile(r"(?:^|[^A-Za-z0-9_$])eval\s*\(")


class LocalReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"src", "href", "poster", "srcset"} and value:
                if name == "srcset":
                    for candidate in value.split(","):
                        ref = candidate.strip().split(" ", 1)[0]
                        if ref:
                            self.references.append((tag, name, ref))
                else:
                    self.references.append((tag, name, value))


def is_ignored(path: Path) -> bool:
    try:
        relative = path.relative_to(ROOT)
    except ValueError:
        return True
    return any(part in IGNORE_PARTS for part in relative.parts)


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def iter_files() -> Iterable[Path]:
    for path in ROOT.rglob("*"):
        if path.is_file() and not is_ignored(path):
            yield path


def read_text(path: Path) -> str:
    if path.suffix.lower() not in TEXT_SUFFIXES or path.stat().st_size > 2_000_000:
        return ""
    try:
        return path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return ""


def normalize_reference(reference: str, owner: str) -> str | None:
    value = reference.strip()
    if not value or value.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        return None
    if re.match(r"^[a-z][a-z0-9+.-]*://", value, re.I) or value.startswith("//"):
        return None
    value = value.split("?", 1)[0].split("#", 1)[0]
    if not value:
        return None
    value = value.replace("\\", "/")
    if value.startswith("/ELERRANTE/"):
        value = value[len("/ELERRANTE/") :]
    elif value.startswith("/"):
        value = value[1:]
    else:
        value = posixpath.join(posixpath.dirname(owner), value)
    normalized = posixpath.normpath(value)
    if normalized == "." or normalized.startswith("../"):
        return None
    return normalized.removeprefix("./")


def version_tokens(paths: Iterable[str]) -> list[str]:
    values: set[str] = set()
    for path in paths:
        for match in VERSION_TOKEN_RE.finditer(path):
            values.add(match.group(1))
    return sorted(values, key=lambda item: [int(part) for part in item.split(".")])


def classify_asset(path: str, referenced: bool, active: bool) -> str:
    if path.startswith("assets/images/brand-final/"):
        return "visual-canonico"
    if path.startswith("assets/images/v040/") or path.startswith("assets/source/"):
        return "legado-activo" if active else "legado-archivable"
    if path.startswith("assets/chunks/"):
        return "recuperacion-legada"
    if referenced:
        return "dependencia-activa"
    return "candidato-huerfano"


def build_report() -> dict:
    files = sorted(iter_files())
    all_paths = {rel(path) for path in files}
    text_cache = {rel(path): read_text(path) for path in files}
    text_cache = {path: text for path, text in text_cache.items() if text}

    pages: dict[str, dict] = {}
    html_references: set[str] = set()
    active_references: set[str] = set()
    broken_references: list[dict] = []

    for page_path in sorted(ROOT.glob("*.html")):
        page = rel(page_path)
        parser = LocalReferenceParser()
        parser.feed(text_cache.get(page, ""))
        refs: list[str] = []
        scripts: list[str] = []
        styles: list[str] = []
        images: list[str] = []
        for tag, attribute, raw in parser.references:
            normalized = normalize_reference(raw, page)
            if not normalized:
                continue
            refs.append(normalized)
            html_references.add(normalized)
            active_references.add(normalized)
            if normalized.endswith(".js"):
                scripts.append(normalized)
            elif normalized.endswith(".css"):
                styles.append(normalized)
            elif Path(normalized).suffix.lower() in {".svg", ".webp", ".avif", ".png", ".jpg", ".jpeg"}:
                images.append(normalized)
            if normalized not in all_paths and not normalized.endswith("/"):
                broken_references.append(
                    {"owner": page, "attribute": attribute, "reference": normalized}
                )
        legacy_scripts = [
            item
            for item in scripts
            if item.endswith(("preprod.js", "content-v5.js")) or "/v040/" in item
        ]
        pages[page] = {
            "scripts": scripts,
            "styles": styles,
            "images": images,
            "versions": version_tokens(scripts + styles + images),
            "legacy_scripts": legacy_scripts,
            "v040_images": [item for item in images if "/v040/" in item],
            "reference_count": len(refs),
        }

    literal_references: set[str] = set()
    for owner, text in text_cache.items():
        for match in PATH_LITERAL_RE.finditer(text):
            normalized = normalize_reference(match.group(1), owner)
            if normalized:
                literal_references.add(normalized)
        if owner.endswith(".css"):
            for match in CSS_URL_RE.finditer(text):
                normalized = normalize_reference(match.group(1), owner)
                if normalized:
                    literal_references.add(normalized)

    service_worker_text = text_cache.get("service-worker.js", "")
    service_worker_entries = sorted(
        {
            normalize_reference(match.group(1), "service-worker.js")
            for match in SW_ENTRY_RE.finditer(service_worker_text)
        }
        - {None}
    )
    active_references.update(service_worker_entries)
    active_references.update(literal_references)

    combined_text = "\n".join(text_cache.values())
    asset_paths = sorted(
        path
        for path in all_paths
        if path.startswith("assets/") and Path(path).suffix.lower() in ASSET_SUFFIXES
    )
    asset_inventory: list[dict] = []
    orphan_candidates: list[str] = []
    for path in asset_paths:
        referenced = path in active_references or Path(path).name in combined_text
        active = path in html_references or path in service_worker_entries
        classification = classify_asset(path, referenced, active)
        if classification == "candidato-huerfano":
            orphan_candidates.append(path)
        asset_inventory.append(
            {
                "path": path,
                "size": (ROOT / path).stat().st_size,
                "referenced": referenced,
                "active": active,
                "classification": classification,
            }
        )

    storage_keys: dict[str, list[str]] = defaultdict(list)
    for owner, text in text_cache.items():
        for key, generation in STORAGE_KEY_RE.findall(text):
            storage_keys[generation].append(key)
    storage_generations = {
        generation: sorted(set(keys)) for generation, keys in sorted(storage_keys.items(), key=lambda item: int(item[0]))
    }

    eval_files = sorted(owner for owner, text in text_cache.items() if EVAL_RE.search(text))
    sync_xhr_files = sorted(owner for owner, text in text_cache.items() if SYNC_XHR_RE.search(text))
    v040_consumers = sorted(owner for owner, text in text_cache.items() if "assets/images/v040/" in text)
    source_consumers = sorted(owner for owner, text in text_cache.items() if "assets/source/" in text)
    legacy_layers = sorted(
        owner
        for owner, text in text_cache.items()
        if "assets/preprod.js" in text or "assets/content-v5.js" in text
    )
    historical_root_files = sorted(
        path
        for path in all_paths
        if "/" not in path
        and re.match(r"(?:AUDITORIA_|RECUPERACION_|REPORTE_).+", path, re.I)
    )

    hard_blockers = []
    if eval_files:
        hard_blockers.append({"code": "runtime-eval", "files": eval_files})
    if sync_xhr_files:
        hard_blockers.append({"code": "xhr-sincrono", "files": sync_xhr_files})
    if v040_consumers:
        hard_blockers.append({"code": "imagenes-v040-activas", "files": v040_consumers})
    if "preprod.js" in {Path(item).name for item in service_worker_entries}:
        hard_blockers.append({"code": "preprod-en-cache", "files": ["service-worker.js"]})
    if any(item.startswith("assets/source/") for item in service_worker_entries):
        hard_blockers.append({"code": "fuente-base64-en-cache", "files": ["service-worker.js"]})

    suffix_counts = Counter(Path(path).suffix.lower() or "[sin extensión]" for path in all_paths)
    script_counts = Counter(script for page in pages.values() for script in page["scripts"])

    return {
        "schema": "el-errante-dependency-audit-v26",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root": str(ROOT),
        "summary": {
            "files": len(all_paths),
            "html_pages": len(pages),
            "assets": len(asset_paths),
            "active_html_scripts": len(script_counts),
            "service_worker_entries": len(service_worker_entries),
            "storage_generations": len(storage_generations),
            "broken_references": len(broken_references),
            "orphan_candidates": len(orphan_candidates),
            "hard_blockers": len(hard_blockers),
        },
        "suffix_counts": dict(sorted(suffix_counts.items())),
        "pages": pages,
        "script_consumers": {key: value for key, value in sorted(script_counts.items())},
        "service_worker_entries": service_worker_entries,
        "storage_generations": storage_generations,
        "findings": {
            "eval_files": eval_files,
            "sync_xhr_files": sync_xhr_files,
            "v040_consumers": v040_consumers,
            "source_consumers": source_consumers,
            "legacy_layer_consumers": legacy_layers,
            "historical_root_files": historical_root_files,
            "broken_references": broken_references,
            "hard_blockers": hard_blockers,
        },
        "assets": asset_inventory,
        "orphan_candidates": orphan_candidates,
        "decisions": [
            "No eliminar activos solo por aparecer como candidatos; confirmar referencias dinámicas y pruebas visuales.",
            "Sustituir primero el runtime recuperado y después retirar Base64, v040 y capas editoriales duplicadas.",
            "Migrar almacenamiento local mediante versiones explícitas; no borrar pedidos o datos operativos sin conversión.",
            "Reducir el service worker al shell público y dependencias realmente consumidas.",
            "Mover reportes históricos fuera del artefacto de Pages sin perder su trazabilidad en Git.",
        ],
    }


def render_markdown(report: dict) -> str:
    summary = report["summary"]
    findings = report["findings"]
    lines = [
        "# Auditoría estructural V2.6",
        "",
        f"Generada: `{report['generated_at']}`",
        "",
        "## Resumen",
        "",
        f"- Archivos inventariados: **{summary['files']}**",
        f"- Páginas HTML: **{summary['html_pages']}**",
        f"- Activos: **{summary['assets']}**",
        f"- Scripts distintos cargados por HTML: **{summary['active_html_scripts']}**",
        f"- Entradas precargadas por service worker: **{summary['service_worker_entries']}**",
        f"- Generaciones de almacenamiento local: **{summary['storage_generations']}**",
        f"- Referencias rotas detectadas: **{summary['broken_references']}**",
        f"- Candidatos huérfanos: **{summary['orphan_candidates']}**",
        f"- Barreras de depuración: **{summary['hard_blockers']}**",
        "",
        "## Capas activas por página",
        "",
    ]
    for page, data in report["pages"].items():
        scripts = ", ".join(f"`{item}`" for item in data["scripts"]) or "—"
        legacy = ", ".join(f"`{item}`" for item in data["legacy_scripts"]) or "—"
        v040 = len(data["v040_images"])
        lines.extend(
            [
                f"### {page}",
                f"- Scripts: {scripts}",
                f"- Capas legadas explícitas: {legacy}",
                f"- Imágenes v040: **{v040}**",
                "",
            ]
        )

    lines.extend(["## Hallazgos prioritarios", ""])
    prioritized = [
        ("Uso de eval", findings["eval_files"]),
        ("XHR síncrono", findings["sync_xhr_files"]),
        ("Consumidores de imágenes v040", findings["v040_consumers"]),
        ("Consumidores de fuentes Base64", findings["source_consumers"]),
        ("Consumidores de capas preprod/content-v5", findings["legacy_layer_consumers"]),
        ("Reportes históricos en raíz", findings["historical_root_files"]),
    ]
    for title, values in prioritized:
        rendered = ", ".join(f"`{item}`" for item in values) or "Ninguno"
        lines.append(f"- **{title}:** {rendered}")

    lines.extend(["", "## Generaciones de almacenamiento local", ""])
    for generation, keys in report["storage_generations"].items():
        lines.append(f"- `v{generation}`: {', '.join(f'`{key}`' for key in keys)}")

    lines.extend(["", "## Decisiones de seguridad", ""])
    lines.extend(f"- {decision}" for decision in report["decisions"])
    lines.extend(
        [
            "",
            "## Resultado",
            "",
            "Esta auditoría no elimina archivos. Su función es convertir la deuda histórica en un inventario verificable antes de la consolidación canónica.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()

    output = args.output if args.output.is_absolute() else ROOT / args.output
    output.mkdir(parents=True, exist_ok=True)
    report = build_report()
    (output / "dependency-audit-v26.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (output / "dependency-audit-v26.md").write_text(
        render_markdown(report), encoding="utf-8"
    )
    print(render_markdown(report))

    if args.strict and report["findings"]["hard_blockers"]:
        print("La auditoría estricta encontró barreras pendientes.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
