# Accesos y modos de demostración — El Errante

## Alcance

GitHub Pages publica la superficie de revisión de El Errante. La release integral vigente es V3.1.1 y las superficies internas principales usan una **sesión local de navegador** para mantener un perímetro de experiencia coherente.

Esta sesión local no convierte GitHub Pages en un backend seguro ni sustituye autorización servidor. Supabase Auth/RLS permanece inactivo.

## Cómo entrar al sistema interno

1. Abrir `acceso.html` o usar el enlace **Acceso usuarios** de la web pública.
2. Si el navegador todavía no tiene un administrador local, puede crearse uno con una contraseña de mínimo 8 caracteres o cambiarse al modo **Ingresar con usuario de revisión**.
3. Las cuentas de revisión funcionan en cualquier navegador compatible y no crean ni reemplazan la cuenta administrador local.
4. Las contraseñas no se guardan como texto dentro de `localStorage`; la verificación usa PBKDF2/SHA-256. Las cuentas de revisión incorporadas usan únicamente derivados para la comprobación en cliente.
5. La sesión dura hasta ocho horas y se almacena en `sessionStorage`.
6. Al cerrar sesión o expirar, las superficies protegidas vuelven a `acceso.html`.

## Usuarios de revisión

Estas credenciales existen exclusivamente para revisar la demo pública y no deben reutilizarse como credenciales reales:

| Usuario | Contraseña | Rol mostrado |
|---|---|---|
| `juancho` | `juancho` | Revisor |
| `lucho` | `lucho` | Revisor |

En un navegador sin administrador local, primero debe pulsarse **Ingresar con usuario de revisión**. Si ya existe un administrador local, ambos usuarios de revisión pueden escribirse directamente en el formulario normal de ingreso.

El rol `Revisor` identifica la sesión en la interfaz. Como GitHub Pages es estático y Supabase Auth/RLS está inactivo, no representa autorización de servidor. Cualquier cambio realizado durante una revisión permanece en el almacenamiento del navegador utilizado y no modifica datos reales centralizados.

## Rutas vigentes

### Públicas

| Área | Ruta |
|---|---|
| Sitio público | `index.html` |
| Tienda | `tienda.html` |
| Producto | `producto.html` |
| Pedido / checkout | `checkout.html` |
| Presentación | `presentacion.html` |
| Acceso usuarios | `acceso.html` |

### Internas con shell V3.1.1

| Área | Ruta | Función |
|---|---|---|
| Centro interno | `centro-interno.html` | Selector de contexto y herramientas auxiliares. |
| Panel de control | `control.html` | Prioridad ejecutiva operativa. |
| Operación V3.3.0 | `operacion.html` | Pedidos, producción, materiales, medición, compras y evidencia/cierre. |
| Finanzas V3.2.9 | `finanzas.html` | Baseline, Plan vs. Real, caja, escenarios, decisiones y readiness. |
| Datos maestros | `studio.html` | Gobierno de producto, SKU, fuentes y evidencia. |
| Actas | `actas.html` | Sesiones, evidencia y decisiones de validación. |

`admin.html` se conserva como superficie heredada de compatibilidad. No debe utilizarse como referencia del mapa interno vigente.

## Retorno seguro después del login

La shell sólo conserva destinos internos permitidos mediante `?next=`:

- `centro-interno.html`;
- `control.html`;
- `operacion.html` y secciones permitidas, incluida `#evidencia`;
- `finanzas.html`;
- `studio.html`;
- `actas.html`.

Un destino externo, una ruta desconocida o un hash no permitido se descarta y no produce redirección abierta.

## Demo operativa

La demo operativa V3.1.1:

- carga hechos sintéticos únicamente en el navegador;
- permite recorrer Control y Operación;
- incluye pedidos, alistamiento, stock, mediciones, compras, órdenes y evidencia V3.3.0;
- respalda el estado local anterior;
- restaura ese estado al salir;
- permanece aislada de configuración remota;
- no debe interpretarse como operación real.

No se activa sobre un contexto financiero local activo.

## Demo financiera

La demo financiera V3.2.9:

- sólo se carga desde una superficie financiera vacía;
- genera cifras sintéticas localmente;
- crea plan, costos demostrativos, pedidos/movimientos/caja de ejemplo;
- no publica costos reales;
- no puede apilarse sobre la demo operativa;
- restaura el estado local anterior al salir.

## Datos que pueden estar en el repositorio

- catálogo, variantes, precios públicos y contenido editorial;
- estructuras de recetas/BOM cuando estén aprobadas para publicación;
- datos sintéticos explícitamente marcados como demo;
- credenciales deliberadamente públicas de revisión que no protegen datos reales ni servicios conectados;
- código, pruebas, documentación y schemas sin secretos;
- `.env.example` sin valores reales;
- imágenes y activos públicos aprobados.

## Datos que no deben subirse

- contraseñas reales o credenciales reutilizables fuera de la demo;
- tokens de GitHub, Meta, WhatsApp, correo, pagos o analítica;
- `service_role`, secretos OAuth, claves privadas o cadenas de conexión;
- MFO real, snapshots financieros privados o costos sensibles;
- comprobantes de pago reales;
- datos personales reales de clientes, empleados o proveedores;
- inventarios o movimientos reales cuando su publicación no haya sido autorizada.

Los secretos e información privada deberán inyectarse o almacenarse mediante mecanismos privados cuando se active una arquitectura conectada.

## Estado técnico vigente

- Release integral: V3.1.1.
- Runtime/materialización: V2.8.0.
- Shell/sesión local: V3.1.1.
- Operación: V3.3.0.
- Finanzas: V3.2.9.
- Persistencia interna: navegador local.
- Supabase Auth/RLS: inactivo.
- Pagos conectados: no declarados activos.
- Uso de Pages: revisión, demostración y certificación pública del artefacto.

Para la matriz completa de versiones: `MAPA_VERSIONES_ACTIVAS.md`.