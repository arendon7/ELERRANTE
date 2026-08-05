-- EL ERRANTE V1.5 — autenticación administrativa y operación conectada
-- Ejecutar DESPUÉS de schema-v14.sql.
-- Nunca pegar service_role, contraseñas ni tokens privados en el repositorio o en el navegador.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_product_operations_updated_at on public.product_operations;
create trigger trg_product_operations_updated_at before update on public.product_operations
for each row execute function public.set_updated_at();

drop trigger if exists trg_fixed_costs_updated_at on public.fixed_costs;
create trigger trg_fixed_costs_updated_at before update on public.fixed_costs
for each row execute function public.set_updated_at();

drop trigger if exists trg_public_settings_updated_at on public.public_settings;
create trigger trg_public_settings_updated_at before update on public.public_settings
for each row execute function public.set_updated_at();

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payment_receipts_order_id on public.payment_receipts(order_id);
create index if not exists idx_fixed_costs_month on public.fixed_costs(month);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admins read audit log" on public.admin_audit_log;
create policy "admins read audit log"
on public.admin_audit_log for select to authenticated
using (public.is_admin());

drop policy if exists "admins insert audit log" on public.admin_audit_log;
create policy "admins insert audit log"
on public.admin_audit_log for insert to authenticated
with check (public.is_admin() and actor_id = auth.uid());

create or replace function public.record_admin_event(
  p_action text,
  p_entity text,
  p_entity_id text default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  event_id uuid;
begin
  if not public.is_admin() then
    raise exception 'administrative access required';
  end if;
  insert into public.admin_audit_log(actor_id,action,entity,entity_id,payload)
  values(auth.uid(),p_action,p_entity,p_entity_id,coalesce(p_payload,'{}'::jsonb))
  returning id into event_id;
  return event_id;
end;
$$;

revoke all on function public.record_admin_event(text,text,text,jsonb) from public;
grant execute on function public.record_admin_event(text,text,text,jsonb) to authenticated;

insert into public.public_settings(key,value)
values
  ('payment',jsonb_build_object(
    'bank','Bancolombia',
    'accountType','Cuenta de ahorros',
    'accountHolder','',
    'accountNumber','',
    'key','',
    'instructions','Realiza la transferencia por el valor total del pedido y adjunta el comprobante. El pedido se prepara cuando el pago sea verificado por El Errante.'
  )),
  ('ordering',jsonb_build_object(
    'deliveryPolicy','Cobertura abierta sujeta a coordinación logística',
    'requireReceipt',true,
    'maxReceiptBytesPreview',5000000
  ))
on conflict (key) do nothing;

-- PASO MANUAL DE ACTIVACIÓN DEL PRIMER ADMINISTRADOR
-- 1. Crear el usuario desde Authentication > Users en Supabase.
-- 2. Copiar su UUID y ejecutar, reemplazando los valores de ejemplo:
-- insert into public.admin_users(user_id,display_name)
-- values ('00000000-0000-0000-0000-000000000000','Juan')
-- on conflict (user_id) do update set display_name=excluded.display_name,active=true;

-- La URL del proyecto y la publishable key pueden ser consumidas por el navegador.
-- La seguridad depende de Auth + RLS. La service_role debe permanecer exclusivamente en servidor.
