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
- Persistencia local: `localStorage` del navegador.
- Backend: Supabase preparado, pero inactivo mientras URL y clave pública estén vacías.

La versión V2.8 no es un rollback. Consolida los mejores contenidos, fichas e imágenes de la edición local correcta y elimina la competencia entre overlays visuales, loaders, service workers y verificadores antiguos.

## Abrir localmente en macOS

1. Descarga y descomprime el ZIP completo.
2. Ejecuta `VERIFICAR_PAQUETE_LOCAL_V28.command`.
3. Cuando termine con `RESULTADO FINAL: OK`, abre uno de estos accesos:

```text
ABRIR_EL_ERRANTE_LOCAL_V28.command   Web pública
ABRIR_ADMIN_LOCAL_V28.command        Administración
ABRIR_CONTROL.command                Centro de control
ABRIR_PRESENTACION.command           Presentación
```

Para detener el servidor utiliza `DETENER_EL_ERRANTE_LOCAL_V28.command` o presiona `Control + C` en Terminal.

El servidor se limita a `127.0.0.1`, utiliza primero el puerto 8787 y desactiva la caché HTTP durante las iteraciones locales.

## Entradas principales

### Experiencia pública

- `index.html` — inicio y propuesta de marca.
- `historia.html` — historia y concepto.
- `tienda.html` — catálogo.
- `producto.html` — ficha dinámica.
- `en-casa.html` — productos para terminar en casa.
- `en-movimiento.html` — eventos y pizzería móvil.
- `bitacora.html` — pruebas y aprendizaje.
- `recetas.html` — métodos y preparación.
- `checkout.html` — pedido por transferencia sujeto a confirmación.
- `cuenta.html` — seguimiento limitado de pedidos.

### Operación interna

- `admin.html` — panel integral V2.8.
- `activacion.html` — continuidad y activación V2.5.
- `operacion.html` — producción y lotes.
- `control.html` — centro de control.
- `studio.html` — datos y catálogo.
- `actas.html` — validaciones.
- `presentacion.html` — presentación navegable.

## Arquitectura de marca

La única fuente activa de identidad, aliases históricos, imágenes principales y galerías es:

```text
assets/brand-canon-v28.js
```

Los WebP aprobados están en:

```text
assets/images/brand-final/
```

Los overlays y materializadores anteriores se conservan únicamente en:

```text
archive/legacy-brand-overlays/
```

No participan en el runtime ni se publican en Pages.

## Validación vigente

```text
verificar_demo.py
scripts/verificar_canon_marca_v28.py
scripts/verificar_activos_hq_v28.py
scripts/verificar_modulos_v28.py
tests/e2e/
```

Los validadores antiguos que confundían la versión de cada módulo con la versión global están archivados en `archive/legacy-verifiers/`.

## Flujo de datos y seguridad

La edición local guarda datos demostrativos en el navegador. Para una operación real todavía deben validarse conexión, migraciones, roles, políticas RLS, tratamiento tributario, costos observados, inventarios físicos y datos sanitarios.

Nunca deben incorporarse al repositorio:

- claves privadas o `service_role`;
- cadenas de conexión de base de datos;
- tokens reales;
- contraseñas reales;
- datos personales reales de clientes, empleados o proveedores.

## Retorno a GitHub

`PREPARAR_RETORNO_GITHUB_V28.command` ejecuta las barreras vigentes y crea en el Escritorio un ZIP con el estado local para revisión y migración posterior.

La integración a `main` solo debe realizarse cuando auditoría canónica, Playwright de escritorio y móvil y publicación Pages hayan terminado sobre el mismo commit final.

## Documentación técnica

- `documentacion/CANON_MARCA_CONTENIDO_V28.md`
- `documentacion/FINANZAS_OPERATIVAS_V27.md`
- `documentacion/ROADMAP_OPERACION_COMERCIAL_V14.md`
- `documentacion/MAPA_DATOS_Y_FUENTES.md`
