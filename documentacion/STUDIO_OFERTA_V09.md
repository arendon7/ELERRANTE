# Studio de Oferta El Errante v0.9

## Propósito

Studio de Oferta convierte la Matriz Maestra de Oferta en una superficie navegable para revisar productos, variantes, olas, puertas, responsables y decisiones pendientes.

No es un sistema productivo ni una fuente de aprobaciones legales. Es una herramienta de gobierno y demostración que ayuda a organizar las sesiones humanas antes del piloto.

## Fuente

El módulo consume:

`documentacion/modelo-oferta-v09.json`

El archivo contiene 11 productos, 14 variantes, precios y stocks de demostración, olas propuestas y puertas de lanzamiento.

## Vistas

### Tablero de portafolio

Permite:

- consultar las 11 referencias;
- filtrar por ola, línea y prioridad;
- buscar por nombre, SKU o siguiente decisión;
- visualizar avance documental;
- identificar puertas críticas pendientes;
- abrir el expediente de cada producto.

### Expediente de producto

Muestra:

- función estratégica;
- ola, prioridad y forma de entrada;
- variantes y cifras demostrativas;
- siguiente decisión;
- puertas de lanzamiento;
- estado base de cada puerta;
- evidencia o condición local;
- responsable y próxima revisión;
- notas del comité.

### Centro de Control

Resume la ola 1 con:

- productos del núcleo;
- aprobaciones locales;
- bloqueos críticos;
- avance documental medio;
- siguiente decisión por referencia.

## Persistencia

Las decisiones se almacenan en el navegador bajo:

`ee_v09_offer_governance`

No modifican:

- `EE_DATA`;
- precios públicos;
- stock público;
- disponibilidad en tienda;
- fórmulas maestras;
- inventarios reales;
- aprobaciones sanitarias.

El estado puede exportarse como JSON para revisión o respaldo.

## Estados generales

- `pendiente`
- `en_prueba`
- `en_revision`
- `aprobado_con_condiciones`
- `aprobado`
- `descartado`

## Regla de evidencia

Un producto no debe marcarse como aprobado sin registrar:

- responsable;
- fecha;
- evidencia;
- alcance de la aprobación;
- condiciones pendientes;
- próxima revisión, cuando corresponda.

## Avance documental frente a lanzamiento

El porcentaje mostrado es un indicador documental. No significa que el producto esté listo para vender.

Un producto solo puede considerarse listo para piloto cuando sus puertas críticas tengan aprobación respaldada, especialmente:

- fórmula;
- costo;
- precio;
- margen;
- empaque;
- etiqueta;
- sanitario;
- vida útil;
- conservación;
- instrucciones;
- capacidad;
- inventario;
- cobertura.

## Seguridad

Studio de Oferta utiliza únicamente datos simulados y decisiones locales. No debe contener datos personales reales, secretos, tokens, credenciales, fórmulas confidenciales completas ni información regulatoria no autorizada para publicación.
