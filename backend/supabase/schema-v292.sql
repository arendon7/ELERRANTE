begin;

-- EL ERRANTE V2.9.2 — reconciliación guardada de gastos fijos del piloto.
-- Sólo reemplaza el seed legacy de V1.4 cuando el mes actual coincide EXACTAMENTE
-- con las cuatro filas demostrativas por COP 6.000.000. Nunca sobreescribe una
-- estructura real o parcialmente editada.

do $$
declare
  v_month text := to_char(current_date,'YYYY-MM');
  v_next_month text := to_char((date_trunc('month',current_date)+interval '1 month')::date,'YYYY-MM');
  v_rows integer;
  v_signature integer;
begin
  select count(*) into v_rows
  from public.fixed_costs
  where month=v_month;

  select count(*) into v_signature
  from public.fixed_costs
  where month=v_month
    and (
      (cost_key='trabajador' and amount=2000000)
      or (cost_key='sede' and amount=2500000)
      or (cost_key='servicios' and amount=750000)
      or (cost_key='otros' and amount=750000)
    );

  if v_rows=4 and v_signature=4 then
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

    -- El piloto de 30 días cruza potencialmente al mes siguiente. Sólo prepara
    -- el mismo baseline provisional si ese mes aún no tiene datos propios.
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
  end if;
end $$;

insert into public.app_migrations(version,label)
values('2.9.2','Reconciliación guardada de seed financiero legacy al baseline provisional del piloto')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
