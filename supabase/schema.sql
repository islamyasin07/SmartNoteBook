create extension if not exists pgcrypto;

create or replace function public.get_current_user_shop_id()
returns uuid
language plpgsql
stable
as $$
begin
  return (select shop_id from public.user_profiles where id = auth.uid());
end;
$$;

create or replace function public.get_current_user_role()
returns text
language plpgsql
stable
as $$
begin
  return (select role from public.user_profiles where id = auth.uid());
end;
$$;

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
as $$
begin
  return coalesce(public.get_current_user_role() = 'admin', false);
end;
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language plpgsql
stable
as $$
begin
  return coalesce(public.get_current_user_role() in ('admin', 'staff'), false);
end;
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

create or replace function public.ensure_current_user_profile(
  p_full_name text default null,
  p_shop_name text default 'Al-Masdar Security Systems',
  p_role text default 'admin'
)
returns public.user_profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile public.user_profiles;
  v_shop_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into v_profile
  from public.user_profiles
  where id = auth.uid();

  if found then
    return v_profile;
  end if;

  select id
  into v_shop_id
  from public.shops
  where name = p_shop_name
  order by created_at asc
  limit 1;

  if v_shop_id is null then
    insert into public.shops (name)
    values (p_shop_name)
    returning id into v_shop_id;
  end if;

  insert into public.user_profiles (id, shop_id, full_name, role)
  values (auth.uid(), v_shop_id, p_full_name, coalesce(p_role, 'admin'))
  returning * into v_profile;

  return v_profile;
end;
$$;

create or replace function public.ensure_current_user_profile()
returns public.user_profiles
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return public.ensure_current_user_profile(null, 'Al-Masdar Security Systems', 'admin');
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
