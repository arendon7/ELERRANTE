begin;

create table if not exists public.material_purchase_orders_v25 (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  material_id text not null references public.material_master(id),
  supplier_id uuid references public.material_suppliers(id),
  supplier_name_snapshot text,
  status text not null default 'draft' check (status in ('draft','approved','ordered','partial','received','cancelled')),
  requested_quantity numeric(14,4) not null check (requested_quantity > 0),
  received_quantity numeric(14,4) not null default 0 check (received_quantity >= 0 and received_quantity <= requested_quantity),
  unit_cost_snapshot numeric(14,4) not null default 0 check (unit_cost_snapshot >= 0),
  expected_date date,
  external_reference text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  ordered_at timestamptz,
  ordered_by uuid references auth.users(id),
  closed_at timestamptz,
  closed_by uuid references auth.users(id)
);

create index if not exists material_purchase_orders_v25_status_idx
  on public.material_purchase_orders_v25(status, expected_date);
create index if not exists material_purchase_orders_v25_material_idx
  on public.material_purchase_orders_v25(material_id, status);

create table if not exists public.material_purchase_receipts_v25 (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.material_purchase_orders_v25(id),
  received_date date not null,
  quantity numeric(14,4) not null check (quantity > 0),
  total_cost numeric(14,2) not null check (total_cost >= 0),
  unit_cost numeric(14,4) generated always as (case when quantity > 0 then total_cost / quantity else 0 end) stored,
  invoice_reference text not null,
  inventory_updated boolean not null default false,
  material_purchase_id uuid not null references public.material_purchases(id),
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique(purchase_order_id, invoice_reference)
);

alter table public.material_purchase_orders_v25 enable row level security;
alter table public.material_purchase_receipts_v25 enable row level security;

drop policy if exists "admins manage purchase orders v25" on public.material_purchase_orders_v25;
create policy "admins manage purchase orders v25"
on public.material_purchase_orders_v25 for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage purchase receipts v25" on public.material_purchase_receipts_v25;
create policy "admins manage purchase receipts v25"
on public.material_purchase_receipts_v25 for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_material_purchase_orders_v25_updated_at on public.material_purchase_orders_v25;
create trigger trg_material_purchase_orders_v25_updated_at
before update on public.material_purchase_orders_v25
for each row execute function public.set_updated_at();

create or replace function public.save_material_purchase_order_v25(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_existing_status text;
  v_supplier_name text;
  v_supplier_id uuid;
  v_code text;
begin
  if not public.is_admin() then raise exception 'Acceso administrativo requerido'; end if;
  if coalesce(trim(p_payload->>'material_id'),'') = '' then raise exception 'material_id es obligatorio'; end if;
  if coalesce((p_payload->>'requested_quantity')::numeric,0) <= 0 then raise exception 'requested_quantity debe ser mayor que cero'; end if;

  v_supplier_name := nullif(trim(coalesce(p_payload->>'supplier_name','')),'');
  if v_supplier_name is not null then
    insert into public.material_suppliers(name,created_by)
    values(v_supplier_name,auth.uid())
    on conflict (lower(name)) do update set active=true
    returning id into v_supplier_id;
  end if;

  if nullif(p_payload->>'id','') is not null then
    v_id := (p_payload->>'id')::uuid;
    select status into v_existing_status
    from public.material_purchase_orders_v25
    where id=v_id for update;
    if v_existing_status is null then raise exception 'Orden no encontrada'; end if;
    if v_existing_status <> 'draft' then raise exception 'Solo los borradores pueden editarse'; end if;

    update public.material_purchase_orders_v25 set
      material_id=p_payload->>'material_id',
      supplier_id=v_supplier_id,
      supplier_name_snapshot=v_supplier_name,
      requested_quantity=(p_payload->>'requested_quantity')::numeric,
      unit_cost_snapshot=greatest(0,coalesce((p_payload->>'unit_cost_snapshot')::numeric,0)),
      expected_date=nullif(p_payload->>'expected_date','')::date,
      external_reference=nullif(trim(coalesce(p_payload->>'external_reference','')),''),
      note=nullif(trim(coalesce(p_payload->>'note','')),''),
      updated_by=auth.uid()
    where id=v_id;
  else
    v_code := 'OC-' || to_char(current_date,'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
    insert into public.material_purchase_orders_v25(
      order_code,material_id,supplier_id,supplier_name_snapshot,status,
      requested_quantity,unit_cost_snapshot,expected_date,external_reference,note,
      created_by,updated_by
    ) values (
      v_code,p_payload->>'material_id',v_supplier_id,v_supplier_name,'draft',
      (p_payload->>'requested_quantity')::numeric,
      greatest(0,coalesce((p_payload->>'unit_cost_snapshot')::numeric,0)),
      nullif(p_payload->>'expected_date','')::date,
      nullif(trim(coalesce(p_payload->>'external_reference','')),''),
      nullif(trim(coalesce(p_payload->>'note','')),''),
      auth.uid(),auth.uid()
    ) returning id into v_id;
  end if;

  perform public.record_admin_event(
    case when nullif(p_payload->>'id','') is null then 'material_purchase_order_drafted' else 'material_purchase_order_updated' end,
    'material_purchase_order_v25',v_id::text,
    jsonb_build_object('material_id',p_payload->>'material_id','requested_quantity',p_payload->>'requested_quantity')
  );
  return v_id;
end;
$$;

create or replace function public.transition_material_purchase_order_v25(
  p_order_id uuid,
  p_new_status text,
  p_note text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.material_purchase_orders_v25%rowtype;
begin
  if not public.is_admin() then raise exception 'Acceso administrativo requerido'; end if;
  select * into v_order from public.material_purchase_orders_v25 where id=p_order_id for update;
  if not found then raise exception 'Orden no encontrada'; end if;

  if p_new_status='approved' then
    if v_order.status<>'draft' then raise exception 'Solo un borrador puede aprobarse'; end if;
    if coalesce(trim(v_order.supplier_name_snapshot),'')='' then raise exception 'Define proveedor antes de aprobar'; end if;
    update public.material_purchase_orders_v25 set
      status='approved',approved_at=now(),approved_by=auth.uid(),updated_by=auth.uid(),
      note=coalesce(nullif(trim(p_note),''),note)
    where id=p_order_id;
  elsif p_new_status='ordered' then
    if v_order.status<>'approved' then raise exception 'Solo una orden aprobada puede emitirse'; end if;
    if v_order.unit_cost_snapshot<=0 then raise exception 'Define costo unitario acordado antes de emitir'; end if;
    if coalesce(trim(v_order.external_reference),'')='' then raise exception 'Registra cotización, correo o referencia externa antes de emitir'; end if;
    update public.material_purchase_orders_v25 set
      status='ordered',ordered_at=now(),ordered_by=auth.uid(),updated_by=auth.uid(),
      note=coalesce(nullif(trim(p_note),''),note)
    where id=p_order_id;
  elsif p_new_status='cancelled' then
    if v_order.status not in ('draft','approved','ordered','partial') then raise exception 'La orden ya está cerrada'; end if;
    update public.material_purchase_orders_v25 set
      status='cancelled',closed_at=now(),closed_by=auth.uid(),updated_by=auth.uid(),
      note=coalesce(nullif(trim(p_note),''),note)
    where id=p_order_id;
  else
    raise exception 'Transición no permitida';
  end if;

  perform public.record_admin_event(
    'material_purchase_order_status_changed','material_purchase_order_v25',p_order_id::text,
    jsonb_build_object('from',v_order.status,'to',p_new_status)
  );
  return p_new_status;
end;
$$;

create or replace function public.receive_material_purchase_order_v25(
  p_order_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.material_purchase_orders_v25%rowtype;
  v_quantity numeric(14,4);
  v_total_cost numeric(14,2);
  v_invoice text;
  v_received numeric(14,4);
  v_new_status text;
  v_purchase_id uuid;
  v_receipt_id uuid;
  v_inventory_updated boolean := false;
begin
  if not public.is_admin() then raise exception 'Acceso administrativo requerido'; end if;
  select * into v_order from public.material_purchase_orders_v25 where id=p_order_id for update;
  if not found then raise exception 'Orden no encontrada'; end if;
  if v_order.status not in ('ordered','partial') then raise exception 'Solo una orden emitida o parcial puede recibirse'; end if;

  v_quantity := coalesce((p_payload->>'quantity')::numeric,0);
  v_total_cost := coalesce((p_payload->>'total_cost')::numeric,0);
  v_invoice := trim(coalesce(p_payload->>'invoice_reference',''));
  if v_quantity<=0 then raise exception 'quantity debe ser mayor que cero'; end if;
  if v_quantity > (v_order.requested_quantity-v_order.received_quantity) then raise exception 'La recepción supera el saldo pendiente'; end if;
  if v_total_cost<0 then raise exception 'total_cost no puede ser negativo'; end if;
  if v_invoice='' then raise exception 'invoice_reference es obligatorio'; end if;

  insert into public.material_purchases(
    material_id,supplier_id,supplier_name_snapshot,invoice_reference,received_date,
    quantity,total_cost,note,created_by
  ) values (
    v_order.material_id,v_order.supplier_id,v_order.supplier_name_snapshot,v_invoice,
    coalesce(nullif(p_payload->>'received_date','')::date,current_date),
    v_quantity,v_total_cost,nullif(trim(coalesce(p_payload->>'note','')),''),auth.uid()
  ) returning id into v_purchase_id;

  if coalesce((p_payload->>'update_inventory')::boolean,false) then
    update public.material_inventory set
      quantity=quantity+v_quantity,
      counted_at=now(),
      note=concat_ws(' · ',nullif(note,''),'Recepción '||v_invoice||' contra '||v_order.order_code),
      updated_by=auth.uid()
    where material_id=v_order.material_id;
    v_inventory_updated := found;
  end if;

  insert into public.material_purchase_receipts_v25(
    purchase_order_id,received_date,quantity,total_cost,invoice_reference,
    inventory_updated,material_purchase_id,note,created_by
  ) values (
    p_order_id,coalesce(nullif(p_payload->>'received_date','')::date,current_date),
    v_quantity,v_total_cost,v_invoice,v_inventory_updated,v_purchase_id,
    nullif(trim(coalesce(p_payload->>'note','')),''),auth.uid()
  ) returning id into v_receipt_id;

  v_received := v_order.received_quantity+v_quantity;
  v_new_status := case when v_received>=v_order.requested_quantity then 'received' else 'partial' end;
  update public.material_purchase_orders_v25 set
    received_quantity=v_received,status=v_new_status,updated_by=auth.uid(),
    closed_at=case when v_new_status='received' then now() else closed_at end,
    closed_by=case when v_new_status='received' then auth.uid() else closed_by end
  where id=p_order_id;

  perform public.record_admin_event(
    'material_purchase_order_received','material_purchase_order_v25',p_order_id::text,
    jsonb_build_object('receipt_id',v_receipt_id,'material_purchase_id',v_purchase_id,'quantity',v_quantity,'inventory_updated',v_inventory_updated,'status',v_new_status)
  );

  return jsonb_build_object(
    'purchase_order_id',p_order_id,'receipt_id',v_receipt_id,'material_purchase_id',v_purchase_id,
    'inventory_updated',v_inventory_updated,'order_status',v_new_status,'received_quantity',v_received
  );
end;
$$;

revoke all on function public.save_material_purchase_order_v25(jsonb) from public, anon;
revoke all on function public.transition_material_purchase_order_v25(uuid,text,text) from public, anon;
revoke all on function public.receive_material_purchase_order_v25(uuid,jsonb) from public, anon;
grant execute on function public.save_material_purchase_order_v25(jsonb) to authenticated;
grant execute on function public.transition_material_purchase_order_v25(uuid,text,text) to authenticated;
grant execute on function public.receive_material_purchase_order_v25(uuid,jsonb) to authenticated;

insert into public.schema_migrations(version,description)
values('2.5','Órdenes de compra, autorización, recepción y reconciliación de inventario')
on conflict(version) do nothing;

commit;
