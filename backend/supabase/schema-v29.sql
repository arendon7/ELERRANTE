begin;

-- EL ERRANTE V2.9 — creación segura de pedidos internos conectados.
-- Permite registrar en Supabase pedidos recibidos por WhatsApp, teléfono o coordinación directa
-- sin fingir que nacieron desde el checkout público. Sólo administradores activos pueden usarla.

create or replace function public.create_internal_order_v29(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_id text;
  v_customer_name text;
  v_customer_phone text;
  v_customer_email text;
  v_channel text;
  v_city text;
  v_neighborhood text;
  v_address text;
  v_notes text;
  v_requested_date date;
  v_payment_reference text;
  v_delivery_fee numeric(14,2) := 0;
  v_subtotal numeric(14,2) := 0;
  v_total numeric(14,2) := 0;
  v_items jsonb;
  v_item jsonb;
  v_quantity numeric(12,2);
  v_unit_price numeric(14,2);
  v_unit_cost numeric(14,2);
  v_product_name text;
begin
  if not public.is_admin() then
    raise exception 'Acceso administrativo requerido';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload inválido';
  end if;

  v_customer_name := trim(coalesce(p_payload->>'customer_name',''));
  v_customer_phone := trim(coalesce(p_payload->>'customer_phone',''));
  v_customer_email := lower(trim(coalesce(p_payload->>'customer_email','')));
  v_channel := lower(trim(coalesce(p_payload->>'channel','direct')));
  v_city := coalesce(nullif(trim(coalesce(p_payload->>'city','')),''),'Medellín');
  v_neighborhood := nullif(trim(coalesce(p_payload->>'neighborhood','')),'');
  v_address := trim(coalesce(p_payload->>'address',''));
  v_notes := nullif(trim(coalesce(p_payload->>'delivery_notes','')),'');
  v_payment_reference := nullif(trim(coalesce(p_payload->>'payment_reference','')),'');
  v_items := coalesce(p_payload->'items','[]'::jsonb);

  if length(v_customer_name) < 2 then raise exception 'Nombre de cliente requerido'; end if;
  if length(v_customer_phone) < 6 then raise exception 'Teléfono o WhatsApp requerido'; end if;
  if v_channel not in ('whatsapp','phone','direct') then raise exception 'Canal interno no permitido'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then raise exception 'El pedido requiere al menos una línea'; end if;

  if nullif(trim(coalesce(p_payload->>'requested_date','')),'') is not null then
    v_requested_date := (p_payload->>'requested_date')::date;
  end if;
  if nullif(trim(coalesce(p_payload->>'delivery_fee','')),'') is not null then
    v_delivery_fee := greatest(0,(p_payload->>'delivery_fee')::numeric);
  end if;

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_product_name := trim(coalesce(v_item->>'product_name',''));
    v_quantity := coalesce(nullif(trim(coalesce(v_item->>'quantity','')),'')::numeric,0);
    v_unit_price := coalesce(nullif(trim(coalesce(v_item->>'unit_price','')),'')::numeric,0);
    v_unit_cost := greatest(0,coalesce(nullif(trim(coalesce(v_item->>'unit_cost_snapshot','')),'')::numeric,0));
    if v_product_name = '' then raise exception 'Cada línea requiere product_name'; end if;
    if v_quantity <= 0 then raise exception 'Cada línea requiere quantity mayor que cero'; end if;
    if v_unit_price <= 0 then raise exception 'Cada línea requiere unit_price mayor que cero'; end if;
    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  end loop;

  v_total := v_subtotal + v_delivery_fee;
  v_id := nullif(trim(coalesce(p_payload->>'id','')),'');
  if v_id is null then
    v_id := 'EE-INT-' || to_char(now() at time zone 'America/Bogota','YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  end if;
  if exists(select 1 from public.orders where id=v_id) then raise exception 'La referencia del pedido ya existe'; end if;

  insert into public.orders(
    id,customer_user_id,status,customer_name,customer_email,customer_phone,
    city,neighborhood,address,delivery_notes,requested_date,subtotal,delivery_fee,total,
    payment_method,payment_reference,source
  ) values (
    v_id,auth.uid(),'pending_payment',v_customer_name,v_customer_email,v_customer_phone,
    v_city,v_neighborhood,v_address,v_notes,v_requested_date,v_subtotal,v_delivery_fee,v_total,
    'bank_transfer',v_payment_reference,'internal_' || v_channel
  );

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_quantity := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_unit_cost := greatest(0,coalesce(nullif(trim(coalesce(v_item->>'unit_cost_snapshot','')),'')::numeric,0));
    insert into public.order_items(
      order_id,product_id,variant_id,product_name,quantity,unit_price,unit_cost_snapshot,line_total
    ) values (
      v_id,
      nullif(trim(coalesce(v_item->>'product_id','')),''),
      nullif(trim(coalesce(v_item->>'variant_id','')),''),
      trim(v_item->>'product_name'),
      v_quantity,v_unit_price,v_unit_cost,v_quantity*v_unit_price
    );
  end loop;

  perform public.record_admin_event(
    'internal_order_created_v29','orders',v_id,
    jsonb_build_object('channel',v_channel,'items',jsonb_array_length(v_items),'subtotal',v_subtotal,'delivery_fee',v_delivery_fee,'total',v_total)
  );

  return jsonb_build_object(
    'order_id',v_id,'status','pending_payment','source','internal_'||v_channel,
    'subtotal',v_subtotal,'delivery_fee',v_delivery_fee,'total',v_total
  );
end;
$$;

revoke all on function public.create_internal_order_v29(jsonb) from public, anon;
grant execute on function public.create_internal_order_v29(jsonb) to authenticated;

insert into public.app_migrations(version,label)
values('2.9','Pedidos internos conectados para WhatsApp, teléfono y coordinación directa')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
