begin;

-- EL ERRANTE V2.9.1 — privacidad del catálogo operativo + integridad shopper.
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

-- Un shopper anónimo sólo puede crear la fase previa a verificación de pago.
-- Nunca puede autoaprobar, iniciar preparación, despachar o cerrar un pedido.
drop policy if exists "shopper inserts own order" on public.orders;
create policy "shopper inserts own order"
on public.orders
for insert
to authenticated
with check (
  customer_user_id = auth.uid()
  and coalesce((auth.jwt()->>'is_anonymous')::boolean,false) = true
  and status in ('pending_payment','payment_review')
  and payment_method = 'bank_transfer'
  and source = 'web'
);

-- Las transiciones administrativas de estado son un dominio, no un UPDATE genérico.
-- transition_order_v21/v22 son SECURITY DEFINER, validan is_admin(), grafo de estados,
-- comprobante antes de aprobar y checklist antes de despachar. Se retira el atajo REST.
drop policy if exists "admins update orders" on public.orders;
revoke update on table public.orders from authenticated;

-- Los ítems sólo pueden añadirse al pedido propio mientras sigue en fase shopper.
-- Tras aprobación/revisión administrativa, el cliente no puede anexar líneas tardías.
drop policy if exists "shopper inserts own order items" on public.order_items;
create policy "shopper inserts own order items"
on public.order_items
for insert
to authenticated
with check (
  exists(
    select 1 from public.orders o
    where o.id=order_id
      and o.customer_user_id=auth.uid()
      and o.status in ('pending_payment','payment_review')
  )
);

-- El archivo privado sólo puede subirse dentro de <auth.uid>/<order_id>/...
-- y el pedido debe pertenecer al mismo usuario en una fase que admita comprobante.
drop policy if exists "shopper uploads receipt in own folder" on storage.objects;
create policy "shopper uploads receipt in own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id='payment-receipts'
  and (storage.foldername(name))[1]=auth.uid()::text
  and (storage.foldername(name))[2] is not null
  and exists(
    select 1 from public.orders o
    where o.id=(storage.foldername(name))[2]
      and o.customer_user_id=auth.uid()
      and o.status in ('pending_payment','payment_review','rejected')
  )
);

-- El metadata sólo puede vincular el pedido propio con un objeto privado ya subido.
-- La carpeta debe ser exactamente <auth.uid>/<order_id>/archivo.
drop policy if exists "shopper inserts own receipt metadata" on public.payment_receipts;
create policy "shopper inserts own receipt metadata"
on public.payment_receipts
for insert
to authenticated
with check (
  owner_id=auth.uid()
  and (storage.foldername(storage_path))[1]=auth.uid()::text
  and (storage.foldername(storage_path))[2]=order_id
  and exists(
    select 1 from public.orders o
    where o.id=order_id
      and o.customer_user_id=auth.uid()
      and o.status in ('pending_payment','payment_review','rejected')
  )
  and exists(
    select 1 from storage.objects s
    where s.bucket_id='payment-receipts'
      and s.name=storage_path
  )
);

insert into public.app_migrations(version,label)
values('2.9.1','Catálogo privado e integridad shopper; pedidos/estados/comprobantes endurecidos')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
