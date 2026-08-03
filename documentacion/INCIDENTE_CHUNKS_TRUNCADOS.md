# Incidente de integridad — chunks truncados

## Estado

`truncated-ellipsized-do-not-use`

Los archivos heredados de `assets/chunks/` se conservan únicamente como evidencia histórica. No deben utilizarse para cargar datos ni lógica en la aplicación.

## Hallazgo confirmado

Durante la reconstrucción reproducible de la fuente efectiva se comprobó que:

- `assets/chunks/data-001.txt` y `data-002.txt` contienen bloques Base64 decodificables;
- `assets/chunks/data-003.txt` contiene literalmente el texto `[... ELLIPSIZATION ...]`;
- ese archivo termina a mitad de una frase;
- ninguna estrategia de ensamblaje produce UTF-8 y JavaScript válidos.

El problema no era una diferencia de padding o el orden de concatenación. La fuente fue truncada durante una migración anterior.

## Evidencia técnica

La detección ocurrió en el PR #13 mediante GitHub Actions:

- ejecución diagnóstica: `30858611312`;
- artefacto: `fuente-canonica-diagnostico.zip`;
- artefacto ID: `8873428457`;
- archivo central: `chunk-diagnostics.json`.

El diagnóstico registró 23 caracteres no válidos para Base64 en `data-003.txt`; corresponden al marcador de elipsis insertado dentro del archivo.

## Impacto

El cargador v0.6.1 podía fallar al evaluar la fuente o producir un estado parcial. Esto afectaba potencialmente:

- catálogo y fichas de producto;
- recetas, artículos y preguntas frecuentes;
- cobertura y configuración del vendedor;
- carrito, cuenta y módulos internos que dependen de `window.EE_DATA`;
- reconstrucción de una fuente maestra confiable.

## Recuperación aplicada

Se tomó como baseline confiable el archivo íntegro `assets/data.js` de la versión autocontenida v0.4.0, previamente validada.

Ese baseline se incorporó en:

- `assets/source/v040-data-001.b64`;
- `assets/source/v040-data-002.b64`;
- `assets/source/v040-data-003.b64`;
- `assets/source/v040-data-004.b64`.

Después de reconstruirlo se aplica `assets/products-v6.js`, conservando las mejoras comerciales y visuales de v0.6.1.

La lógica funcional íntegra de v0.4.0 también se preservó en:

- `assets/source/v040-preprod-001.b64`;
- `assets/source/v040-preprod-002.b64`;
- `assets/source/v040-preprod-003.b64`.

No se confirmó un marcador de truncación en todos los chunks `preprod-*`; se reemplazaron preventivamente porque pertenecían al mismo mecanismo de migración fragmentada y existe una copia íntegra validada.

## Controles preventivos

- `assets/data.js` solo carga la fuente íntegra de `assets/source/`.
- `assets/preprod.js` solo carga la lógica íntegra de `assets/source/`.
- `scripts/verificar_fuentes.py` bloquea cualquier retorno a los chunks heredados.
- `scripts/exportar-fuente-canonica.mjs` reconstruye, ejecuta y valida la fuente efectiva.
- GitHub Actions publica un artefacto con JSON, JavaScript, hashes y conteos.
- El service worker v0.6.7 incluye las siete partes confiables.

## Seguridad

La revisión del incidente no detectó tokens, claves API, contraseñas reales, llaves privadas ni datos personales reales. La fuente contiene información y escenarios de demostración.

## Regla permanente

Los archivos dentro de `assets/chunks/` no son una fuente canónica. Solo pueden eliminarse después de cerrar la trazabilidad histórica; mientras permanezcan, deben estar excluidos de todos los cargadores de ejecución.
