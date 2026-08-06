-- EL ERRANTE V2.0 — activación operativa y gobierno administrativo
-- Ejecutar DESPUÉS de schema-v14.sql, schema-v15.sql, schema-v16.sql y schema-v19.sql.
-- El primer administrador se registra exclusivamente desde el SQL Editor del proyecto.

create table if not exists public.app_migrations (
  version text primary key,
  label text not null,
  applied_at timestamptz not null default now()
);

alter table public.app_migrations enable row level security;

drop policy if exists "admins read app migrations" on public.app_migrations;
create policy "admins read app migrations"
on public.app_migrations for select to authenticated
using (public.is_admin());

insert into public.app_migrations(version,label)
values
  ('1.4','Esquema comercial inicial'),
  ('1.5','Autenticación y acceso privado'),
  ('1.6','Operación, inventario y finanzas'),
  ('1.9','Seguimiento limitado de pedidos'),
  ('2.0','Activación operativa y gobierno administrativo')
on conflict (version) do update set label=excluded.label;

create or replace function public.register_first_admin_v20(
  p_user_id uuid,
  p_display_name text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if exists(select 1 from public.admin_users where active=true) then
    raise exception 'Ya existe un administrador activo';
  end if;
  if not exists(select 1 from auth.users where id=p_user_id) then
    raise exception 'El usuario de Authentication no existe';
  end if;
  insert into public.admin_users(user_id,display_name,active)
  values(p_user_id,coalesce(nullif(trim(p_display_name),''),'Administrador'),true)
  on conflict (user_id) do update
  set display_name=excluded.display_name,active=true;
  return true;
end;
$$;

revoke all on function public.register_first_admin_v20(uuid,text) from public;
revoke execute on function public.register_first_admin_v20(uuid,text) from anon, authenticated;
grant execute on function public.register_first_admin_v20(uuid,text) to postgres;

create or replace function public.set_admin_user_v20(
  p_email text,
  p_display_name text,
  p_active boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_id uuid;
  normalized_email text := lower(trim(coalesce(p_email,'')));
begin
  if not public.is_admin() then
    raise exception 'Acceso administrativo requerido';
  end if;
  if normalized_email='' then
    raise exception 'Correo requerido';
  end if;
  select id into target_id from auth.users where lower(email)=normalized_email limit 1;
  if target_id is null then
    raise exception 'No existe un usuario de Authentication con ese correo';
  end if;
  if target_id=auth.uid() and p_active=false then
    raise exception 'No puedes desactivar tu propio acceso desde esta sesión';
  end if;
  insert into public.admin_users(user_id,display_name,active)
  values(target_id,coalesce(nullif(trim(p_display_name),''),normalized_email),coalesce(p_active,true))
  on conflict (user_id) do update
  set display_name=excluded.display_name,active=excluded.active;
  perform public.record_admin_event(
    'set_admin_user_v20',
    'admin_users',
    target_id::text,
    jsonb_build_object('active',coalesce(p_active,true),'display_name',coalesce(nullif(trim(p_display_name),''),normalized_email))
  );
  return jsonb_build_object('user_id',target_id,'active',coalesce(p_active,true));
end;
$$;

revoke all on function public.set_admin_user_v20(text,text,boolean) from public;
grant execute on function public.set_admin_user_v20(text,text,boolean) to authenticated;

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
    'schema_version','2.0',
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

-- ACTIVACIÓN DEL PRIMER ADMINISTRADOR
-- 1. Crea el usuario desde Authentication > Users.
-- 2. Copia su UUID.
-- 3. Ejecuta en el SQL Editor:
-- select public.register_first_admin_v20('00000000-0000-0000-0000-000000000000','Juan');
-- Esta función deja de admitir nuevas altas iniciales cuando ya existe un administrador activo.
