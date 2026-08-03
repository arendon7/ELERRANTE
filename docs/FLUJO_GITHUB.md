# Flujo GitHub propuesto

## Objetivo

Usar GitHub como fuente única del proyecto, manteniendo dos experiencias:

1. **Demo local completa:** web pública, control, operación, Studio y presentación.
2. **GitHub Pages:** únicamente la experiencia pública.

## Ramas

| Rama | Uso |
|---|---|
| `main` | Última versión estable y desplegable |
| `work/v0.6-commerce-gold` | Próxima iteración de ecommerce |
| `work/v0.7-events-operations` | Eventos y operación |
| `fix/<tema>` | Correcciones puntuales |

## Ciclo

1. Crear rama desde `main`.
2. Construir y probar localmente.
3. Subir los cambios.
4. Abrir pull request.
5. Revisar archivos y demo.
6. Corregir hallazgos.
7. Integrar mediante squash merge.
8. Crear tag de versión cuando corresponda.

## Publicación

El workflow de GitHub Pages:

- se activa al actualizar `main`;
- copia solo archivos públicos a `_site`;
- excluye documentación y paneles internos;
- publica el artefacto en el entorno `github-pages`.

## Versiones

- `v0.5.0`: Gold Master Content.
- `v0.6.0`: Commerce Gold.
- `v0.7.0`: Events & Operations Gold.
- `v0.8.0`: UX, Mobile & Accessibility.
- `v0.9.0`: Release Candidate.
- `v1.0.0`: Gold Master Local.

## Seguridad

Nunca subir:

- tokens;
- contraseñas;
- credenciales Wompi;
- llaves privadas;
- información personal de clientes;
- bases de datos reales;
- documentos societarios confidenciales.
