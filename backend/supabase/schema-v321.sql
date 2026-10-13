begin;

-- EL ERRANTE V3.2.1 — compatibilidad segura de comprobantes.
-- Separa explícitamente la inserción shopper anónima de la inserción admin usada
-- por el intake conectado de WhatsApp/teléfono/directo.

drop policy if exists "shopper inserts own receipt metadata" on public.payment_receipts;
create policy "shopper inserts own receipt metadata"
on public.payment_receipts for insert to authenticated
with check (
  coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=true
  and owner_id=auth.uid()
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

drop policy if exists "admins insert receipt metadata v321" on public.payment_receipts;
create policy "admins insert receipt metadata v321"
on public.payment_receipts for insert to authenticated
with check (
  public.is_admin()
  and owner_id=auth.uid()
  and status='pending'
  and reviewed_by is null
  and reviewed_at is null
  and (storage.foldername(storage_path))[1]=auth.uid()::text
  and (storage.foldername(storage_path))[2]=order_id
  and exists(select 1 from public.orders o where o.id=order_id and o.customer_user_id=auth.uid())
  and exists(
    select 1 from storage.objects s
    where s.bucket_id='payment-receipts' and s.name=storage_path
  )
);

insert into public.app_migrations(version,label)
values('3.2.1','Policies separadas para comprobante shopper anónimo y comprobante admin')
on conflict(version) do update set label=excluded.label,applied_at=now();

commit;
