begin;

-- EL ERRANTE V2.9.2 — reconciliación guardada de gastos fijos del piloto.
-- Sólo acepta dos estados conocidos para el mes actual:
-- A) seed legacy V1.4 exacto: 4 filas / COP 6.000.000;
-- B) baseline piloto exacto: 6 filas / COP 370.000.
-- Cualquier tercer estado aborta toda la migración para no pisar datos reales.

do $$
declare
  v_month text := to_char(current_date,'YYYY-MM');
  v_next_month text := to_char((date_trunc('month',current_date)+interval '1 month')::date,'YYYY-MM');
  v_rows integer;
  v_legacy_signature integer;
  v_pilot_signature integer;
begin
  select count(*) into v_rows
  from public.fixed_costs
  where month=v_month;

  select count(*) into v_legacy_signature
  from public.fixed_costs
  where month=v_month
    and (
      (cost_key='trabajador' and label='Trabajador' and amount=2000000)
      or (cost_key='sede' and label='Sede y ocupación' and amount=2500000)
      or (cost_key='servicios' and label='Servicios, conectividad y operación' and amount=750000)
      or (cost_key='otros' and label='Otros gastos fijos' and amount=750000)
    );

  select count(*) into v_pilot_signature
  from public.fixed_costs
  where month=v_month
    and (
      (cost_key='servicios' and label='Servicios e internet' and amount=90000)
      or (cost_key='aseo' and label='Aseo y consumibles' and amount=50000)
      or (cost_key='contabilidad' and label='Contabilidad y software' and amount=70000)
      or (cost_key='mercadeo' and label='Mercadeo' and amount=80000)
      or (cost_key='mantenimiento' and label='Mantenimiento' and amount=40000)
      or (cost_key='sanitario' and label='Sanitario, etiquetas y registros' and amount=40000)
    );

  if v_rows=4 and v_legacy_signature=4 then
    delete from public.fixed_costs where month=v_month;

    insert into public.fixed_costs(month,cost_key,label,amount)
    values
      (v_month,'servicios','Servicios e internet',90000),
      (v_month,'aseo','Aseo y consumibles',50000),
      (v_month,'contabilidad','Contabilidad y software',70000),
      (v_month,'mercadeo','Mercadeo',80000),
      (v_month,'mantenimiento','Mantenimiento',40000),
      (v_month,'sanitario','Sanitario, etiquetas y registros',40000)
    on conflict(month,cost_key) do update set
      label=excluded.label,amount=excluded.amount,updated_at=now();
  elsif v_rows=6 and v_pilot_signature=6 then
    -- Idempotencia explícita: el mes actual ya fue reconciliado exactamente.
    null;
  else
    raise exception 'V2.9.2 rechazada: fixed_costs de % no coincide con seed legacy ni baseline piloto (% filas, legacy %, piloto %)',
      v_month,v_rows,v_legacy_signature,v_pilot_signature;
  end if;

  -- El piloto de 30 días cruza potencialmente al mes siguiente. Sólo prepara
  -- el baseline provisional cuando el mes siguiente está completamente vacío.
  if not exists(select 1 from public.fixed_costs where month=v_next_month) then
    insert into public.fixed_costs(month,cost_key,label,amount)
    values
      (v_next_month,'servicios','Servicios e internet',90000),
      (v_next_month,'aseo','Aseo y consumibles',50000),
      (v_next_month,'contabilidad','Contabilidad y software',70000),
      (v_next_month,'mercadeo','Mercadeo',80000),
      (v_next_month,'mantenimiento','Mantenimiento',40000),
      (v_next_month,'sanitario','Sanitario, etiquetas y registros',40000)
    on conflict(month,cost_key) do nothing;
  end if;
end $$;

insert into public.app_migrations(version,label)
values('2.9.2','Reconciliación fail-closed de seed financiero legacy al baseline provisional del piloto')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
