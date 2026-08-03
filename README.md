# El Errante

**Masa · Fuego · Territorio**

Repositorio maestro de la demo web local y pública de El Errante.

## Estado actual

- Versión: `v0.5.0 — Gold Master Content`
- Tipo: HTML, CSS y JavaScript sin dependencias externas
- Ejecución local: servidor Python incluido
- Publicación: GitHub Pages mediante GitHub Actions
- Pagos, correos y autenticación: simulados
- Datos comerciales, sanitarios y operativos: en validación

## Abrir localmente en Mac

1. Clona o descarga el repositorio.
2. Haz clic derecho en `ABRIR_EL_ERRANTE.command`.
3. Selecciona **Abrir**.
4. Mantén Terminal abierta mientras utilizas la demo.
5. Presiona `Control + C` para detenerla.

También puedes usar:

```bash
python3 servidor_demo.py
```

## Sitio público

Cada cambio integrado en `main` ejecuta el workflow:

```text
.github/workflows/pages.yml
```

El workflow publica únicamente la web pública. Excluye paneles internos, documentación,
lanzadores, scripts de Terminal y archivos temporales.

La primera vez, un administrador del repositorio debe abrir:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

## Estructura

```text
/
├── index.html
├── tienda.html
├── producto.html
├── en-casa.html
├── en-movimiento.html
├── bitacora.html
├── recetas.html
├── assets/              # código y paquete local de imágenes
├── documentacion/       # material interno, no se publica
├── admin.html           # solo uso local
├── control.html         # solo uso local
├── operacion.html       # solo uso local
├── studio.html          # solo uso local
├── servidor_demo.py
└── .github/workflows/pages.yml
```

## Flujo de trabajo

- `main`: versión estable y publicable.
- `work/<version>-<tema>`: ramas de construcción.
- Pull request: revisión de cambios y pruebas.
- Merge a `main`: despliegue automático de GitHub Pages.
- Tags: hitos estables, por ejemplo `v0.5.0`.

## Reglas

1. No trabajar directamente sobre `main`.
2. No subir ZIP de entregas al repositorio.
3. No reemplazar el logo canónico.
4. No publicar claves, credenciales o datos personales.
5. Mantener `assets/data.js` como fuente maestra de la demo.
6. Ejecutar `python3 verificar_demo.py` antes de cada pull request.

## Recursos visuales

La edición web utiliza ilustraciones SVG locales optimizadas, sin dependencias externas.
