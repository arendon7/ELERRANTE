# Guía de uso — El Errante V0.4.0 Local Autocontenida

## Qué es esta versión

Es una aplicación demostrativa que funciona completamente en tu computador.
No usa WordPress, no requiere hosting y no envía datos a internet.

## Abrir en Mac

1. Descomprime el archivo ZIP.
2. Abre la carpeta resultante.
3. Haz clic derecho sobre `ABRIR_EL_ERRANTE.command`.
4. Selecciona **Abrir**.
5. Mantén la ventana de Terminal abierta mientras navegas.

La demo buscará automáticamente un puerto libre entre 8080 y 8120.

## Detener

Vuelve a la ventana de Terminal y presiona `Control + C`.

## Abrir otras vistas

Mientras la demo está corriendo:

- `ABRIR_CONTROL.command`: abre el editor local de precios, inventario y datos.
- `ABRIR_PRESENTACION.command`: abre una presentación navegable.
- `VERIFICAR_DEMO.command`: revisa la integridad básica de los archivos.

## Qué guarda

La demo usa `localStorage` del navegador para:

- Carrito.
- Pedidos.
- Eventos.
- Soporte.
- Producción.
- Lotes.
- Rutas.
- Precios e inventario modificados.

Nada se envía fuera del computador.

## Exportar y recuperar

Desde `control.html` puedes exportar un archivo JSON con todo el estado local e
importarlo después.

## Limitaciones

- No procesa pagos.
- No autentica usuarios.
- No envía correos.
- No sincroniza varios computadores.
- No sustituye una plataforma productiva.
