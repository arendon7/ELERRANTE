begin;

-- EL ERRANTE V2.9.1 — catálogo operativo privado.
-- Precio operativo, costo unitario, inventario y umbrales son datos internos.
-- La tienda pública continúa usando el catálogo canónico publicado en frontend;
-- las superficies conectadas que consultan product_operations son administrativas.

drop policy if exists "public reads active catalog operations" on public.product_operations;

-- Supabase concede SELECT de tablas public a anon/authenticated por defecto.
-- Anon no necesita esta tabla. Authenticated conserva SELECT porque el mismo rol
-- representa admins y shoppers anónimos; RLS deja pasar únicamente a is_admin().
revoke select on table public.product_operations from anon;
grant select on table public.product_operations to authenticated;

-- is_admin sólo es una dependencia de sesiones authenticated/RLS administrativa.
-- El rol anon sin sesión no necesita invocarla directamente por REST.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Reconstituye la política administrativa de forma explícita e idempotente.
drop policy if exists "admins manage catalog operations" on public.product_operations;
create policy "admins manage catalog operations"
on public.product_operations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.app_migrations(version,label)
values('2.9.1','Catálogo operativo privado: costos e inventario sólo para administradores')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
