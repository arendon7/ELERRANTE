# Hardening de gobierno interno V3.1.1

## Objetivo

Unificar la experiencia del sistema interno sin convertir las superficies auxiliares de gobierno en nuevos módulos operativos.

El flujo principal de V3.1.1 permanece intacto:

1. Panel de control — priorizar.
2. Operación — ejecutar.
3. Finanzas — analizar y decidir.

Studio de datos y Actas se presentan como **superficies auxiliares de gobierno y trazabilidad**.

## Studio de datos

Studio conserva sus motores V0.9 y su contrato de datos. El hardening cambia únicamente el contexto visual y de navegación:

- usa el shell visual del sistema interno;
- vuelve al Centro interno de forma explícita;
- conecta con Control, Operación, Finanzas y Actas;
- elimina enlaces internos obsoletos hacia `equipo.html`;
- mantiene visibles fuente, estado y pendiente de validación.

Studio no registra pedidos, producción ni hechos financieros.

## Actas

Actas conserva el motor de validación V0.9, las 17 puertas del comité y sus reglas de evidencia. El hardening:

- usa el mismo shell visual interno;
- conecta Actas con Datos maestros y los tres contextos principales;
- elimina el enlace obsoleto a `equipo.html` como supuesto centro interno;
- mantiene explícito que la persistencia local no constituye firma electrónica ni autorización regulatoria.

## Compatibilidad de acceso

Control, Operación y Finanzas continúan protegidos por la sesión local V3.1.

Studio y Actas conservan por ahora su contrato histórico de acceso directo porque sus regresiones canónicas V0.9 lo ejercitan así. El hardening no simula seguridad donde no existe: las integra visual y navegacionalmente, pero no las declara superficies autenticadas.

Una futura migración a Auth + RLS podrá proteger también estas herramientas cuando su contrato de acceso sea actualizado de manera explícita y validada.

## Invariantes

- No se modifica el motor de Studio.
- No se modifica el motor de Actas.
- No se reescribe la página pública `equipo.html`.
- Studio y Actas no se cuentan como cuarto o quinto contexto operativo.
- Los enlaces internos ya no usan `equipo.html` como destino de administración.
- La web pública y el sistema interno permanecen semánticamente separados.