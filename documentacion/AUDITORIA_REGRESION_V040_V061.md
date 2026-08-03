# Auditoría de regresión — El Errante v0.4.0 vs v0.6.1

## Conclusión

La v0.4.0 local autocontenida debe tratarse como el último baseline integral aprobado. La v0.6.1 mejora publicación, navegación pública, contenido y control de caché, pero la migración no preservó toda la memoria visual ni todas las superficies del modelo.

No se recomienda volver atrás ni reemplazar `main` por la v0.4. La recuperación correcta consiste en conservar la infraestructura v0.6.1 y reinyectar selectivamente los activos y modelos aprobados de v0.4.

## Hallazgos confirmados

### 1. Regresión visual

La v0.4 contiene 17 activos PNG de alta fidelidad visual:

- `alveolos.png`
- `aplicaciones-empaque.png`
- `bitacora-fuego.png`
- `despensa.png`
- `fermentacion.png`
- `harina-empaques.png`
- `harina-horno.png`
- `harina-manos.png`
- `hero-desktop.png`
- `hero-mobile.png`
- `manos-masa.png`
- `masa-apertura.png`
- `pizza-errante.png`
- `pizza-neo.png`
- `pizzas-artesanales.png`
- `pizzas-coleccion.png`
- `pizzeria-movil.png`

En v0.6.1 gran parte fue sustituida por ilustraciones SVG conceptuales. Esto mejoró portabilidad y evitó enlaces rotos, pero redujo realismo, apetito, detalle de empaque y fuerza de la pizzería móvil.

Ejemplo crítico: `presentacion.html` conserva una referencia a `assets/images/harina-empaques.svg`, archivo inexistente en `main`, mientras la v0.4 sí contiene `harina-empaques.png` validado.

### 2. Modelo integral parcialmente oculto

La v0.4 incluye 22 páginas y una demo completa:

- web pública, tienda y 11 productos;
- checkout, cobertura, cuenta y soporte;
- administración;
- operación de producción, lotes y rutas;
- Studio de datos y validaciones;
- centro de control local;
- presentación navegable para socios/inversionistas;
- importación/exportación y escenarios de demostración.

En v0.6.1 varias superficies siguen en el repositorio, pero el workflow público excluye `admin.html`, `control.html`, `operacion.html`, `studio.html` y `presentacion.html`. La exclusión pública es razonable, pero genera la impresión de pérdida porque no existe una demo separada que muestre el sistema completo.

### 3. Deriva de fuente de datos

La v0.4 usa `assets/data.js` como fuente única de productos, variantes, inventario, cobertura, recetas, artículos y preguntas frecuentes.

La v0.6.1 usa una fuente fragmentada en chunks y un overlay `assets/products-v6.js`. El overlay permitió avanzar sin reescribir la fuente maestra, pero aumenta el riesgo de divergencia entre datos, imágenes, validaciones y contenidos.

### 4. Contenido nuevo sí ganado

No todo es regresión. La línea v0.6 incorpora mejoras que deben conservarse:

- nueva historia pública y navegación;
- depuración de mensajes visibles de demo;
- checkout sujeto a confirmación;
- mejores textos públicos de ayuda, cobertura y eventos;
- 11 fichas comerciales ampliadas;
- más artículos y recetas que la v0.4;
- Pages, caché y despliegue estabilizados.

### 5. Duplicidades y deuda

- Conviven `nosotros.html` e `historia.html` con funciones cercanas.
- La presentación sigue rotulada V0.4 y contiene referencias visuales degradadas o ausentes.
- Los SVG v0.6 no deben considerarse reemplazo definitivo de los activos aprobados de v0.4.
- El sistema público y la demo integral no tienen hoy una separación explícita de producto.

## Baseline canónico propuesto

### Mantener de v0.6.1

- arquitectura GitHub y workflow Pages;
- páginas públicas depuradas;
- textos comerciales nuevos;
- catálogo ampliado;
- control de caché;
- navegación responsive;
- checkout honesto y confirmación de pedido.

### Recuperar de v0.4.0

- biblioteca visual PNG aprobada;
- hero de escritorio y móvil;
- empaques de Aire y Tiempo;
- fotografía de manos, masa, fermentación y alveolos;
- pizza insignia y colección de pizzas;
- pizzería móvil Piaggio Ape;
- presentación integral;
- modelo de control, operación y Studio como demo separada;
- esquema de fuente única y mapa de responsables.

## Plan de recuperación sin rollback

1. Congelar `main` como baseline técnico v0.6.1.
2. Crear rama `recovery/v0.4-visual-models`.
3. Importar y optimizar los PNG de v0.4 como WebP/PNG para web, preservando originales en un archivo de referencia no publicado.
4. Reasignar imágenes principales y galerías desde los activos v0.4; dejar los SVG v0.6 solo como fallback o material editorial secundario.
5. Corregir todas las referencias rotas, especialmente la presentación.
6. Consolidar fuente de datos: incorporar las mejoras v0.6 en una única fuente canónica, eliminando la dependencia permanente del overlay.
7. Crear dos salidas claras:
   - sitio público comercial;
   - demo integral interna o de presentación, sin datos sensibles.
8. Ejecutar una matriz de regresión visual, funcional y de contenidos antes de fusionar.

## Criterio de aceptación

La recuperación se considerará completa cuando:

- el sitio público vuelva a tener la fuerza visual de v0.4;
- las 11 referencias usen imágenes coherentes y aprobadas;
- harina, pizzas, despensa y eventos se entiendan de inmediato;
- la presentación no tenga referencias rotas;
- los modelos de operación y gobierno de datos sigan disponibles;
- no se pierdan las mejoras técnicas y comerciales de v0.6.1.
