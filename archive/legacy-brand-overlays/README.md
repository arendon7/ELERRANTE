# Archivo histórico de overlays visuales

Estos archivos pertenecen a las iteraciones visuales anteriores a V2.8.

Se conservan únicamente para trazabilidad y recuperación histórica. No forman parte del runtime activo, no deben cargarse desde HTML, no deben incluirse en GitHub Pages y no pueden reconstruir ni sobrescribir la colección WebP canónica ubicada en `assets/images/brand-final/`.

La única fuente activa de identidad, aliases, imágenes de producto y galerías es:

`assets/brand-canon-v28.js`

El script `materializar_activos_visuales.py` se archiva junto con sus fuentes porque generaba fallbacks SVG a partir de paquetes embebidos. La V2.8 utiliza directamente los WebP físicos de alta calidad y no necesita ese proceso.
