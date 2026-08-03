# Snapshot autocontenido El Errante v0.4.0

## Propósito

Este snapshot conserva la última versión integral anterior a la migración a GitHub. Incluye marca, tienda, productos, contenido, administración, operación, Studio, centro de control, presentación y scripts locales.

## Paquete optimizado

- Archivo: `El_Errante_v0_4_0_AUTOCONTENIDA_OPTIMIZADA.zip`
- Tamaño: `3.261.583 bytes`
- SHA-256: `7f3ed65f89bc746ea12548f33274644d80c33438662f94b84ead44dc4980e841`
- Archivos incluidos: `67`
- Imágenes: WebP optimizadas a partir de los PNG aprobados de v0.4.
- Secretos reales detectados: ninguno.

Respaldo temporal de trabajo:

`https://drive.google.com/file/d/19dsgXTMj7PjVZviaPQt7VbXSYKe2bT7H/view?usp=drivesdk`

Drive funciona únicamente como respaldo temporal. La web publicada no depende de ese archivo ni de permisos externos.

## Modelos preservados

El snapshot conserva:

- experiencia pública y navegación;
- tienda, productos, variantes y carrito;
- pedidos, cobertura, cuenta y soporte;
- administración;
- producción, lotes, inventarios y rutas;
- Studio, validaciones y fuente maestra;
- centro de control y escenarios;
- presentación integral;
- importación y exportación local.

## Aclaración sobre las fichas especiales

La auditoría directa del snapshot confirmó que:

- `producto-harina.html` redirige a `producto.html?id=harina-aire-y-tiempo`;
- `producto-crea-tuya.html` redirige a `producto.html?id=crea-la-tuya`.

Por tanto, la v0.4 ya utilizaba una ficha dinámica central. No existían dos páginas especiales más completas que deban reconstruirse. Ambos alias se conservan para compatibilidad y trazabilidad.

## Biblioteca visual recuperada

Los 17 conceptos visuales de v0.4 ya están dentro del repositorio:

1. `v040-hero-desktop.svg`
2. `v040-hero-mobile.svg`
3. `v040-harina-empaques.svg`
4. `v040-harina-manos.svg`
5. `v040-harina-horno.svg`
6. `v040-manos-masa.svg`
7. `v040-masa-apertura.svg`
8. `v040-alveolos.svg`
9. `v040-fermentacion.svg`
10. `v040-pizza-neo.svg`
11. `v040-pizza-errante.svg`
12. `v040-despensa.svg`
13. `v040-aplicaciones-empaque.svg`
14. `v040-pizzeria-movil.svg`
15. `v040-bitacora-fuego.svg`
16. `v040-pizzas-artesanales.svg`
17. `v040-pizzas-coleccion.svg`

Los activos se almacenan como SVG autocontenidos con imagen WebP embebida. No requieren Drive ni servicios externos.

### Duplicidad encontrada en el snapshot

Los archivos originales `pizzas-artesanales` y `pizzas-coleccion` tienen exactamente la misma imagen binaria. El repositorio conserva ambos nombres canónicos, pero `v040-pizzas-coleccion.svg` referencia internamente el activo artesanal para evitar duplicar bytes.

## Activación en la experiencia actual

La recuperación está conectada mediante dos mecanismos complementarios:

1. referencias directas en las páginas principales;
2. `assets/host-mode.js` para contenido estático heredado y componentes generados por JavaScript.

Las asociaciones principales son:

- Inicio: hero de escritorio y móvil;
- Aire y Tiempo: empaque, manos, horno, fermentación, apertura y alveolos;
- Tienda y En Casa: colección de pizzas;
- Bitácora: bitácora y fuego;
- fichas y contenidos: pizza neo, La Errante y contexto artesanal;
- Despensa: producto y aplicaciones de empaque;
- En Movimiento: pizzería móvil;
- Presentación: activos de marca, producto y experiencia.

Las imágenes v0.6 específicas de Margherita, Diavola, Bosque y Cuatro Quesos se conservan para diferenciar sabores. Los activos v0.4 aportan contexto, proceso, empaque y narrativa general.

## Barrera de regresión

`verificar_demo.py` valida antes de cada publicación:

- páginas públicas;
- módulos integrales;
- once productos;
- diecisiete visuales v0.4;
- referencias HTML y CSS;
- alias históricos de producto;
- caché y mapa visual;
- versión de despliegue;
- workflow limitado a `main`;
- ausencia de patrones evidentes de secretos reales.

El workflow ejecuta esta prueba en cada pull request. El despliegue de GitHub Pages solo se ejecuta después del merge a `main`.

## Seguridad

La revisión no encontró tokens, claves API, contraseñas reales, llaves privadas ni credenciales de infraestructura. Los perfiles y datos operativos son de demostración.

## Estado

- [x] Snapshot extraído y auditado.
- [x] Modelos internos publicados.
- [x] Centro integral del equipo creado.
- [x] Presentación corregida y conectada.
- [x] Workflow publica el sistema completo.
- [x] 17 de 17 conceptos visuales incorporados.
- [x] Referencias principales activadas.
- [x] Barrera automática de regresión integrada.
- [ ] Fuente de datos consolidada sin overlay permanente.
- [ ] Regresión funcional completa de carrito, formularios y módulos ejecutada.
