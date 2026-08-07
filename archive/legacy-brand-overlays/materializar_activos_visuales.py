#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ROOT / "assets/brand-final-editorial.js",
    ROOT / "assets/brand-final-products-a.js",
    ROOT / "assets/brand-final-products-b.js",
    ROOT / "assets/brand-final-products-c.js",
]
OUT = ROOT / "assets/images/brand-final"
OUT.mkdir(parents=True, exist_ok=True)

# V1.3 mantiene originales WebP físicos. Cuando la colección validada existe,
# esta utilidad heredada no debe reconstruir ni sobrescribirla con SVG reducidos.
hq_manifest_path = OUT / "manifest-hq-v13.json"
if hq_manifest_path.is_file():
    hq_manifest = json.loads(hq_manifest_path.read_text(encoding="utf-8"))
    webps = sorted(OUT.glob("*.webp"))
    if (
        hq_manifest.get("version") == "1.3.0"
        and hq_manifest.get("unique_assets") == 23
        and len(webps) == 24
        and all(path.stat().st_size > 100_000 for path in webps)
    ):
        print("Colección WebP HQ V1.3 detectada: se omite el fallback SVG legado.")
        raise SystemExit(0)


def read_assets(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    marker = "Object.assign(window.EE_BRAND_ASSETS||{},"
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f"No se encontró el objeto visual en {path}")
    payload = text[start + len(marker):].strip()
    end = payload.find(");")
    if end < 0:
        raise RuntimeError(f"No se encontró el cierre del objeto visual en {path}")
    return json.loads(payload[:end].strip())


assets: dict[str, str] = {}
for source in SOURCES:
    assets.update(read_assets(source))

if "evento-servicio" not in assets and "evento-hero" in assets:
    assets["evento-servicio"] = assets["evento-hero"]

editorial = {
    "home-hero", "home-masa-fuego", "home-fermentacion", "home-ingredientes",
    "home-compartir", "home-en-casa", "home-despensa", "evento-hero",
    "evento-noche", "evento-servicio",
}
expected = editorial | {
    "producto-harina", "producto-crea-tuya", "producto-margherita",
    "producto-diavola", "producto-bosque", "producto-cuatro-quesos",
    "producto-la-errante", "producto-salsa-tomate",
    "producto-reduccion-balsamica", "producto-panela-maracuya",
    "producto-combo-primera-ruta",
}
missing = {
    key for key in expected
    if key not in assets and not (OUT / f"{key}.svg").is_file()
}
if missing:
    raise RuntimeError("Activos faltantes: " + ", ".join(sorted(missing)))

for key in sorted(expected):
    if key not in assets:
        continue
    width, height = (640, 360) if key in editorial else (520, 390)
    title = key.replace("-", " ").title()
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'role="img" aria-label="{title}">'
        f'<image width="{width}" height="{height}" href="{assets[key]}" '
        f'preserveAspectRatio="xMidYMid slice"/></svg>'
    )
    (OUT / f"{key}.svg").write_text(svg, encoding="utf-8")

materialized = sorted(path.stem for path in OUT.glob("*.svg") if path.stem in expected)
if len(materialized) != len(expected):
    raise RuntimeError(f"Se esperaban {len(expected)} activos y se obtuvieron {len(materialized)}")

manifest = {
    "version": "1.2.0",
    "count": len(materialized),
    "assets": materialized,
    "source": "physical assets plus embedded brand-final source packs",
}
(OUT / "manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"Materializados {len(materialized)} activos visuales finales.")
