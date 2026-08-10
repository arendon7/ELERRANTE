# El Errante — Roadmap activo posterior a Operación V3.3.0

## 1. Punto de partida

Este es el roadmap vigente del proyecto. Sustituye como guía operativa al roadmap histórico `ROADMAP_OPERACION_COMERCIAL_V14.md`, que se conserva únicamente como registro de decisiones anteriores.

Estado de referencia:

- release integral: **V3.1.1**;
- runtime / materialización: **V2.8.0**;
- línea pública/editorial: **V2.9**;
- arquitectura interna: **V3.1**;
- shell y sesión local: **V3.1.1**;
- Panel de control: shell V3.1.1 / motor V3.0;
- Operación efectiva: **V3.3.0**;
- Finanzas efectiva: **V3.2.9**;
- Supabase: preparado, **inactivo**;
- persistencia interna efectiva: navegador local;
- GitHub Pages: entorno público certificado de revisión y demostración.

La matriz detallada vive en `MAPA_VERSIONES_ACTIVAS.md`.

## 2. Qué ya está resuelto

### Experiencia pública

- identidad visual y canon de activos V2.8;
- narrativa/editorial V2.9;
- catálogo, producto, historia, recetas, eventos y recorridos públicos;
- checkout y mensajes honestos compatibles con un backend todavía inactivo;
- materialización determinista para Mac, Playwright y Pages.

### Acceso interno

- acceso local configurable por navegador;
- contraseña derivada con PBKDF2/SHA-256 y sal aleatoria;
- sesión con expiración efectiva;
- retorno seguro a destinos internos permitidos;
- navegación entre Centro interno, Control, Operación y Finanzas;
- demo operativa reversible y aislada de configuración remota.

### Operación

- pedidos y continuidad V2.1;
- producción y despacho V2.2;
- materiales/BOM V2.3;
- medición, lotes, rendimiento y merma V2.4;
- abastecimiento controlado V2.5;
- priorización ejecutiva V3.0;
- evidencia y cierre append-only V3.3.0.

### Finanzas

- baseline + working model V3.1;
- profundidad financiera acumulativa V3.2.0–V3.2.9;
- separación Plan vs. Real;
- costos históricos sin fallback silencioso;
- caja, tendencias, economía unitaria, escenarios y decisiones;
- calidad/readiness del dato;
- demo financiera sintética, aislada y reversible.

### Release engineering

- fuente canónica materializada;
- auditoría de marca y módulos;
- validación de release;
- Playwright desktop y móvil;
- publicación Pages por SHA;
- health-check público de contenido y versiones;
- reintentos acotados frente a 503 transitorios sin relajar controles.

## 3. Principios para las siguientes iteraciones

1. **No convertir la app en un ERP por acumulación de formularios.** Cada nueva superficie debe resolver una decisión o una evidencia concreta.
2. **No activar backend por calendario.** Supabase sólo se activa cuando el flujo local ya tenga contratos de datos suficientemente estables.
3. **No versionar datos privados.** Costos, inventarios reales, MFO, clientes y comprobantes quedan fuera del repositorio público.
4. **Hecho y plan permanecen separados.** Finanzas interpreta; Operación registra hechos.
5. **Desconocido no equivale a cero.** La calidad del dato debe permanecer visible.
6. **Toda corrección relevante conserva historia.** Preferir eventos o versiones sobre sobrescritura silenciosa.
7. **Una versión modular no obliga a renumerar toda la aplicación.** Seguir `MAPA_VERSIONES_ACTIVAS.md`.

## 4. Prioridad 1 — Gobierno de documentación activa

Objetivo: impedir que documentos antiguos contradigan el estado certificado.

Acciones:

- mantener un índice explícito de documentación vigente e histórica;
- actualizar el mapa de datos y fuentes;
- retirar del documento de acceso cualquier usuario/clave demo fija que ya no forme parte del producto;
- marcar el roadmap V1.4 como histórico;
- conservar documentos antiguos por trazabilidad, no como instrucciones vigentes.

Criterio de cierre:

- una persona o agente nuevo puede identificar en menos de un minuto qué documentos describen el sistema actual.

## 5. Prioridad 2 — Datos maestros y calidad operativa

Objetivo: elevar la confiabilidad de los hechos antes de añadir más analítica.

Revisar transversalmente:

- productos y variantes;
- recetas y BOM;
- materiales e insumos;
- unidades y conversiones;
- proveedores;
- precios observados y costos con fecha/fuente;
- inventario conocido, desconocido y fecha de conteo;
- lotes, rendimiento y merma;
- referencias de soporte.

Resultado esperado:

- cada dato crítico tiene propietario, fuente, estado de calidad y fecha cuando corresponda;
- Studio/Datos maestros deja claro qué es público, qué es operativo local y qué es privado;
- ningún módulo necesita inventar valores para completar una vista.

No incluye todavía:

- sincronización multiusuario;
- automatización de compras;
- actualización automática de inventario sin evento autorizado.

## 6. Prioridad 3 — Cierre operativo utilizable

Objetivo: convertir V3.3.0 en una rutina diaria simple, no en otro panel pesado.

Posibles incrementos compatibles:

- resumen de cierre del día imprimible/exportable;
- enlaces directos desde una alerta de evidencia hacia el hecho que necesita atención;
- identificación de quién registró/corrigió una evidencia local;
- lectura semanal de rendimiento, merma, tiempos y recepciones sin duplicar Finanzas;
- checklist de pendientes de cierre arrastrables al siguiente día sólo cuando corresponda.

Criterio de diseño:

- si una mejora puede resolverse enlazando un hecho existente, no crear un segundo formulario para ese hecho.

## 7. Prioridad 4 — Piloto con datos reales controlados, todavía local

Objetivo: probar el modelo con operación real sin exponerla en GitHub ni adelantar la complejidad de backend.

Alcance sugerido:

- un navegador/dispositivo controlado;
- catálogo real validado;
- costos e inventarios cargados de forma privada;
- pedidos reales de un periodo corto;
- conteos físicos y compras observadas;
- baseline financiero privado;
- exportaciones de respaldo antes y después del piloto.

Criterios de salida:

- reconciliación satisfactoria entre pedidos, producción, compras, inventario y caja;
- lista explícita de datos que necesitan persistencia compartida;
- identificación de operaciones que requieren permisos/roles reales.

## 8. Prioridad 5 — Gate de activación Supabase

Supabase no se activa hasta que el piloto local demuestre la necesidad y estabilidad de los contratos.

Antes de activar:

- modelo de identidad y roles definido;
- Auth real para usuarios administrativos;
- RLS por tabla y operación;
- estrategia de migración desde claves locales;
- almacenamiento privado para comprobantes/soportes que realmente deban subirse;
- auditoría servidor para acciones sensibles;
- recuperación/backup;
- pruebas de concurrencia e idempotencia;
- separación inequívoca entre variables públicas y secretos.

La activación deberá tratarse como un **cambio de contrato transversal** y probablemente justificar una nueva release integral.

## 9. Prioridad 6 — Piloto comercial conectado

Sólo después del gate anterior:

- pedidos reales multiusuario;
- comprobantes privados;
- estados y comunicaciones reales;
- inventario compartido;
- conciliación con Finanzas;
- privacidad, tratamiento de datos y textos legales revisados;
- monitoreo y rollback.

Pages puede seguir siendo superficie pública de revisión, pero la operación conectada deberá ejecutarse en una arquitectura adecuada para datos privados y autorización servidor.

## 10. Qué no es prioridad inmediata

- sumar dashboards financieros adicionales sólo por profundidad visual;
- crear automatizaciones que compren o descuenten inventario sin evidencia/autorización;
- publicar costos reales en el repo;
- renombrar todos los assets para hacer coincidir sus números con V3.3.0;
- activar Supabase únicamente porque el esquema ya existe;
- introducir una pasarela de pago antes de estabilizar el piloto operativo.

## 11. Criterio de cierre de cualquier siguiente ciclo

Una iteración sólo se considera integrada cuando, sobre el mismo SHA de `main`:

1. auditoría canónica = PASS;
2. validación/materialización = PASS;
3. Playwright desktop+móvil = PASS;
4. Pages = publicado;
5. health-check público = PASS;
6. documentación activa = coherente con el cambio;
7. no quedan PR redundantes o tareas del ciclo sin clasificar.
