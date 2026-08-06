# El Errante V2.6 — Depuración canónica

## Objetivo

Dejar una arquitectura verificable: una fuente de contenido, una biblioteca visual vigente, un runtime explícito, una política de almacenamiento local y un service worker limitado a recursos realmente utilizados.

La depuración no elimina archivos solo por su antigüedad. Cada retiro debe demostrar que el recurso no es necesario, que existe un reemplazo y que las pruebas continúan aprobadas.

## Situación inicial

La versión estable conserva simultáneamente:

- imágenes `assets/images/v040/` y `assets/images/brand-final/`;
- varias capas de datos, runtime y contenido;
- fuentes ejecutables fragmentadas bajo `assets/source/`;
- reconstrucción mediante XHR síncrono y `eval`;
- distintas generaciones de almacenamiento local;
- un service worker que precarga aplicación, herramientas internas, esquemas, documentación y fuentes de recuperación;
- reportes históricos en la raíz del sitio.

## Clasificación

Todo archivo debe quedar en una sola categoría:

1. **Canónico público:** recurso vigente de una página pública.
2. **Extensión operativa vigente:** componente necesario para administración u operación.
3. **Migración temporal:** recurso con condición de retiro definida.
4. **Legado archivado:** evidencia conservada en Git, pero no publicada.
5. **Candidato huérfano:** recurso sin consumidor comprobado, pendiente de revisión.
6. **No permitido en runtime:** `eval`, XHR síncrono, Base64 ejecutable y herramientas temporales.

## Fases

### 1. Inventario reproducible

Ejecutar:

```bash
python3 scripts/auditar_dependencias_v26.py
```

El resultado se conserva en `.artifacts/depuracion-v26/`. Esta fase no elimina archivos.

### 2. Runtime directo

- Materializar el comportamiento recuperado como JavaScript legible.
- Retirar la dependencia pública de `preprod.js`.
- Eliminar XHR síncrono y `eval`.
- Sacar `assets/source/*.b64` del service worker y de Pages.

### 3. Fuente única de contenido

- Definir qué módulo crea `window.EE_DATA`.
- Evitar mutaciones superpuestas sin contrato.
- Consolidar o delimitar una sola extensión editorial vigente.
- Mantener los conteos canónicos salvo decisión documentada de producto.

### 4. Biblioteca visual única

- Sustituir referencias `assets/images/v040/*` por `assets/images/brand-final/*`.
- Mantener el logo canónico existente.
- Verificar peso, encuadre móvil, texto alternativo y calidad.

### 5. Estado local y migraciones

- Inventariar las generaciones `ee_v*`.
- Definir un esquema vigente y migraciones idempotentes.
- No borrar información operativa sin conversión y respaldo verificable.
- Separar datos de demostración y datos conectados.

### 6. Service worker mínimo

- Precargar solo el shell esencial.
- Cargar bajo demanda imágenes y módulos especializados.
- Excluir documentación, SQL, reportes, Base64 y herramientas temporales.
- Renovar la caché en cada cambio incompatible.

### 7. Separar publicación e historial

- Excluir de Pages reportes, scripts locales, documentación de desarrollo y pruebas.
- Conservar la trazabilidad en Git.
- Publicar únicamente la aplicación necesaria.

### 8. Barreras estrictas

Cuando termine la migración, activar:

```bash
python3 scripts/auditar_dependencias_v26.py --strict
```

La auditoría estricta debe fallar ante `eval`, XHR síncrono, imágenes `v040` activas, `preprod.js` o Base64 en caché y referencias rotas.

## Reglas de integración

- V2.5 se cierra de manera independiente.
- V2.6 parte de `main` y no modifica el PR de abastecimiento.
- Cada fase tendrá un diff acotado y reversible.
- Las eliminaciones se separan de cambios comerciales.
- Supabase permanece pendiente hasta verificar configuración y migraciones reales.

## Criterio de terminado

V2.6 queda aprobada cuando:

- no se reconstruye código público desde Base64;
- no se usa `eval` ni XHR síncrono;
- las páginas usan la biblioteca visual canónica;
- el contenido tiene una sola ruta de construcción;
- el almacenamiento local tiene migraciones explícitas;
- el service worker no precarga legado ni documentación;
- Pages publica únicamente la aplicación;
- auditoría canónica, Playwright, Public Health y auditoría V2.6 están en verde.
