begin;

-- EL ERRANTE V2.6 — endurecimiento de lectura pública de public_settings.
-- Esta migración no activa Supabase ni cambia consumidores. Sólo limita qué claves
-- pueden leer roles públicos; los administradores conservan acceso completo por is_admin().

alter table public.public_settings enable row level security;

drop policy if exists "public reads public settings" on public.public_settings;
drop policy if exists "public reads approved public settings" on public.public_settings;
create policy "public reads approved public settings"
on public.public_settings
for select
to anon, authenticated
using (key in ('ordering','payment'));

-- Reafirma el contrato administrativo completo para cualquier clave presente o futura.
drop policy if exists "admins manage public settings" on public.public_settings;
create policy "admins manage public settings"
on public.public_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

comment on policy "public reads approved public settings" on public.public_settings is
'Allowlist pública V4.2: únicamente ordering y payment. Otras claves requieren autorización administrativa.';

comment on policy "admins manage public settings" on public.public_settings is
'Administradores activos conservan lectura y escritura completa mediante public.is_admin().';

insert into public.schema_migrations(version,description)
values('2.6','Allowlist RLS pública de public_settings para ordering y payment')
on conflict(version) do nothing;

commit;
