# Recuperación de fuente canónica — v0.7

## Resultado

La fuente efectiva de El Errante fue reconstruida y validada a partir del snapshot autocontenido v0.4.0 y las mejoras comerciales v0.6.1.

La auditoría automatizada confirmó:

- 11 productos;
- 14 variantes;
- 5 recetas;
- 5 artículos;
- 5 preguntas frecuentes;
- 6 zonas de cobertura;
- identificadores de producto únicos;
- variantes no duplicadas;
- ausencia del marcador de truncación en las fuentes activas.

## Fuente de datos activa

El runtime reconstruye el baseline de datos desde:

- `assets/source/v040-data-001.b64`;
- `assets/source/v040-data-002.b64`;
- `assets/source/v040-data-003.b64`;
- `assets/source/v040-data-004.b64`.

Después aplica:

- `assets/products-v6.js`.

Esto permite conservar el modelo integral v0.4 y las mejoras comerciales y visuales del catálogo v0.6.1.

## Lógica funcional activa

La lógica íntegra de carrito, Studio, operaciones, lotes, rutas, exportación e importación local se reconstruye desde:

- `assets/source/v040-preprod-001a.b64`;
- `assets/source/v040-preprod-001b.b64`;
- `assets/source/v040-preprod-001c.b64`;
- `assets/source/v040-preprod-001d.b64`;
- `assets/source/v040-preprod-002.b64`;
- `assets/source/v040-preprod-003.b64`.

Los seis fragmentos reconstruyen 15.064 bytes UTF-8 válidos y contienen los módulos funcionales esperados, incluido `initOperations`.

## Archivo huérfano no utilizado

`assets/source/v040-preprod-001.b64` corresponde a un primer intento de transferencia cuyo hash no coincidió con el archivo local íntegro.

Este archivo:

- no es cargado por `assets/preprod.js`;
- no está incluido en el service worker;
- no forma parte del artefacto canónico;
- está bloqueado por `scripts/verificar_fuentes.py` si alguien intenta volver a enlazarlo.

Se conserva temporalmente como evidencia de la incidencia de transferencia hasta poder retirarlo con una operación de árbol Git verificada.

## Chunks heredados

Los archivos dentro de `assets/chunks/` no son fuente de ejecución.

En particular, `assets/chunks/data-003.txt` contiene literalmente:

```text
[... ELLIPSIZATION ...]
```

y termina a mitad de una frase. Su clasificación permanente es:

```text
truncated-ellipsized-do-not-use
```

Los chunks se mantienen únicamente para trazabilidad histórica.

## Controles automáticos

### `verificar_demo.py`

Valida páginas, módulos integrales, catálogo, visuales, referencias locales, caché, workflow y patrones evidentes de secretos.

### `scripts/verificar_fuentes.py`

Valida Base64, UTF-8, integridad básica, cargadores, caché, procedencia y exclusión de los chunks truncados.

### `scripts/exportar-fuente-canonica.mjs`

Ejecuta el baseline íntegro, aplica el overlay comercial y genera:

- `canonical-data.json`;
- `canonical-data.js`;
- `canonical-report.json`;
- `canonical-report.md`.

### GitHub Actions

Los pull requests ejecutan:

1. regresión integral;
2. validación de fuentes;
3. reconstrucción canónica;
4. auditoría estructurada;
5. conservación del artefacto durante 14 días.

GitHub Pages solo se despliega después del merge a `main`.

## Caché

La versión activa es:

```text
el-errante-v0-6-7
```

Incluye las fuentes confiables, los módulos integrales y los 17 conceptos visuales recuperados.

## Próxima consolidación

La siguiente fase podrá sustituir el cargador Base64 y el overlay por un `canonical-data.js` generado y versionado directamente en el repositorio. Ese cambio debe realizarse en un PR separado y demostrar equivalencia mediante hashes y conteos antes de retirar las capas transitorias.
