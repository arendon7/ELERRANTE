# Validadores históricos archivados

Estos scripts documentan las barreras utilizadas durante las iteraciones V1.2 a V2.4. Se conservan para trazabilidad, pero dejaron de ser ejecutables dentro del pipeline vigente porque mezclaban dos conceptos diferentes:

- la versión funcional de un módulo particular;
- la versión integral, la caché y el estado global de la aplicación.

El pipeline V2.8 utiliza ahora:

- `verificar_demo.py` para estructura, marca, contenidos y seguridad;
- `scripts/verificar_canon_marca_v28.py` para el canon visual;
- `scripts/verificar_activos_hq_v28.py` para integridad física de WebP;
- `scripts/verificar_modulos_v28.py` para operación, backend, confianza, activación, producción, materiales, medición, abastecimiento y finanzas;
- Playwright para comportamiento de escritorio y móvil.

Los archivos de este directorio no deben ser invocados desde workflows ni interpretarse como requisitos actuales de versión o caché.
