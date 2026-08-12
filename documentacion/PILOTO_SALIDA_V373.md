# Piloto operativo V3.7.3 — salida, aprendizaje y gate de persistencia

## Objetivo

V3.7.3 cierra la brecha entre **ejecutar un piloto local** y **decidir qué arquitectura necesita realmente El Errante**.

V3.7.2 ya permite que un pedido real nazca desde la superficie interna y V3.7.1 reconcilia la cadena de hechos. V3.7.3 no crea otro dashboard ni activa Supabase: registra de forma explícita lo aprendido durante el uso real.

## Evidencia de salida

La revisión clasifica tres dimensiones:

1. **Datos**: para cada dominio se decide si puede permanecer local, necesita persistencia compartida o sigue por decidir.
2. **Permisos**: para cada acción sensible se decide si el control local es suficiente, si requiere identidad/rol real o sigue por decidir.
3. **Uso real**: cada superficie se clasifica como uso diario, ocasional, con fricción, no usada o por decidir.

La nota de aprendizaje documenta qué funcionó, qué sobró y por qué.

## Historia y privacidad

Las revisiones se conservan en `ee_v373_pilot_exit_reviews`.

- son snapshots append-only;
- una revisión posterior usa `supersedes` y no borra la anterior;
- permanecen en el navegador controlado;
- no se suben automáticamente a ningún servicio;
- la exportación genera un JSON local con revisión, reconciliación y decisión, pero no copia los datasets privados del backup V3.7.

## Gate de persistencia

V3.7.3 produce uno de estos estados:

- `PILOT_NOT_CLOSED`: el piloto todavía no terminó;
- `REVIEW_REQUIRED`: terminó, pero falta clasificar el aprendizaje;
- `REVIEW_STALE`: cambiaron las señales reconciliadas después de la revisión;
- `EVIDENCE_GAPS`: la reconciliación V3.7 todavía tiene `BLOCKER` o `REVIEW`;
- `DECISION_PENDING`: la evidencia está completa, pero quedan clasificaciones por decidir;
- `LOCAL_MODEL_SUFFICIENT`: la evidencia indica que todavía no se necesita persistencia compartida ni roles reales;
- `BACKEND_DESIGN_CANDIDATE`: existe evidencia suficiente para diseñar la siguiente arquitectura y al menos un dato necesita persistencia compartida o una acción necesita identidad/rol real.

`BACKEND_DESIGN_CANDIDATE` **no activa Supabase**. Sólo habilita pasar a diseño técnico del gate posterior: Auth, RLS, storage privado, migración, auditoría servidor, concurrencia e idempotencia.

## Regla de decisión

El orden es deliberado:

1. cerrar el piloto;
2. obtener reconciliación `EVIDENCE_COMPLETE`;
3. registrar una revisión vigente;
4. resolver todas las clasificaciones;
5. sólo entonces decidir entre `LOCAL_MODEL_SUFFICIENT` y `BACKEND_DESIGN_CANDIDATE`.

Así se evita activar backend por calendario o por intuición.

## Compatibilidad

- el motor de backup/reconciliación continúa en V3.7.1;
- la captura de pedidos continúa en V3.7.2;
- V3.7.3 añade una capa de salida independiente;
- no modifica pedidos, producción, inventario, compras, cierres, caja ni finanzas;
- no cambia el formato de backup;
- no activa checkout público, Supabase, Auth, RLS ni storage remoto.

## Certificación

La integración exige:

1. `scripts/verificar_piloto_v37.py` = PASS con contratos V3.7.3;
2. `tests/e2e/pilot-exit-v373.spec.js` = PASS en desktop y móvil;
3. piloto cerrado sin revisión = `REVIEW_REQUIRED`;
4. evidencia completa + clasificación explícita = `LOCAL_MODEL_SUFFICIENT` o `BACKEND_DESIGN_CANDIDATE`;
5. brechas V3.7 impiden declarar candidato;
6. revisiones son append-only y trazan `supersedes`;
7. exportación de decisión disponible;
8. Playwright completo desktop/móvil = PASS;
9. auditoría canónica y validación/publicación = PASS;
10. health-check público V3.7.3 = PASS;
11. Graphify actualizado;
12. Supabase permanece inactivo.
