# El Errante V2.8

**Masa · Fuego · Territorio**

Webapp autocontenida de El Errante para experiencia pública, tienda, pedidos, operación, producción, materiales, medición, abastecimiento y finanzas operativas.

## Estado canónico

- Versión integral: `2.8.0`.
- Referencia visual y editorial: segunda versión local V2.7 aprobada.
- Canon único de identidad e imágenes: `assets/brand-canon-v28.js`.
- Catálogo: 11 productos y 14 variantes.
- Abastecimiento controlado: módulo V2.5.
- Finanzas Operativas: módulo V2.7.
- Caché: `el-errante-v2-8-brand-canon-1`.
- Persistencia local: `localStorage`.
- Supabase: preparado, pero inactivo mientras URL y clave pública estén vacías.

La V2.8 consolida los mejores contenidos, fichas e imágenes de la edición local correcta y elimina la competencia entre overlays visuales, loaders, service workers, documentación y verificadores antiguos.

## Dos capas claramente separadas

### Árbol fuente

Conserva código, documentación, pruebas, archivos históricos aislados y fragmentos Base64 utilizados únicamente como origen reproducible o contingencia.

### Superficie ejecutable

Mac y Playwright usan `.local_site`; GitHub Pages usa `_site`. Ambas superficies son construidas por:

```text
scripts/materializar_fuentes_locales_v28.py
scripts/preparar_sitio_materializado_v28.py
```

El constructor genera JavaScript legible, modifica las referencias HTML para cargarlo directamente y excluye físicamente:

- `assets/source/` y `assets/chunks/`;
- `assets/data.js`, `assets/app.js` y `assets/preprod.js`;
- overlays visuales heredados;
- `archive/`, pruebas, scripts y reportes históricos.

Por tanto, la ejecución normal no utiliza `eval` ni loaders Base64.

## Abrir localmente en macOS

1. Descarga y descomprime el ZIP completo.
2. Ejecuta `VERIFICAR_PAQUETE_LOCAL_V28.command`.
3. Continúa únicamente cuando aparezca `RESULTADO FINAL: OK`.
4. Abre uno de estos accesos:

```text
ABRIR_EL_ERRANTE_LOCAL_V28.command   Web pública
ABRIR_ADMIN_LOCAL_V28.command        Administración
ABRIR_CONTROL.command                Centro de control
ABRIR_PRESENTACION.command           Presentación
```

Para detener el servidor utiliza `DETENER_EL_ERRANTE_LOCAL_V28.command` o `Control + C`.

## Fuentes materializadas

El materializador genera de forma determinista:

```text
assets/generated/data-v28.js
assets/generated/app-v28.js
assets/generated/preprod-v28.js
assets/generated/manifest-v28.json
```

El manifiesto registra tamaño y SHA-256 de cada salida y de cada fragmento de origen. Estos archivos no se editan manualmente.

## Arquitectura de marca

La única fuente activa de identidad, aliases, imágenes principales y galerías es:

```text
assets/brand-canon-v28.js
```

Los WebP aprobados están en `assets/images/brand-final/`. Los overlays anteriores se conservan exclusivamente en `archive/legacy-brand-overlays/` y no participan en runtime ni Pages.

## Validación vigente

```text
verificar_demo.py
scripts/verificar_canon_marca_v28.py
scripts/verificar_activos_hq_v28.py
scripts/verificar_modulos_v28.py
scripts/preparar_sitio_materializado_v28.py
tests/e2e/
```

Playwright sirve `.local_site`, por lo que escritorio, móvil y ejecución local prueban la misma superficie.

## Seguridad y datos

La edición local guarda datos demostrativos en el navegador. Para operación real deben validarse conexión, migraciones, roles, RLS, impuestos, costos observados, inventarios físicos y datos sanitarios.

Nunca deben incorporarse claves privadas, `service_role`, cadenas de conexión, tokens, contraseñas ni datos personales reales.

## Retorno a GitHub

`PREPARAR_RETORNO_GITHUB_V28.command` materializa, verifica y crea en el Escritorio un ZIP del árbol fuente. `.local_site` se excluye porque es reproducible.

La integración a `main` requiere auditoría canónica, Playwright de escritorio y móvil y publicación Pages exitosos sobre el mismo SHA final.

## Documentación técnica

- `documentacion/CANON_MARCA_CONTENIDO_V28.md`
- `documentacion/FINANZAS_OPERATIVAS_V27.md`
- `documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md`
- `documentacion/MAPA_DATOS_Y_FUENTES.md`
