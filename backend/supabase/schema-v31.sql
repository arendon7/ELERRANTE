begin;

-- EL ERRANTE V3.1 — maestros de materiales canónicos, sin inventario físico.
-- Fuente: assets/materials-data-v23.js / Transferencia Financiera y Operativa v1.0 · agosto 2026.
-- Los costos aquí son PROVISIONALES y conservan explícitamente su estado/confianza.
-- Esta migración NO inserta ni modifica material_inventory.

insert into public.material_master(
  id,name,unit,provisional_unit_cost,data_status,confidence,source_note,active
)
values
  ('MP-HFS','Harina Flor Suprema','g',2.8,'CONFIRMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-HHO','Harina Haz de Oro','g',2.96,'ESTIMADO','Baja-media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-AGU','Agua','g',0,'INFERIDO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-LEV','Levadura','g',80,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-SAL','Sal','g',2.51,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-ACE','Aceite de oliva','ml',40,'ESTIMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-POM90','Pomodoro porción grande','porción',1500,'ESTIMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-POM70','Pomodoro porción pequeña','porción',1200,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-MOZ','Mozzarella','g',28,'ESTIMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-PAR','Parmesano','g',66,'ESTIMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-SALAME','Salame picante','g',130,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-CHAMP','Champiñón fresco','g',40,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-GOU','Gouda semimadurado','g',75,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-AZU','Queso azul','g',130,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-CHO','Chorizo artesanal','g',70,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-MIE','Miel','g',50,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-CEB','Cebolla caramelizada terminada','g',17.78,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-AJO','Ajo confitado','g',18,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-BAL','Acabado balsámico','ml',26,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-PYM','Reducción panela-maracuyá','ml',28,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('MP-ALB','Albahaca','unidad',50,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-VAC1','Bolsa individual al vacío','unidad',800,'CONFIRMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-VAC2','Bolsa paquete x2','unidad',1000,'CONFIRMADO','Media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-ETQ','Etiqueta','unidad',250,'ESTIMADO','Baja-media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-DYP1','Doypack 1 kg','unidad',1200,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-DYP25','Doypack 2,5 kg','unidad',1700,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-BOL5','Bolsa reforzada 5 kg','unidad',2500,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-FRA500','Frasco, tapa, etiqueta y sello 500 g','unidad',3400,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-BOT250','Botella 250 ml','unidad',700,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('EMP-COMBO','Empaque exterior combo','unidad',2000,'ESTIMADO','Baja','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true),
  ('CIF-GAS','Gas de horneo','unidad',100,'ESTIMADO','Baja-media','Canon V2.3 · Transferencia Financiera y Operativa v1.0 · agosto 2026',true)
on conflict(id) do nothing;

do $$
declare
  v_ids text[] := array[
    'MP-HFS','MP-HHO','MP-AGU','MP-LEV','MP-SAL','MP-ACE','MP-POM90','MP-POM70',
    'MP-MOZ','MP-PAR','MP-SALAME','MP-CHAMP','MP-GOU','MP-AZU','MP-CHO','MP-MIE',
    'MP-CEB','MP-AJO','MP-BAL','MP-PYM','MP-ALB','EMP-VAC1','EMP-VAC2','EMP-ETQ',
    'EMP-DYP1','EMP-DYP25','EMP-BOL5','EMP-FRA500','EMP-BOT250','EMP-COMBO','CIF-GAS'
  ];
  v_count integer;
begin
  select count(*) into v_count
  from public.material_master
  where id = any(v_ids);
  if v_count <> array_length(v_ids,1) then
    raise exception 'V3.1 incompleta: se esperaban 31 maestros canónicos y existen %',v_count;
  end if;
end;
$$;

insert into public.app_migrations(version,label)
values('3.1','Maestros canónicos de materiales sin inventario físico')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
