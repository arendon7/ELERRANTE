begin;

-- EL ERRANTE V3.0 — inventario desconocido permanece desconocido.
-- Evita convertir la ausencia de un conteo físico en cero y, por extensión,
-- evita fabricar negativos artificiales al iniciar preparación.

alter table public.product_operations
  alter column inventory drop not null,
  alter column inventory drop default;

create or replace function public.record_inventory_movement_v16(
  p_product_id text,
  p_movement_type text,
  p_quantity numeric,
  p_unit_cost numeric default null,
  p_note text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta numeric;
  v_name text;
  v_inventory numeric;
  v_id bigint;
begin
  if not public.is_admin() then raise exception 'administrative access required'; end if;
  if coalesce(p_quantity,0) <= 0 then raise exception 'quantity must be greater than zero'; end if;
  if p_movement_type not in ('opening','purchase','production','adjustment_in','adjustment_out','waste') then
    raise exception 'unsupported manual movement type';
  end if;

  v_delta := case when p_movement_type in ('adjustment_out','waste') then -abs(p_quantity) else abs(p_quantity) end;

  select product_name, inventory into v_name, v_inventory
  from public.product_operations
  where product_id = p_product_id
  for update;
  if v_name is null then raise exception 'product not found'; end if;

  update public.product_operations
  set inventory = case
        when v_inventory is null and p_movement_type='opening' then abs(p_quantity)
        when v_inventory is null then null
        else v_inventory + v_delta
      end,
      unit_cost = case when coalesce(p_unit_cost,0) > 0 and p_movement_type in ('purchase','production') then p_unit_cost else unit_cost end,
      updated_by = auth.uid()
  where product_id = p_product_id;

  insert into public.inventory_movements(product_id,product_name,movement_type,quantity_delta,unit_cost,note,created_by)
  values(p_product_id,v_name,p_movement_type,v_delta,coalesce(p_unit_cost,0),nullif(trim(p_note),''),auth.uid())
  returning id into v_id;

  perform public.record_admin_event('inventory_movement','product_operations',p_product_id,
    jsonb_build_object('movement_id',v_id,'movement_type',p_movement_type,'quantity_delta',v_delta,'inventory_was_known',v_inventory is not null));
  return v_id;
end;
$$;

revoke all on function public.record_inventory_movement_v16(text,text,numeric,numeric,text) from public, anon;
grant execute on function public.record_inventory_movement_v16(text,text,numeric,numeric,text) to authenticated;

create or replace function public.sync_order_inventory_v16()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_should_commit boolean;
  v_cycle integer;
  item record;
begin
  v_should_commit := new.status in ('preparing','dispatched','delivered');

  if v_should_commit and not coalesce(old.inventory_committed,false) then
    v_cycle := coalesce(old.inventory_cycle,0) + 1;
    for item in
      select coalesce(product_id,variant_id,'unknown') as product_id,
             max(product_name) as product_name,
             sum(quantity) as quantity,
             max(unit_cost_snapshot) as unit_cost,
             max(unit_price) as unit_price
      from public.order_items where order_id = new.id
      group by coalesce(product_id,variant_id,'unknown')
    loop
      insert into public.product_operations(product_id,product_name,sale_price,unit_cost,inventory,active,updated_by)
      values(item.product_id,item.product_name,item.unit_price,item.unit_cost,null,true,auth.uid())
      on conflict (product_id) do update
        set inventory = case when public.product_operations.inventory is null then null else public.product_operations.inventory - item.quantity end,
            updated_by = auth.uid();

      insert into public.inventory_movements(product_id,product_name,order_id,inventory_cycle,movement_type,quantity_delta,unit_cost,note,created_by)
      values(item.product_id,item.product_name,new.id,v_cycle,'sale',-item.quantity,item.unit_cost,'Salida automática al iniciar preparación',auth.uid())
      on conflict do nothing;
    end loop;
    new.inventory_committed := true;
    new.inventory_cycle := v_cycle;
  elsif not v_should_commit and coalesce(old.inventory_committed,false) then
    v_cycle := coalesce(old.inventory_cycle,0);
    for item in
      select coalesce(product_id,variant_id,'unknown') as product_id,
             max(product_name) as product_name,
             sum(quantity) as quantity,
             max(unit_cost_snapshot) as unit_cost,
             max(unit_price) as unit_price
      from public.order_items where order_id = new.id
      group by coalesce(product_id,variant_id,'unknown')
    loop
      insert into public.product_operations(product_id,product_name,sale_price,unit_cost,inventory,active,updated_by)
      values(item.product_id,item.product_name,item.unit_price,item.unit_cost,null,true,auth.uid())
      on conflict (product_id) do update
        set inventory = case when public.product_operations.inventory is null then null else public.product_operations.inventory + item.quantity end,
            updated_by = auth.uid();

      insert into public.inventory_movements(product_id,product_name,order_id,inventory_cycle,movement_type,quantity_delta,unit_cost,note,created_by)
      values(item.product_id,item.product_name,new.id,v_cycle,'return',item.quantity,item.unit_cost,'Reintegro automático por cambio de estado',auth.uid())
      on conflict do nothing;
    end loop;
    new.inventory_committed := false;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_order_inventory_v16() from public, anon;

insert into public.app_migrations(version,label)
values('3.0','Inventario de producto nullable: desconocido no equivale a cero')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
