-- EL ERRANTE V2.2 — producción, alistamiento y despacho seguro
-- Ejecutar DESPUÉS de schema-v21.sql.

create table if not exists public.order_fulfillment (
  order_id text primary key references public.orders(id) on delete cascade,
  product_ready boolean not null default false,
  packaging_ready boolean not null default false,
  quantity_checked boolean not null default false,
  delivery_coordinated boolean not null default false,
  note text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.order_fulfillment enable row level security;

create index if not exists idx_order_fulfillment_updated_at
  on public.order_fulfillment(updated_at desc);

drop policy if exists "admins read order fulfillment" on public.order_fulfillment;
create policy "admins read order fulfillment"
on public.order_fulfillment for select to authenticated
using (public.is_admin());

drop policy if exists "admins insert order fulfillment" on public.order_fulfillment;
create policy "admins insert order fulfillment"
on public.order_fulfillment for insert to authenticated
with check (public.is_admin());

drop policy if exists "admins update order fulfillment" on public.order_fulfillment;
create policy "admins update order fulfillment"
on public.order_fulfillment for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.save_order_fulfillment_v22(
  p_order_id text,
  p_product_ready boolean,
  p_packaging_ready boolean,
  p_quantity_checked boolean,
  p_delivery_coordinated boolean,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.order_fulfillment;
begin
  if not public.is_admin() then
    raise exception 'administrative access required';
  end if;

  if not exists(select 1 from public.orders where id=p_order_id) then
    raise exception 'order not found';
  end if;

  insert into public.order_fulfillment(
    order_id,product_ready,packaging_ready,quantity_checked,delivery_coordinated,note,updated_by,updated_at
  )
  values(
    p_order_id,coalesce(p_product_ready,false),coalesce(p_packaging_ready,false),coalesce(p_quantity_checked,false),coalesce(p_delivery_coordinated,false),nullif(trim(p_note),''),auth.uid(),now()
  )
  on conflict (order_id) do update
  set product_ready=excluded.product_ready,
      packaging_ready=excluded.packaging_ready,
      quantity_checked=excluded.quantity_checked,
      delivery_coordinated=excluded.delivery_coordinated,
      note=excluded.note,
      updated_by=auth.uid(),
      updated_at=now()
  returning * into v_result;

  perform public.record_admin_event(
    'save_order_fulfillment_v22',
    'order_fulfillment',
    p_order_id,
    jsonb_build_object(
      'product_ready',v_result.product_ready,
      'packaging_ready',v_result.packaging_ready,
      'quantity_checked',v_result.quantity_checked,
      'delivery_coordinated',v_result.delivery_coordinated
    )
  );

  return to_jsonb(v_result);
end;
$$;

revoke all on function public.save_order_fulfillment_v22(text,boolean,boolean,boolean,boolean,text) from public;
grant execute on function public.save_order_fulfillment_v22(text,boolean,boolean,boolean,boolean,text) to authenticated;

create or replace function public.transition_order_v22(
  p_order_id text,
  p_new_status text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_has_receipt boolean;
  v_allowed boolean := false;
  v_fulfillment_ready boolean := false;
begin
  if not public.is_admin() then
    raise exception 'administrative access required';
  end if;

  select status into v_current
  from public.orders
  where id = p_order_id
  for update;

  if v_current is null then
    raise exception 'order not found';
  end if;

  v_allowed := case v_current
    when 'pending_payment' then p_new_status in ('payment_review','cancelled')
    when 'payment_review' then p_new_status in ('approved','rejected','cancelled')
    when 'rejected' then p_new_status in ('payment_review','cancelled')
    when 'approved' then p_new_status in ('preparing','cancelled')
    when 'preparing' then p_new_status in ('dispatched','approved','cancelled')
    when 'dispatched' then p_new_status in ('delivered','preparing')
    when 'delivered' then p_new_status in ('dispatched')
    when 'cancelled' then p_new_status in ('pending_payment')
    else false
  end;

  if not v_allowed then
    raise exception 'transition from % to % is not allowed', v_current, p_new_status;
  end if;

  if p_new_status = 'approved' then
    select exists(
      select 1 from public.payment_receipts
      where order_id = p_order_id and storage_path is not null
    ) into v_has_receipt;
    if not v_has_receipt then
      raise exception 'payment receipt required before approval';
    end if;
  end if;

  if p_new_status = 'dispatched' then
    select coalesce(product_ready,false)
       and coalesce(packaging_ready,false)
       and coalesce(quantity_checked,false)
       and coalesce(delivery_coordinated,false)
    into v_fulfillment_ready
    from public.order_fulfillment
    where order_id=p_order_id;

    if not coalesce(v_fulfillment_ready,false) then
      raise exception 'fulfillment checklist required before dispatch';
    end if;
  end if;

  update public.orders
  set status = p_new_status,
      updated_at = now()
  where id = p_order_id;

  if p_new_status = 'approved' then
    update public.payment_receipts
    set status='approved',reviewed_by=auth.uid(),reviewed_at=now(),notes=coalesce(nullif(trim(p_note),''),notes)
    where order_id=p_order_id;
  elsif p_new_status = 'rejected' then
    update public.payment_receipts
    set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),notes=coalesce(nullif(trim(p_note),''),notes)
    where order_id=p_order_id;
  elsif p_new_status = 'payment_review' then
    update public.payment_receipts
    set status='pending',reviewed_by=null,reviewed_at=null,notes=coalesce(nullif(trim(p_note),''),notes)
    where order_id=p_order_id;
  end if;

  perform public.record_admin_event(
    'order_transition_v22',
    'orders',
    p_order_id,
    jsonb_build_object('from',v_current,'to',p_new_status,'note',nullif(trim(p_note),''))
  );

  return jsonb_build_object('order_id',p_order_id,'previous_status',v_current,'status',p_new_status,'updated_at',now());
end;
$$;

revoke all on function public.transition_order_v22(text,text,text) from public;
grant execute on function public.transition_order_v22(text,text,text) to authenticated;

-- Compatibilidad: la mesa V2.1 conserva su llamada, pero ahora hereda la barrera V2.2.
create or replace function public.transition_order_v21(
  p_order_id text,
  p_new_status text,
  p_note text default null
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.transition_order_v22(p_order_id,p_new_status,p_note);
$$;

revoke all on function public.transition_order_v21(text,text,text) from public;
grant execute on function public.transition_order_v21(text,text,text) to authenticated;

insert into public.app_migrations(version,label)
values ('2.2','Agenda de producción, alistamiento y despacho seguro')
on conflict (version) do update set label=excluded.label,applied_at=now();

create or replace function public.activation_health_v20()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  payment jsonb := coalesce((select value from public.public_settings where key='payment'),'{}'::jsonb);
  ordering jsonb := coalesce((select value from public.public_settings where key='ordering'),'{}'::jsonb);
  fixed_total numeric := coalesce((select sum(amount) from public.fixed_costs where month=to_char(current_date,'YYYY-MM')),0);
begin
  if not public.is_admin() then
    raise exception 'Acceso administrativo requerido';
  end if;
  return jsonb_build_object(
    'schema_version','2.2',
    'migrations',(select coalesce(jsonb_agg(version order by version),'[]'::jsonb) from public.app_migrations),
    'admin_count',(select count(*) from public.admin_users where active=true),
    'payment_configured',coalesce(nullif(payment->>'accountNumber',''),nullif(payment->>'key','')) is not null,
    'support_configured',coalesce(nullif(ordering->>'supportWhatsapp',''),nullif(ordering->>'supportEmail','')) is not null,
    'coverage_configured',coalesce(nullif(ordering->>'coverageDetails',''),nullif(ordering->>'deliveryPolicy','')) is not null,
    'catalog_rows',(select count(*) from public.product_operations),
    'catalog_ready',(select count(*)>0 and bool_and(sale_price>0 and unit_cost>=0) from public.product_operations where active=true),
    'fixed_costs_total',fixed_total,
    'fixed_costs_ready',fixed_total>0,
    'receipt_bucket_private',coalesce((select public=false from storage.buckets where id='payment-receipts'),false),
    'orders_count',(select count(*) from public.orders),
    'fulfillment_table_ready',to_regclass('public.order_fulfillment') is not null,
    'fulfillment_rows',(select count(*) from public.order_fulfillment)
  );
end;
$$;

revoke all on function public.activation_health_v20() from public;
grant execute on function public.activation_health_v20() to authenticated;
