begin;

-- EL ERRANTE V3.2 — pedido web server-priced y fail-closed.
-- No siembra precios ni tarifas comerciales. Las tablas nacen vacías/inactivas y
-- commerceEnabled se fuerza a false durante esta migración pre-GO.

alter table public.orders
  add column if not exists client_request_id uuid;

create unique index if not exists uq_orders_customer_request_v32
  on public.orders(customer_user_id,client_request_id)
  where client_request_id is not null;

create table if not exists public.commercial_pricebook_v32 (
  product_id text not null,
  variant_id text not null default '',
  product_name text not null,
  sku text,
  unit_price numeric(14,2) not null check (unit_price > 0),
  currency text not null default 'COP' check (currency='COP'),
  active boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  valid_from date not null default current_date,
  valid_to date,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key(product_id,variant_id),
  check (valid_to is null or valid_to >= valid_from)
);

create table if not exists public.delivery_policy_v32 (
  policy_key text primary key,
  mode text not null check (mode in ('manual_quote','flat','city')),
  flat_fee numeric(14,2) check (flat_fee is null or flat_fee >= 0),
  active boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  check (mode <> 'flat' or flat_fee is not null)
);

create table if not exists public.delivery_tariffs_v32 (
  id uuid primary key default gen_random_uuid(),
  city_key text not null,
  neighborhood_key text not null default '',
  label text not null,
  fee numeric(14,2) not null check (fee >= 0),
  active boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique(city_key,neighborhood_key)
);

alter table public.commercial_pricebook_v32 enable row level security;
alter table public.delivery_policy_v32 enable row level security;
alter table public.delivery_tariffs_v32 enable row level security;

drop policy if exists "admins manage commercial pricebook v32" on public.commercial_pricebook_v32;
create policy "admins manage commercial pricebook v32"
on public.commercial_pricebook_v32 for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage delivery policy v32" on public.delivery_policy_v32;
create policy "admins manage delivery policy v32"
on public.delivery_policy_v32 for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage delivery tariffs v32" on public.delivery_tariffs_v32;
create policy "admins manage delivery tariffs v32"
on public.delivery_tariffs_v32 for all to authenticated
using (public.is_admin()) with check (public.is_admin());

revoke all on table public.commercial_pricebook_v32 from anon;
revoke all on table public.delivery_policy_v32 from anon;
revoke all on table public.delivery_tariffs_v32 from anon;
grant select,insert,update,delete on table public.commercial_pricebook_v32 to authenticated;
grant select,insert,update,delete on table public.delivery_policy_v32 to authenticated;
grant select,insert,update,delete on table public.delivery_tariffs_v32 to authenticated;

insert into public.delivery_policy_v32(policy_key,mode,active)
values('pilot','manual_quote',false)
on conflict(policy_key) do nothing;

-- El GO comercial debe ser deliberado después de precios, logística, Auth y pedido cero.
update public.public_settings
set value=jsonb_set(coalesce(value,'{}'::jsonb),'{commerceEnabled}','false'::jsonb,true),
    updated_at=now()
where key='ordering';

create or replace function public.resolve_delivery_fee_v32(
  p_city text,
  p_neighborhood text default null
)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_mode text;
  v_flat numeric(14,2);
  v_fee numeric(14,2);
  v_city text := lower(trim(coalesce(p_city,'')));
  v_neighborhood text := lower(trim(coalesce(p_neighborhood,'')));
begin
  if v_city='' then raise exception 'delivery city required'; end if;

  select mode,flat_fee into v_mode,v_flat
  from public.delivery_policy_v32
  where policy_key='pilot' and active=true and approved_at is not null;

  if v_mode is null then raise exception 'delivery policy not approved'; end if;
  if v_mode='manual_quote' then raise exception 'delivery quote required'; end if;
  if v_mode='flat' then
    if v_flat is null then raise exception 'flat delivery fee not configured'; end if;
    return v_flat;
  end if;

  select fee into v_fee
  from public.delivery_tariffs_v32
  where active=true and approved_at is not null
    and lower(trim(city_key))=v_city
    and (trim(neighborhood_key)='' or lower(trim(neighborhood_key))=v_neighborhood)
  order by (trim(neighborhood_key)<>'') desc
  limit 1;

  if v_fee is null then raise exception 'delivery tariff not approved for destination'; end if;
  return v_fee;
end;
$$;

revoke all on function public.resolve_delivery_fee_v32(text,text) from public,anon,authenticated;

create or replace function public.create_web_order_v32(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_request_id uuid;
  v_existing public.orders;
  v_ordering jsonb := coalesce((select value from public.public_settings where key='ordering'),'{}'::jsonb);
  v_payment jsonb := coalesce((select value from public.public_settings where key='payment'),'{}'::jsonb);
  v_customer_name text;
  v_customer_email text;
  v_customer_phone text;
  v_city text;
  v_neighborhood text;
  v_address text;
  v_notes text;
  v_requested_date date;
  v_items jsonb;
  v_item jsonb;
  v_canonical_items jsonb := '[]'::jsonb;
  v_product_id text;
  v_variant_id text;
  v_product_name text;
  v_quantity numeric(12,2);
  v_unit_price numeric(14,2);
  v_unit_cost numeric(14,2);
  v_subtotal numeric(14,2) := 0;
  v_delivery_fee numeric(14,2);
  v_total numeric(14,2);
  v_order_id text;
  v_payment_reference text;
begin
  if v_uid is null or not coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'anonymous shopper session required';
  end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'invalid payload'; end if;

  begin
    v_request_id := nullif(trim(coalesce(p_payload->>'client_request_id','')),'')::uuid;
  exception when others then
    raise exception 'valid client_request_id required';
  end;
  if v_request_id is null then raise exception 'client_request_id required'; end if;

  select * into v_existing
  from public.orders
  where customer_user_id=v_uid and client_request_id=v_request_id and source='web'
  limit 1;
  if v_existing.id is not null then
    return jsonb_build_object(
      'order_id',v_existing.id,'status',v_existing.status,'subtotal',v_existing.subtotal,
      'delivery_fee',v_existing.delivery_fee,'total',v_existing.total,
      'payment_reference',v_existing.payment_reference,'reused',true
    );
  end if;

  if coalesce(v_ordering->'commerceEnabled','false'::jsonb) <> 'true'::jsonb then
    raise exception 'commerce is not enabled';
  end if;

  if coalesce(trim(v_payment->>'accountHolder'),'')='' or not (
    coalesce(trim(v_payment->>'key'),'')<>'' or (
      coalesce(trim(v_payment->>'bank'),'')<>'' and
      coalesce(trim(v_payment->>'accountType'),'')<>'' and
      coalesce(trim(v_payment->>'accountNumber'),'')<>''
    )
  ) then
    raise exception 'payment configuration is not ready';
  end if;

  v_customer_name := trim(coalesce(p_payload->>'customer_name',''));
  v_customer_email := lower(trim(coalesce(p_payload->>'customer_email','')));
  v_customer_phone := trim(coalesce(p_payload->>'customer_phone',''));
  v_city := trim(coalesce(p_payload->>'city',''));
  v_neighborhood := nullif(trim(coalesce(p_payload->>'neighborhood','')),'');
  v_address := trim(coalesce(p_payload->>'address',''));
  v_notes := nullif(trim(coalesce(p_payload->>'delivery_notes','')),'');
  v_items := coalesce(p_payload->'items','[]'::jsonb);

  if length(v_customer_name)<2 then raise exception 'customer name required'; end if;
  if length(v_customer_phone)<6 then raise exception 'customer phone required'; end if;
  if position('@' in v_customer_email)<=1 then raise exception 'valid customer email required'; end if;
  if v_city='' then raise exception 'city required'; end if;
  if length(v_address)<4 then raise exception 'delivery address required'; end if;
  if jsonb_typeof(v_items)<>'array' or jsonb_array_length(v_items)=0 then raise exception 'order requires items'; end if;
  if jsonb_array_length(v_items)>30 then raise exception 'too many order lines'; end if;

  if nullif(trim(coalesce(p_payload->>'requested_date','')),'') is not null then
    v_requested_date := (p_payload->>'requested_date')::date;
    if v_requested_date<current_date then raise exception 'requested date cannot be in the past'; end if;
  end if;

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_product_id := trim(coalesce(v_item->>'product_id',''));
    v_variant_id := trim(coalesce(v_item->>'variant_id',''));
    v_quantity := coalesce(nullif(trim(coalesce(v_item->>'quantity','')),'')::numeric,0);
    if v_product_id='' then raise exception 'product_id required'; end if;
    if v_quantity<=0 or v_quantity<>trunc(v_quantity) or v_quantity>50 then raise exception 'invalid quantity for %',v_product_id; end if;

    select product_name,unit_price into v_product_name,v_unit_price
    from public.commercial_pricebook_v32
    where product_id=v_product_id and variant_id=v_variant_id
      and active=true and approved_at is not null
      and valid_from<=current_date and (valid_to is null or valid_to>=current_date)
    limit 1;
    if v_unit_price is null then raise exception 'commercial price not approved for % / %',v_product_id,v_variant_id; end if;

    select coalesce(unit_cost,0) into v_unit_cost
    from public.product_operations
    where product_id=v_product_id and active=true;
    v_unit_cost := coalesce(v_unit_cost,0);

    v_subtotal := v_subtotal + (v_quantity*v_unit_price);
    v_canonical_items := v_canonical_items || jsonb_build_array(jsonb_build_object(
      'product_id',v_product_id,'variant_id',nullif(v_variant_id,''),'product_name',v_product_name,
      'quantity',v_quantity,'unit_price',v_unit_price,'unit_cost_snapshot',v_unit_cost,
      'line_total',v_quantity*v_unit_price
    ));
  end loop;

  v_delivery_fee := public.resolve_delivery_fee_v32(v_city,v_neighborhood);
  v_total := v_subtotal + v_delivery_fee;
  v_order_id := 'EE-WEB-' || to_char(now() at time zone 'America/Bogota','YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  v_payment_reference := 'PAGO-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));

  insert into public.orders(
    id,client_request_id,customer_user_id,status,customer_name,customer_email,customer_phone,
    city,neighborhood,address,delivery_notes,requested_date,subtotal,delivery_fee,total,
    payment_method,payment_reference,source
  ) values (
    v_order_id,v_request_id,v_uid,'pending_payment',v_customer_name,v_customer_email,v_customer_phone,
    v_city,v_neighborhood,v_address,v_notes,v_requested_date,v_subtotal,v_delivery_fee,v_total,
    'bank_transfer',v_payment_reference,'web'
  );

  for v_item in select value from jsonb_array_elements(v_canonical_items)
  loop
    insert into public.order_items(
      order_id,product_id,variant_id,product_name,quantity,unit_price,unit_cost_snapshot,line_total
    ) values (
      v_order_id,v_item->>'product_id',nullif(v_item->>'variant_id',''),v_item->>'product_name',
      (v_item->>'quantity')::numeric,(v_item->>'unit_price')::numeric,
      (v_item->>'unit_cost_snapshot')::numeric,(v_item->>'line_total')::numeric
    );
  end loop;

  return jsonb_build_object(
    'order_id',v_order_id,'status','pending_payment','subtotal',v_subtotal,
    'delivery_fee',v_delivery_fee,'total',v_total,'payment_reference',v_payment_reference,'reused',false
  );
end;
$$;

revoke all on function public.create_web_order_v32(jsonb) from public,anon;
grant execute on function public.create_web_order_v32(jsonb) to authenticated;

-- El navegador deja de poder fijar precio/total insertando tablas directamente.
drop policy if exists "shopper inserts own order" on public.orders;
drop policy if exists "shopper inserts own order items" on public.order_items;
revoke insert on table public.orders from anon,authenticated;
revoke insert on table public.order_items from anon,authenticated;

-- Un comprobante shopper siempre nace pendiente y sin campos de revisión administradora.
drop policy if exists "shopper inserts own receipt metadata" on public.payment_receipts;
create policy "shopper inserts own receipt metadata"
on public.payment_receipts for insert to authenticated
with check (
  owner_id=auth.uid()
  and status='pending'
  and reviewed_by is null
  and reviewed_at is null
  and notes is null
  and (storage.foldername(storage_path))[1]=auth.uid()::text
  and (storage.foldername(storage_path))[2]=order_id
  and exists(
    select 1 from public.orders o
    where o.id=order_id and o.customer_user_id=auth.uid()
      and o.source='web' and o.status in ('pending_payment','payment_review','rejected')
  )
  and exists(
    select 1 from storage.objects s
    where s.bucket_id='payment-receipts' and s.name=storage_path
  )
);

create or replace function public.mark_web_order_payment_review_v32()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status='payment_review',updated_at=now()
  where id=new.order_id and source='web' and status in ('pending_payment','rejected');
  return new;
end;
$$;

revoke all on function public.mark_web_order_payment_review_v32() from public,anon,authenticated;

drop trigger if exists trg_web_receipt_payment_review_v32 on public.payment_receipts;
create trigger trg_web_receipt_payment_review_v32
after insert on public.payment_receipts
for each row execute function public.mark_web_order_payment_review_v32();

create or replace function public.commerce_readiness_v32()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ordering jsonb := coalesce((select value from public.public_settings where key='ordering'),'{}'::jsonb);
  v_payment jsonb := coalesce((select value from public.public_settings where key='payment'),'{}'::jsonb);
  v_policy public.delivery_policy_v32;
  v_price_count integer;
  v_delivery_ready boolean := false;
  v_payment_ready boolean := false;
begin
  if not public.is_admin() then raise exception 'administrative access required'; end if;
  select count(*) into v_price_count from public.commercial_pricebook_v32
  where active=true and approved_at is not null and valid_from<=current_date and (valid_to is null or valid_to>=current_date);
  select * into v_policy from public.delivery_policy_v32 where policy_key='pilot';
  v_delivery_ready := coalesce(v_policy.active,false) and v_policy.approved_at is not null and (
    (v_policy.mode='flat' and v_policy.flat_fee is not null)
    or (v_policy.mode='city' and exists(select 1 from public.delivery_tariffs_v32 where active=true and approved_at is not null))
  );
  v_payment_ready := coalesce(trim(v_payment->>'accountHolder'),'')<>'' and (
    coalesce(trim(v_payment->>'key'),'')<>'' or (
      coalesce(trim(v_payment->>'bank'),'')<>'' and coalesce(trim(v_payment->>'accountType'),'')<>'' and coalesce(trim(v_payment->>'accountNumber'),'')<>''
    )
  );
  return jsonb_build_object(
    'commerce_enabled',coalesce(v_ordering->'commerceEnabled','false'::jsonb)='true'::jsonb,
    'payment_ready',v_payment_ready,
    'approved_price_rows',v_price_count,
    'prices_ready',v_price_count>0,
    'delivery_mode',v_policy.mode,
    'delivery_ready',v_delivery_ready,
    'direct_order_insert_authenticated',has_table_privilege('authenticated','public.orders','insert'),
    'direct_item_insert_authenticated',has_table_privilege('authenticated','public.order_items','insert'),
    'web_order_rpc_authenticated',has_function_privilege('authenticated','public.create_web_order_v32(jsonb)','execute')
  );
end;
$$;

revoke all on function public.commerce_readiness_v32() from public,anon;
grant execute on function public.commerce_readiness_v32() to authenticated;

insert into public.app_migrations(version,label)
values('3.2','Pedido web server-priced, logística aprobada e idempotencia shopper')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
