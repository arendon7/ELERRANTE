# Auditoría V0.1 y evolución a V0.2 — El Errante

## Diagnóstico de la V0.1

### Fortalezas conservadas
- Identidad visual canónica y paleta coherente.
- Arquitectura narrativa de marca.
- Navegación responsive.
- Carrito persistente y checkout simulado.
- Módulos de tienda, eventos, Bitácora, ayuda, cuenta y administración.
- Funcionamiento local sin dependencias externas.

### Deudas corregidas en V0.2
1. **Datos dispersos:** productos y precios estaban incrustados en `app.js`.
   - Solución: `assets/data.js` como Maestro de Datos único.
2. **Fichas incompletas:** solo harina y Crea la Tuya tenían páginas profundas.
   - Solución: `producto.html?id=...` genera fichas completas para todas las referencias.
3. **Colección incompleta:** faltaban Diavola y Cuatro Quesos.
   - Solución: cinco sabores completos y navegables.
4. **Checkout rígido:** costo de entrega fijo y sin validación del mínimo.
   - Solución: cobertura, costo, mínimo y bloqueo de congelados por ciudad.
5. **Cuenta no conectada:** mostraba un pedido estático.
   - Solución: pedidos del checkout persisten en `localStorage`.
6. **Panel estático:** no recuperaba actividad de la demo.
   - Solución: pedidos, eventos y soporte guardados aparecen en administración.
7. **Contenido técnico insuficiente:** no existían páginas de recetas o herramientas.
   - Solución: biblioteca de recetas y calculadora de masa funcional.
8. **Buscador inexistente.**
   - Solución: búsqueda global de productos, recetas, Bitácora, cobertura y eventos.
9. **Cobertura reducida a un campo aislado.**
   - Solución: página propia y matriz logística.
10. **Enlaces antiguos.**
   - Solución: redirecciones de compatibilidad.

## Límites conscientes de V0.2
- No existe backend ni base de datos real.
- No procesa pagos.
- No autentica usuarios.
- No envía correos.
- No garantiza inventario entre dispositivos.
- Datos sanitarios, legales, financieros y empresariales siguen siendo demostrativos.
- Algunas fotografías son conceptuales y deberán sustituirse por producción real.

## Próximo objetivo técnico
Migración controlada a WordPress + WooCommerce después de aprobar experiencia, contenido y operación piloto.
