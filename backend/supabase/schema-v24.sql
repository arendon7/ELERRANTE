begin;

create table if not exists public.production_measurements (
  id uuid primary key default gen_random_uuid(),
  production_date date not null,
  batch_code text not null,
  reference_kind text not null check (reference_kind in ('recipe','product')),
  reference_id text not null,
  expected_quantity numeric(14,4) not null check (expected_quantity > 0),
  actual_quantity numeric(14,4) not null check (actual_quantity >= 0),
  waste_quantity numeric(14,4) not null default 0 check (waste_quantity >= 0),
  unit text not null,
  note text,
  data_status text not null default 'MEDIDO',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique(batch_code)
);

create table if not exists public.material_suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create unique index if not exists material_suppliers_name_lower_uidx on public.material_suppliers(lower(name));

create table if not exists public.material_purchases (
  id uuid primary key default gen_random_uuid(),
  material_id text not null references public.material_master(id),
  supplier_id uuid references public.material_suppliers(id),
  supplier_name_snapshot text not null,
  invoice_reference text,
  received_date date not null,
  quantity numeric(14,4) not null check (quantity > 0),
  total_cost numeric(14,2) not null check (total_cost >= 0),
  unit_cost numeric(14,4) generated always as (case when quantity > 0 then total_cost / quantity else 0 end) stored,
  note text,
  data_status text not null default 'OBSERVADO',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table public.production_measurements enable row level security;
alter table public.material_suppliers enable row level security;
alter table public.material_purchases enable row level security;

drop policy if exists "admins manage production measurements" on public.production_measurements;
create policy "admins manage production measurements" on public.production_measurements for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage material suppliers" on public.material_suppliers;
create policy "admins manage material suppliers" on public.material_suppliers for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage material purchases" on public.material_purchases;
create policy "admins manage material purchases" on public.material_purchases for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.save_production_measurement_v24(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'Acceso administrativo requerido'; end if;
  insert into public.production_measurements(
    production_date,batch_code,reference_kind,reference_id,expected_quantity,
    actual_quantity,waste_quantity,unit,note,created_by
  ) values (
    (p_payload->>'production_date')::date,
    trim(p_payload->>'batch_code'),
    p_payload->>'reference_kind',
    p_payload->>'reference_id',
    (p_payload->>'expected_quantity')::numeric,
    (p_payload->>'actual_quantity')::numeric,
    coalesce((p_payload->>'waste_quantity')::numeric,0),
    p_payload->>'unit',
    nullif(trim(coalesce(p_payload->>'note','')),''),
    auth.uid()
  ) returning id into v_id;
  insert into public.admin_audit_log(actor_id,action,entity_type,entity_id,detail)
  values(auth.uid(),'production_measurement_created','production_measurement',v_id::text,p_payload);
  return v_id;
end;
$$;

create or replace function public.save_material_purchase_v24(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supplier_id uuid;
  v_purchase_id uuid;
  v_supplier text;
begin
  if not public.is_admin() then raise exception 'Acceso administrativo requerido'; end if;
  v_supplier := trim(p_payload->>'supplier_name');
  if v_supplier = '' then raise exception 'supplier_name es obligatorio'; end if;
  insert into public.material_suppliers(name,created_by)
  values(v_supplier,auth.uid())
  on conflict(lower(name)) do update set active=true
  returning id into v_supplier_id;
  insert into public.material_purchases(
    material_id,supplier_id,supplier_name_snapshot,invoice_reference,received_date,
    quantity,total_cost,note,created_by
  ) values (
    p_payload->>'material_id',v_supplier_id,v_supplier,
    nullif(trim(coalesce(p_payload->>'invoice_reference','')),''),
    (p_payload->>'received_date')::date,
    (p_payload->>'quantity')::numeric,
    (p_payload->>'total_cost')::numeric,
    nullif(trim(coalesce(p_payload->>'note','')),''),
    auth.uid()
  ) returning id into v_purchase_id;
  insert into public.admin_audit_log(actor_id,action,entity_type,entity_id,detail)
  values(auth.uid(),'material_purchase_created','material_purchase',v_purchase_id::text,p_payload - 'note');
  return v_purchase_id;
end;
$$;

revoke all on function public.save_production_measurement_v24(jsonb) from public, anon;
revoke all on function public.save_material_purchase_v24(jsonb) from public, anon;
grant execute on function public.save_production_measurement_v24(jsonb) to authenticated;
grant execute on function public.save_material_purchase_v24(jsonb) to authenticated;

insert into public.schema_migrations(version,description)
values('2.4','Medición de lotes, proveedores y compras observadas')
on conflict(version) do nothing;

commit;
