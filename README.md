# El Errante

**Masa · Fuego · Territorio**

Repositorio maestro de la experiencia web pública y del entorno local de El Errante.

## Estado actual

- Versión pública: `v0.6.1 — Catálogo Gold`
- Marca: identidad visual canónica consolidada
- Catálogo: 11 referencias con fichas, galerías e instrucciones
- Contenidos: historia, tienda, En Casa, En Movimiento, Bitácora, recetas y herramientas
- Tecnología: HTML, CSS y JavaScript sin dependencias externas
- Publicación: GitHub Pages mediante GitHub Actions
- Pedidos: registro sujeto a confirmación de inventario, cobertura y pago
- Datos comerciales, sanitarios y operativos: requieren validación final antes de venta real

## Sitio público

El sitio se publica desde el workflow:

```text
.github/workflows/pages.yml
```

El workflow:

1. toma la versión integrada en `main`;
2. prepara únicamente la superficie pública;
3. excluye paneles internos, documentación y lanzadores locales;
4. valida `deploy-version.txt`, la identidad v0.6 y `assets/products-v6.js`;
5. publica el artefacto mediante GitHub Pages.

Configuración requerida en GitHub:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

La rama `fix/v0.5.1-restore-gold-assets` se conserva temporalmente sincronizada con `main` para neutralizar configuraciones antiguas de Pages. No debe utilizarse para desarrollar.

## Verificación de versión

El archivo público:

```text
deploy-version.txt
```

identifica la versión y el commit que deben estar desplegados. El service worker usa documentos `network-first` y elimina cachés antiguas para evitar que instalaciones previas sigan mostrando v0.5.

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

## Estructura pública principal

```text
/
├── index.html
├── historia.html
├── tienda.html
├── producto.html
├── en-casa.html
├── en-movimiento.html
├── bitacora.html
├── articulo.html
├── recetas.html
├── receta.html
├── herramientas.html
├── cobertura.html
├── ayuda.html
├── checkout.html
├── cuenta.html
├── assets/
├── service-worker.js
├── deploy-version.txt
└── .github/workflows/pages.yml
```

## Flujo de trabajo

- `main`: versión estable, canónica y publicable.
- `work/<versión>-<tema>` o `fix/<versión>-<tema>`: ramas de construcción.
- Pull request: revisión de cambios y pruebas.
- Merge a `main`: despliegue automático de GitHub Pages.
- Tags: hitos estables, por ejemplo `v0.6.1`.

## Reglas

1. No desarrollar directamente sobre `main`, salvo reparación urgente de despliegue.
2. No subir ZIP de entregas al repositorio.
3. No reemplazar ni deformar el logo canónico.
4. No publicar claves, credenciales o datos personales.
5. Mantener `assets/data.js` como fuente maestra y `assets/products-v6.js` como capa comercial pública.
6. Ejecutar las verificaciones disponibles antes de cada pull request.
7. Confirmar etiquetado, vida útil, cadena de frío, costos y precios antes de venta real.

## Identidad visual

La edición web utiliza ilustraciones SVG locales optimizadas y una identidad basada en carbón, crema, terracota, trigo y acero. La firma de marca es:

**Masa · Fuego · Territorio**
