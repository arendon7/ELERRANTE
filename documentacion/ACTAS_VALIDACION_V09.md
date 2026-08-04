# Sesiones y actas de validación El Errante v0.9

## Propósito

Convertir las decisiones de comité en registros trazables sin confundir una demostración local con aprobación comercial, sanitaria, jurídica o firma electrónica.

## Flujo

1. Crear una sesión.
2. Seleccionar producto y variantes.
3. Registrar fecha, lugar, objetivo y alcance.
4. Identificar participantes y disciplinas.
5. Marcar las puertas efectivamente revisadas.
6. Registrar decisión, evidencia, condición y vigencia por puerta.
7. Definir decisión general, condiciones y próximos pasos.
8. Identificar responsables firmantes.
9. Guardar borrador.
10. Finalizar el acta.
11. Aplicarla explícitamente al expediente local de Studio.

## Persistencia

- Actas: `ee_v09_validation_acts`.
- Gobierno de oferta: `ee_v09_offer_governance`.

Las dos capas permanecen separadas de `window.EE_DATA` y de la tienda pública.

## Estados del acta

- `borrador`: editable y sin efecto sobre el expediente.
- `finalizada`: cumple los requisitos mínimos, pero todavía no se aplica.
- `aplicada`: sus decisiones revisadas fueron copiadas explícitamente al expediente local.

## Requisitos para finalizar

- fecha;
- objetivo;
- al menos un participante;
- al menos una puerta revisada;
- decisión general distinta de pendiente;
- al menos un firmante;
- condiciones cuando la decisión sea aprobación condicionada.

## Evidencias

En la demo deben registrarse referencias descriptivas, números de lote, códigos internos, enlaces públicos autorizados o nombres de documentos. No deben almacenarse secretos, fórmulas confidenciales completas, documentos sensibles ni datos personales innecesarios en el repositorio público.

## Aplicación al expediente

La aplicación:

- requiere confirmación explícita;
- copia únicamente puertas marcadas como revisadas;
- registra el ID del acta como procedencia;
- conserva condiciones y vigencia;
- actualiza responsable, próxima revisión y notas locales;
- no cambia precios, inventario, fórmulas ni disponibilidad pública.

## Primer producto piloto

Aire y Tiempo es la plantilla inicial porque permite validar fórmula, métodos, empaque, etiqueta, vida útil, costo, precio, capacidad, fotografía y cobertura sin depender de cadena de frío.

## Limitaciones

- No hay autenticación real.
- No hay firma electrónica.
- No existe almacenamiento compartido ni backend.
- La exportación JSON y la impresión son evidencias de demostración.
- Una sesión aplicada no reemplaza las aprobaciones humanas y regulatorias que correspondan.
