-- EL ERRANTE V1.6 — kardex, inventario y resultado operativo
-- Ejecutar DESPUÉS de schema-v14.sql y schema-v15.sql.

alter table public.orders
  add column if not exists inventory_committed boolean not null default false,
  add column if not exists inventory_cycle integer not null default 0;

alter table public.product_operations
  add column if not exists low_stock_threshold numeric(14,2) not null default 5;

create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id text not null,
  product_name text not null,
  order_id text references public.orders(id) on delete set null,
  inventory_cycle integer not null default 0,
  movement_type text not null check (movement_type in ('opening','purchase','production','sale','return','adjustment_in','adjustment_out','waste')),
  quantity_delta numeric(14,2) not null check (quantity_delta <> 0),
  unit_cost numeric(14,2) not null default 0,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.inventory_movements enable row level security;

create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
create index if not exists idx_inventory_movements_product on public.inventory_movements(product_id,created_at desc);
create index if not exists idx_inventory_movements_order on public.inventory_movements(order_id);
create unique index if not exists idx_inventory_order_cycle
  on public.inventory_movements(order_id,product_id,movement_type,inventory_cycle)
  where order_id is not null and movement_type in ('sale','return');

drop policy if exists "admins read inventory movements" on public.inventory_movements;
create policy "admins read inventory movements"
on public.inventory_movements for select to authenticated
using (public.is_admin());

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
  v_id bigint;
begin
  if not public.is_admin() then
    raise exception 'administrative access required';
  end if;
  if coalesce(p_quantity,0) <= 0 then
    raise exception 'quantity must be greater than zero';
  end if;
  if p_movement_type not in ('opening','purchase','production','adjustment_in','adjustment_out','waste') then
    raise exception 'unsupported manual movement type';
  end if;

  v_delta := case when p_movement_type in ('adjustment_out','waste') then -abs(p_quantity) else abs(p_quantity) end;

  select product_name into v_name
  from public.product_operations
  where product_id = p_product_id;
  if v_name is null then
    raise exception 'product not found';
  end if;

  update public.product_operations
  set inventory = inventory + v_delta,
      unit_cost = case when coalesce(p_unit_cost,0) > 0 and p_movement_type in ('purchase','production') then p_unit_cost else unit_cost end,
      updated_by = auth.uid()
  where product_id = p_product_id;

  insert into public.inventory_movements(product_id,product_name,movement_type,quantity_delta,unit_cost,note,created_by)
  values(p_product_id,v_name,p_movement_type,v_delta,coalesce(p_unit_cost,0),nullif(trim(p_note),''),auth.uid())
  returning id into v_id;

  perform public.record_admin_event('inventory_movement','product_operations',p_product_id,
    jsonb_build_object('movement_id',v_id,'movement_type',p_movement_type,'quantity_delta',v_delta));
  return v_id;
end;
$$;

revoke all on function public.record_inventory_movement_v16(text,text,numeric,numeric,text) from public;
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
      values(item.product_id,item.product_name,item.unit_price,item.unit_cost,-item.quantity,true,auth.uid())
      on conflict (product_id) do update
        set inventory = public.product_operations.inventory - item.quantity,
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
      values(item.product_id,item.product_name,item.unit_price,item.unit_cost,item.quantity,true,auth.uid())
      on conflict (product_id) do update
        set inventory = public.product_operations.inventory + item.quantity,
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

drop trigger if exists trg_orders_inventory_v16 on public.orders;
create trigger trg_orders_inventory_v16
before update of status on public.orders
for each row execute function public.sync_order_inventory_v16();
