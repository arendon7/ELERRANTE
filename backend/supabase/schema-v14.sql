-- EL ERRANTE V1.4 — esquema inicial para Supabase
-- Ejecutar en un proyecto Supabase nuevo. No incluir service_role ni contraseñas en el repositorio.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.active = true
  );
$$;

create table if not exists public.orders (
  id text primary key,
  customer_user_id uuid not null references auth.users(id),
  status text not null default 'payment_review' check (status in ('pending_payment','payment_review','approved','preparing','dispatched','delivered','rejected','cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  city text not null,
  neighborhood text,
  address text not null,
  delivery_notes text,
  requested_date date,
  subtotal numeric(14,2) not null default 0,
  delivery_fee numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  payment_method text not null default 'bank_transfer',
  payment_reference text,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  variant_id text,
  product_name text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  unit_cost_snapshot numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0
);

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  owner_id uuid not null references auth.users(id),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_operations (
  product_id text primary key,
  product_name text not null,
  sale_price numeric(14,2) not null default 0,
  unit_cost numeric(14,2) not null default 0,
  inventory numeric(14,2) not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  cost_key text not null,
  label text not null,
  amount numeric(14,2) not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique(month,cost_key)
);

create table if not exists public.public_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.product_operations enable row level security;
alter table public.fixed_costs enable row level security;
alter table public.public_settings enable row level security;

create policy "admins read admin users" on public.admin_users for select to authenticated using (public.is_admin());

create policy "shopper inserts own order" on public.orders for insert to authenticated
with check (customer_user_id = auth.uid() and coalesce((auth.jwt()->>'is_anonymous')::boolean,false) = true);
create policy "shopper reads own orders" on public.orders for select to authenticated using (customer_user_id = auth.uid() or public.is_admin());
create policy "admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "shopper inserts own order items" on public.order_items for insert to authenticated
with check (exists(select 1 from public.orders o where o.id=order_id and o.customer_user_id=auth.uid()));
create policy "shopper or admin reads order items" on public.order_items for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and (o.customer_user_id=auth.uid() or public.is_admin())));

create policy "shopper inserts own receipt metadata" on public.payment_receipts for insert to authenticated with check (owner_id=auth.uid());
create policy "shopper or admin reads receipt metadata" on public.payment_receipts for select to authenticated using (owner_id=auth.uid() or public.is_admin());
create policy "admins review receipts" on public.payment_receipts for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads active catalog operations" on public.product_operations for select to anon, authenticated using (active=true or public.is_admin());
create policy "admins manage catalog operations" on public.product_operations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage fixed costs" on public.fixed_costs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads public settings" on public.public_settings for select to anon, authenticated using (true);
create policy "admins manage public settings" on public.public_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('payment-receipts','payment-receipts',false,10485760,array['image/jpeg','image/png','application/pdf'])
on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;

create policy "shopper uploads receipt in own folder" on storage.objects for insert to authenticated
with check (bucket_id='payment-receipts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "shopper reads own receipt or admin reads all" on storage.objects for select to authenticated
using (bucket_id='payment-receipts' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy "admins update receipt objects" on storage.objects for update to authenticated using (bucket_id='payment-receipts' and public.is_admin());
create policy "admins delete receipt objects" on storage.objects for delete to authenticated using (bucket_id='payment-receipts' and public.is_admin());

insert into public.fixed_costs(month,cost_key,label,amount)
values
  (to_char(current_date,'YYYY-MM'),'trabajador','Trabajador',2000000),
  (to_char(current_date,'YYYY-MM'),'sede','Sede y ocupación',2500000),
  (to_char(current_date,'YYYY-MM'),'servicios','Servicios, conectividad y operación',750000),
  (to_char(current_date,'YYYY-MM'),'otros','Otros gastos fijos',750000)
on conflict (month,cost_key) do nothing;
