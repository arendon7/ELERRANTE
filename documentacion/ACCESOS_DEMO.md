# Accesos de demostración — El Errante

## Alcance

El repositorio y GitHub Pages publican el sistema completo para facilitar presentaciones, validación y trabajo con el equipo.

Actualmente los módulos no tienen autenticación real. Las rutas se abren directamente y operan con datos simulados almacenados en el navegador.

## Rutas principales

| Área | Ruta |
|---|---|
| Centro integral | `equipo.html` |
| Sitio público | `index.html` |
| Tienda | `tienda.html` |
| Pedido | `checkout.html` |
| Administración | `admin.html` |
| Centro de control | `control.html` |
| Operación | `operacion.html` |
| Studio de datos | `studio.html` |
| Presentación | `presentacion.html` |

## Perfiles ficticios reservados

Estos identificadores son exclusivamente de demostración. No son cuentas reales y no conceden acceso técnico a ningún servicio.

| Perfil | Usuario demo | Clave demo |
|---|---|---|
| Dirección | `direccion@elerrante.demo` | `Errante-Direccion-2026` |
| Comercio | `comercio@elerrante.demo` | `Errante-Comercio-2026` |
| Operación | `operacion@elerrante.demo` | `Errante-Operacion-2026` |
| Studio | `studio@elerrante.demo` | `Errante-Studio-2026` |

## Datos que sí pueden publicarse

- Productos, variantes, recetas y precios de demostración.
- Modelos comerciales, operativos y de gobierno de datos.
- Inventarios y pedidos simulados.
- Usuarios y contraseñas ficticios como los anteriores.
- Archivos `.env.example` sin valores reales.
- Documentación, diagramas y escenarios de presentación.

## Datos que nunca deben subirse

- Tokens de GitHub, Meta, WhatsApp, correo, pagos o analítica.
- Claves API y secretos OAuth.
- Contraseñas reales de personas o empresas.
- Llaves privadas, certificados y credenciales de bases de datos.
- Datos personales reales de clientes, empleados o proveedores.

Los secretos reales deben inyectarse mediante GitHub Secrets o variables de entorno cuando existan integraciones reales.

## Estado técnico

- Pagos: simulados.
- Envío de correos: no implementado.
- Autenticación: no implementada.
- Persistencia: `localStorage` del navegador.
- Integraciones externas: no activas.
- Uso previsto: demo pública, validación y trabajo colaborativo.
