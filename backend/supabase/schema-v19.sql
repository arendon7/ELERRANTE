-- EL ERRANTE V1.9 — confianza comercial, consulta y trazabilidad
-- Ejecutar DESPUÉS de schema-v14.sql, schema-v15.sql y schema-v16.sql.
-- La consulta pública devuelve únicamente información operativa limitada.

create table if not exists public.order_status_events (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  previous_status text,
  status text not null,
  changed_by uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_events_order_created
on public.order_status_events(order_id,created_at desc);

alter table public.order_status_events enable row level security;

drop policy if exists "shopper or admin reads order status events" on public.order_status_events;
create policy "shopper or admin reads order status events"
on public.order_status_events for select to authenticated
using (
  exists(
    select 1 from public.orders o
    where o.id=order_id and (o.customer_user_id=auth.uid() or public.is_admin())
  )
);

drop policy if exists "admins insert order status events" on public.order_status_events;
create policy "admins insert order status events"
on public.order_status_events for insert to authenticated
with check (public.is_admin());

create or replace function public.record_order_status_event_v19()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op='INSERT' then
    insert into public.order_status_events(order_id,previous_status,status,changed_by,note)
    values(new.id,null,new.status,auth.uid(),'Solicitud registrada');
  elsif new.status is distinct from old.status then
    insert into public.order_status_events(order_id,previous_status,status,changed_by,note)
    values(new.id,old.status,new.status,auth.uid(),null);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_status_event_v19 on public.orders;
create trigger trg_order_status_event_v19
after insert or update of status on public.orders
for each row execute function public.record_order_status_event_v19();

-- Recupera estados iniciales para pedidos creados antes de V1.9.
insert into public.order_status_events(order_id,previous_status,status,changed_by,note,created_at)
select o.id,null,o.status,null,'Estado inicial recuperado',o.created_at
from public.orders o
where not exists(select 1 from public.order_status_events e where e.order_id=o.id);

create or replace function public.lookup_order_status_v19(
  p_order_id text,
  p_email text
)
returns table(
  order_id text,
  status text,
  total numeric,
  created_at timestamptz,
  updated_at timestamptz,
  requested_date date,
  receipt_status text,
  timeline jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.status,
    o.total,
    o.created_at,
    o.updated_at,
    o.requested_date,
    coalesce(r.status,'pending') as receipt_status,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'status',e.status,
          'previousStatus',e.previous_status,
          'note',e.note,
          'createdAt',e.created_at
        ) order by e.created_at asc
      )
      from public.order_status_events e
      where e.order_id=o.id
    ),'[]'::jsonb) as timeline
  from public.orders o
  left join lateral (
    select pr.status
    from public.payment_receipts pr
    where pr.order_id=o.id
    order by pr.created_at desc
    limit 1
  ) r on true
  where upper(trim(o.id))=upper(trim(p_order_id))
    and lower(trim(o.customer_email))=lower(trim(p_email))
  limit 1;
$$;

revoke all on function public.lookup_order_status_v19(text,text) from public;
grant execute on function public.lookup_order_status_v19(text,text) to anon, authenticated;

insert into public.public_settings(key,value)
values ('ordering',jsonb_build_object(
  'deliveryPolicy','Cobertura abierta sujeta a coordinación logística',
  'deliveryFeePolicy','La tarifa se confirma según dirección, volumen y alternativa de entrega.',
  'coverageDetails','Recibimos solicitudes sin rutas ni días fijos. Confirmamos disponibilidad y logística antes de preparar.',
  'supportWhatsapp','',
  'supportEmail','',
  'expectedResponseHours',24,
  'requireReceipt',true,
  'maxReceiptBytesPreview',5000000
))
on conflict (key) do update set value=public.public_settings.value || excluded.value;

comment on function public.lookup_order_status_v19(text,text) is
'Consulta pública limitada por referencia y correo. No devuelve dirección, teléfono, comprobante ni notas internas.';
