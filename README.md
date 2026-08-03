# El Errante

**Masa · Fuego · Territorio**

Repositorio maestro de la experiencia pública, los modelos de negocio, la operación simulada y el entorno integral de demostración de El Errante.

## Estado actual

- Baseline técnico: `v0.6.1 — Catálogo Gold`
- Baseline integral de referencia: `v0.4.0 — Local autocontenida`
- Marca: identidad visual canónica consolidada
- Catálogo: 11 referencias con fichas, galerías e instrucciones
- Modelos: comercio, contenido, eventos, administración, operación y gobierno de datos
- Tecnología: HTML, CSS y JavaScript sin dependencias externas
- Publicación: GitHub Pages mediante GitHub Actions
- Persistencia: datos simulados almacenados en el navegador
- Pedidos: registro sujeto a confirmación de inventario, cobertura y pago

## Principio de recuperación

La versión objetivo no es un rollback.

Se conserva la arquitectura, los textos y la publicación de v0.6.1, mientras se recuperan la biblioteca visual, la presentación y la integridad de modelos de v0.4.0.

La auditoría detallada está en:

```text
documentacion/AUDITORIA_REGRESION_V040_V061.md
```

## Entradas principales

### Experiencia comercial

- `index.html` — inicio
- `historia.html` — historia y concepto
- `tienda.html` — catálogo
- `producto.html` — fichas de producto
- `en-casa.html` — pizzas para terminar en casa
- `en-movimiento.html` — pizzería móvil y eventos
- `bitacora.html` — pruebas y aprendizaje
- `recetas.html` — métodos y preparación
- `herramientas.html` — calculadoras
- `checkout.html` — pedido sujeto a confirmación

### Demo integral del equipo

- `equipo.html` — puerta de entrada general
- `admin.html` — administración
- `control.html` — centro de control
- `operacion.html` — producción, lotes y rutas
- `studio.html` — fuente de datos y validaciones
- `presentacion.html` — presentación navegable

Los accesos y perfiles ficticios se documentan en:

```text
documentacion/ACCESOS_DEMO.md
```

## Publicación completa

El workflow:

```text
.github/workflows/pages.yml
```

publica la superficie completa del repositorio, salvo archivos técnicos propios de Git y la carpeta temporal de compilación.

Esto permite presentar y validar desde GitHub Pages tanto la experiencia comercial como los modelos internos de demostración.

Configuración requerida:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

## Seguridad del repositorio público

El repositorio puede contener:

- modelos completos;
- páginas públicas e internas de demostración;
- datos simulados;
- usuarios y contraseñas ficticios;
- archivos de configuración de ejemplo;
- documentación operativa y comercial;
- snapshots autocontenidos sin secretos.

No puede contener:

- tokens reales;
- claves API;
- contraseñas reales;
- llaves privadas;
- secretos OAuth;
- credenciales de bases de datos;
- datos personales reales de clientes, trabajadores o proveedores.

Los secretos de integraciones futuras deben manejarse mediante GitHub Secrets y variables de entorno.

## Snapshot v0.4.0

El paquete autocontenido fue extraído, auditado y optimizado. Su inventario, hash y estado de integración están documentados en:

```text
documentacion/SNAPSHOT_AUTOCONTENIDO_V040.md
```

## Abrir localmente en Mac

1. Clona o descarga el repositorio.
2. Haz clic derecho en `ABRIR_EL_ERRANTE.command`.
3. Selecciona **Abrir**.
4. Mantén Terminal abierta mientras utilizas la aplicación.
5. Presiona `Control + C` para detenerla.

También puedes usar:

```bash
python3 servidor_demo.py
```

## Flujo de trabajo

- `main`: versión estable, canónica y publicada.
- `recovery/v0.4-completa`: recuperación acumulativa del baseline integral.
- `work/<versión>-<tema>`: construcción funcional o visual.
- `fix/<versión>-<tema>`: correcciones puntuales.
- Pull request: revisión y matriz de regresión.
- Merge a `main`: despliegue automático.

## Reglas

1. No reemplazar `main` por una versión antigua completa.
2. Toda recuperación debe ser acumulativa: preservar lo mejor de v0.4 y v0.6.1.
3. No reemplazar ni deformar el logo canónico.
4. No publicar secretos reales ni datos personales reales.
5. Los perfiles ficticios deben identificarse como demostración.
6. Mantener disponibles los modelos de administración, operación, control y Studio.
7. Ejecutar verificaciones visuales, funcionales y de contenido antes de fusionar.
8. Confirmar etiquetado, vida útil, cadena de frío, costos y precios antes de venta real.

## Identidad visual

La firma de marca es:

**Masa · Fuego · Territorio**

La identidad utiliza carbón, crema, terracota, trigo y acero, con fotografía cálida y documental. Las ilustraciones SVG conceptuales se mantienen como apoyo o fallback; los activos visuales aprobados de v0.4 se recuperan como referencias principales.
