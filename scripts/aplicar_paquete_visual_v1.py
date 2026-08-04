#!/usr/bin/env python3
"""Aplica el paquete visual editorial V1 sobre un artefacto de GitHub Pages.

El repositorio conserva una línea base autocontenida y funcional. Cuando el
archivo ELERRANTE_PAQUETE_VISUAL_V1_10.zip está presente, el workflow lo extrae
en el artefacto temporal y este script sustituye únicamente superficies cuya
correspondencia visual fue aprobada. No modifica archivos fuente del repositorio.
"""

from __future__ import annotations

from pathlib import Path
import sys

SITE = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
ASSET_ROOT = SITE / "assets/images/brand-v1"

REQUIRED_ASSETS = {
    "home-hero-pizzeria-movil.webp",
    "home-masa-fuego.webp",
    "home-fermentacion.webp",
    "producto-margherita.webp",
    "producto-bosque.webp",
    "producto-cuatro-quesos.webp",
    "producto-la-errante-editorial.webp",
    "home-compartir.webp",
    "home-ingredientes.webp",
    "evento-noche.webp",
}


def replace_in(relative: str, replacements: list[tuple[str, str]]) -> None:
    path = SITE / relative
    if not path.is_file():
        raise SystemExit(f"No existe la superficie requerida: {relative}")
    content = path.read_text(encoding="utf-8")
    original = content
    for old, new in replacements:
        if old not in content:
            raise SystemExit(f"{relative}: no contiene marcador visual esperado {old}")
        content = content.replace(old, new)
    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"Actualizada: {relative}")


def main() -> int:
    if not SITE.is_dir():
        raise SystemExit(f"No existe el sitio preparado: {SITE}")

    missing = sorted(name for name in REQUIRED_ASSETS if not (ASSET_ROOT / name).is_file())
    if missing:
        raise SystemExit("Paquete visual incompleto: " + ", ".join(missing))

    replace_in(
        "index.html",
        [
            (
                'src="assets/images/v040/v040-hero-desktop.svg"',
                'src="assets/images/brand-v1/home-hero-pizzeria-movil.webp"',
            ),
            (
                'src="assets/images/v040/v040-manos-masa.svg"',
                'src="assets/images/brand-v1/home-masa-fuego.webp"',
            ),
            (
                'src="assets/images/v040/v040-fermentacion.svg"',
                'src="assets/images/brand-v1/home-fermentacion.webp"',
            ),
            (
                'src="assets/images/v040/v040-pizzas-artesanales.svg"',
                'src="assets/images/brand-v1/producto-la-errante-editorial.webp"',
            ),
            (
                'src="assets/images/v040/v040-pizzeria-movil.svg"',
                'src="assets/images/brand-v1/evento-noche.webp"',
            ),
        ],
    )

    replace_in(
        "historia.html",
        [
            (
                'src="assets/images/v040/v040-hero-desktop.svg"',
                'src="assets/images/brand-v1/home-masa-fuego.webp"',
            ),
            (
                'src="assets/images/v040/v040-manos-masa.svg"',
                'src="assets/images/brand-v1/home-fermentacion.webp"',
            ),
            (
                'src="assets/images/v040/v040-pizzas-artesanales.svg"',
                'src="assets/images/brand-v1/producto-la-errante-editorial.webp"',
            ),
            (
                'src="assets/images/v040/v040-pizzeria-movil.svg"',
                'src="assets/images/brand-v1/home-hero-pizzeria-movil.webp"',
            ),
        ],
    )

    replace_in(
        "nosotros.html",
        [
            (
                'src="assets/images/v040/v040-manos-masa.svg"',
                'src="assets/images/brand-v1/home-masa-fuego.webp"',
            ),
        ],
    )

    replace_in(
        "en-casa.html",
        [
            (
                'src="assets/images/v040/v040-masa-apertura.svg"',
                'src="assets/images/brand-v1/home-fermentacion.webp"',
            ),
        ],
    )

    replace_in(
        "en-movimiento.html",
        [
            (
                'src="assets/images/v040/v040-pizzeria-movil.svg"',
                'src="assets/images/brand-v1/evento-noche.webp"',
            ),
        ],
    )

    replace_in(
        "caso-evento.html",
        [
            (
                'src="assets/images/v040/v040-pizzeria-movil.svg"',
                'src="assets/images/brand-v1/evento-noche.webp"',
            ),
        ],
    )

    replace_in(
        "recetas.html",
        [
            (
                'src="assets/images/v040/v040-fermentacion.svg"',
                'src="assets/images/brand-v1/home-fermentacion.webp"',
            ),
        ],
    )

    replace_in(
        "assets/products-v6.js",
        [
            ("assets/images/v6-margherita-taller.svg", "assets/images/brand-v1/producto-margherita.webp"),
            ("assets/images/v6-bosque.svg", "assets/images/brand-v1/producto-bosque.webp"),
            ("assets/images/v6-cuatro-quesos.svg", "assets/images/brand-v1/producto-cuatro-quesos.webp"),
            ("assets/images/v6-la-errante.svg", "assets/images/brand-v1/producto-la-errante-editorial.webp"),
        ],
    )

    marker = SITE / "visual-package-version.txt"
    marker.write_text(
        "EL ERRANTE VISUAL PACKAGE\nversion=1\nassets=10\nmode=editorial-controlled\n",
        encoding="utf-8",
    )
    print("Paquete visual V1 aplicado correctamente.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
