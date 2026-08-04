#!/usr/bin/env python3
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ROOT / "assets/brand-final-editorial.js",
    ROOT / "assets/brand-final-products-a.js",
    ROOT / "assets/brand-final-products-b.js",
    ROOT / "assets/brand-final-products-c.js",
]
OUT = ROOT / "assets/images/brand-final"
OUT.mkdir(parents=True, exist_ok=True)


def read_assets(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    match = re.search(
        r"Object\.assign\(window\.EE_BRAND_ASSETS\|\|\{\},\s*(\{.*\})\);?\s*\}\)\(\);?$",
        text,
        re.S,
    )
    if not match:
        raise RuntimeError(f"No se pudo leer el paquete visual: {path}")
    return json.loads(match.group(1))


assets: dict[str, str] = {}
for source in SOURCES:
    assets.update(read_assets(source))

editorial = {
    "home-hero",
    "home-masa-fuego",
    "home-fermentacion",
    "home-ingredientes",
    "home-compartir",
    "home-en-casa",
    "home-despensa",
    "evento-hero",
    "evento-noche",
    "evento-servicio",
}
expected = {
    "home-hero",
    "home-masa-fuego",
    "home-fermentacion",
    "home-ingredientes",
    "home-compartir",
    "home-en-casa",
    "home-despensa",
    "evento-hero",
    "evento-noche",
    "evento-servicio",
    "producto-harina",
    "producto-crea-tuya",
    "producto-margherita",
    "producto-diavola",
    "producto-bosque",
    "producto-cuatro-quesos",
    "producto-la-errante",
    "producto-salsa-tomate",
    "producto-reduccion-balsamica",
    "producto-panela-maracuya",
    "producto-combo-primera-ruta",
}
missing = expected - set(assets)
if missing:
    raise RuntimeError("Activos faltantes: " + ", ".join(sorted(missing)))

for key in sorted(expected):
    width, height = (640, 360) if key in editorial else (520, 390)
    title = key.replace("-", " ").title()
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'role="img" aria-label="{title}">'
        f'<image width="{width}" height="{height}" href="{assets[key]}" '
        f'preserveAspectRatio="xMidYMid slice"/></svg>'
    )
    (OUT / f"{key}.svg").write_text(svg, encoding="utf-8")

manifest = {
    "version": "1.1.0",
    "count": len(expected),
    "assets": sorted(expected),
    "source": "brand-final embedded source packs",
}
(OUT / "manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"Materializados {len(expected)} activos visuales finales.")
