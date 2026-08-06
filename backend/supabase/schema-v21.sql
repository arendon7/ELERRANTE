-- EL ERRANTE V2.1 — transición operativa segura de pedidos
-- Ejecutar DESPUÉS de schema-v20.sql.

create or replace function public.transition_order_v21(
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
    'order_transition_v21',
    'orders',
    p_order_id,
    jsonb_build_object('from',v_current,'to',p_new_status,'note',nullif(trim(p_note),''))
  );

  return jsonb_build_object('order_id',p_order_id,'previous_status',v_current,'status',p_new_status,'updated_at',now());
end;
$$;

revoke all on function public.transition_order_v21(text,text,text) from public;
grant execute on function public.transition_order_v21(text,text,text) to authenticated;

insert into public.app_migrations(version,label)
values ('2.1','Mesa diaria, respaldo local y transición segura de pedidos')
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
    'schema_version','2.1',
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
    'orders_count',(select count(*) from public.orders)
  );
end;
$$;

revoke all on function public.activation_health_v20() from public;
grant execute on function public.activation_health_v20() to authenticated;
