# El Errante — Roadmap activo posterior a Cierre Diario V3.6

## 1. Estado de referencia

- release integral: **V3.1.1**;
- runtime / materialización: **V2.8.0**;
- línea pública/editorial: **V2.9**;
- arquitectura interna: **V3.1**;
- shell y sesión local: **V3.1.1**;
- Control: motor V3.0 + horizonte V3.4 + capacidad V3.5 + continuidad V3.6;
- Operación: motores V2.1–V2.5 + evidencia V3.3 + horizonte V3.4 + capacidad V3.5 + cierre diario V3.6;
- Finanzas: workbench V3.1 + profundidad V3.2.x + histórico/inventario V1.4/V1.5 + puente operativo V3.4 + cierre gerencial/tesorería V3.5;
- Supabase: preparado, **inactivo**;
- persistencia interna efectiva: navegador local;
- GitHub Pages: entorno público certificado de revisión y demostración.

La numeración de las capas no sustituye automáticamente la release integral. Los archivos históricos mantienen su nombre cuando siguen siendo el contrato base.

## 2. Qué ya está resuelto

### Experiencia pública

- identidad y canon de activos V2.8;
- narrativa/editorial V2.9;
- catálogo y recorridos públicos;
- checkout compatible con backend inactivo;
- materialización determinista y Pages certificado.

### Acceso interno

- acceso local configurable;
- contraseña derivada con PBKDF2/SHA-256;
- sesión expirable y retorno seguro;
- navegación entre Centro, Control, Operación, Finanzas, Datos maestros y Actas;
- demos locales reversibles.

### Operación

- pedidos y continuidad V2.1;
- producción V2.2;
- materiales/BOM V2.3;
- medición, lotes, rendimiento y merma V2.4;
- abastecimiento V2.5;
- priorización ejecutiva V3.0;
- evidencia append-only V3.3;
- horizonte de siete días V3.4;
- capacidad observada y versionada V3.5;
- **cierre diario y continuidad V3.6**.

### Finanzas

- baseline + working model V3.1;
- profundidad acumulativa V3.2.0–V3.2.9;
- Plan vs. Real;
- caja y tendencias;
- economía unitaria, escenarios y decisiones;
- costos históricos V1.4 e inventario valorizado V1.5;
- puente operativo V3.4;
- cierre gerencial, tesorería corta y señal de capacidad V3.5.

### Release engineering

- auditoría canónica;
- materialización determinista;
- Playwright desktop y móvil;
- Pages por SHA;
- health-check público general y por incrementos;
- Graphify como memoria estructural regenerable;
- documentación humana separada de la memoria autogenerada.

## 3. Principios de las siguientes iteraciones

1. **No convertir la app en un ERP por acumulación de formularios.**
2. **No activar backend por calendario.** Supabase sólo entra cuando el piloto real demuestre necesidad y contratos estables.
3. **No versionar datos privados.** Costos reales, MFO, clientes, comprobantes y credenciales permanecen fuera del repo público.
4. **Hecho y plan permanecen separados.** Operación registra; Finanzas interpreta.
5. **Desconocido no equivale a cero.**
6. **Toda corrección relevante conserva historia.**
7. **Un cierre no reescribe el hecho que resume.**
8. **Una versión modular no obliga a renumerar toda la aplicación.**

## 4. V3.6 — criterio funcional

El cierre diario debe responder tres preguntas:

1. ¿Qué pasó hoy?
2. ¿Qué quedó pendiente?
3. ¿Puedo cerrar la jornada con confianza?

V3.6 añade:

- cola accionable con enlaces al hecho origen;
- estados `Sin actividad`, `Pendiente`, `Lista para cerrar`, `Cerrada`, `Cerrada con excepciones` y `Requiere revisión`;
- justificación obligatoria para cerrar con bloqueos;
- ledger local `ee_v36_daily_close_events` append-only;
- `supersedes` para correcciones;
- arrastre sólo de pendientes que continúan realmente abiertos;
- resumen imprimible/exportable;
- lectura semanal mínima de disciplina de cierre.

El detalle contractual está en `CIERRE_DIARIO_V36.md`.

## 5. Siguiente prioridad — Piloto local con datos reales controlados

Con V3.6 cerramos la principal brecha de rutina diaria. El siguiente ciclo relevante ya no debería ser otro dashboard, sino un **piloto operativo real controlado**.

Alcance sugerido:

- un navegador/dispositivo controlado;
- catálogo real validado;
- costos e inventarios cargados de forma privada;
- pedidos reales de un periodo corto;
- producción, conteos, compras y recepciones observadas;
- cierre diario V3.6 usado de forma efectiva;
- baseline financiero privado;
- conteos de caja observados;
- backups antes y después del piloto.

Criterios de salida:

- reconciliación satisfactoria entre pedidos, producción, compras, inventario y caja;
- lista explícita de datos que requieren persistencia compartida;
- identificación de acciones que necesitan permisos/roles reales;
- evidencia de qué formularios o señales sobran y cuáles sí se usan diariamente.

## 6. Después del piloto — Gate Supabase

Supabase no se activa hasta que el piloto local demuestre necesidad y estabilidad de los contratos.

Antes de activar:

- identidad y roles definidos;
- Auth real;
- RLS por tabla y operación;
- estrategia de migración de datos locales;
- almacenamiento privado para soportes;
- auditoría servidor de acciones sensibles;
- recuperación/backup;
- pruebas de concurrencia e idempotencia;
- separación inequívoca entre variables públicas y secretos.

La activación debe tratarse como cambio transversal y probablemente justificar una nueva release integral.

## 7. Qué no es prioridad inmediata

- otro dashboard financiero por profundidad visual;
- automatizar compras o descuentos de inventario sin evidencia/autorización;
- publicar costos reales;
- renombrar todos los assets para hacer coincidir numeración;
- activar Supabase sólo porque el esquema existe;
- introducir pasarela de pago antes de estabilizar el piloto operativo;
- duplicar un formulario cuando basta enlazar el hecho existente.

## 8. Criterio de cierre de cualquier ciclo

Una iteración sólo se considera integrada cuando, sobre el mismo SHA de `main`:

1. auditoría canónica = PASS;
2. validación/materialización = PASS;
3. Playwright desktop+móvil = PASS;
4. Pages = publicado;
5. health-check público = PASS;
6. documentación activa = coherente;
7. Graphify = actualizado;
8. no quedan PR redundantes ni tareas del ciclo sin clasificar.
