create extension if not exists pgcrypto;

create or replace function public.get_current_user_shop_id()
returns uuid
language sql
stable
as $$
  select shop_id from public.user_profiles where id = auth.uid();
$$;

create or replace function public.get_current_user_role()
returns text
language sql
stable
as $$
  select role from public.user_profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.get_current_user_role() = 'admin', false);
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.get_current_user_role() in ('admin', 'staff'), false);
$$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'staff', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  phone text,
  city text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  category text,
  sku text,
  price numeric not null default 0,
  stock integer not null default 0,
  low_stock_threshold integer not null default 5,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  date date not null,
  subtotal numeric not null default 0,
  paid_total numeric not null default 0,
  remaining numeric not null default 0,
  status text not null check (status in ('Paid', 'Partial', 'Unpaid')),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  sku text,
  quantity integer not null,
  unit_price numeric not null,
  line_total numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  date date not null,
  amount numeric not null,
  method text not null check (method in ('Cash', 'Bank', 'Jawwal Pay', 'Other')),
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers for each row execute function public.update_updated_at_column();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.update_updated_at_column();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.update_updated_at_column();
