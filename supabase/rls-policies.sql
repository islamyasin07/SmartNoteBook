alter table public.shops enable row level security;
alter table public.user_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "shops_select_own" on public.shops;
create policy "shops_select_own"
on public.shops for select
using (id = public.get_current_user_shop_id() or public.is_admin());

drop policy if exists "shops_admin_manage" on public.shops;
create policy "shops_admin_manage"
on public.shops for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
on public.user_profiles for select
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
on public.user_profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "customers_select_shop" on public.customers;
create policy "customers_select_shop"
on public.customers for select
using (shop_id = public.get_current_user_shop_id() and auth.role() = 'authenticated');

drop policy if exists "customers_insert_shop" on public.customers;
create policy "customers_insert_shop"
on public.customers for insert
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "customers_update_shop" on public.customers;
create policy "customers_update_shop"
on public.customers for update
using (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin())
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "customers_delete_admin" on public.customers;
create policy "customers_delete_admin"
on public.customers for delete
using (shop_id = public.get_current_user_shop_id() and public.is_admin());

drop policy if exists "products_select_shop" on public.products;
create policy "products_select_shop"
on public.products for select
using (shop_id = public.get_current_user_shop_id() and auth.role() = 'authenticated');

drop policy if exists "products_insert_shop" on public.products;
create policy "products_insert_shop"
on public.products for insert
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "products_update_shop" on public.products;
create policy "products_update_shop"
on public.products for update
using (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin())
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
on public.products for delete
using (shop_id = public.get_current_user_shop_id() and public.is_admin());

drop policy if exists "transactions_select_shop" on public.transactions;
create policy "transactions_select_shop"
on public.transactions for select
using (shop_id = public.get_current_user_shop_id() and auth.role() = 'authenticated');

drop policy if exists "transactions_insert_shop" on public.transactions;
create policy "transactions_insert_shop"
on public.transactions for insert
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "transactions_update_shop" on public.transactions;
create policy "transactions_update_shop"
on public.transactions for update
using (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin())
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "transactions_delete_admin" on public.transactions;
create policy "transactions_delete_admin"
on public.transactions for delete
using (shop_id = public.get_current_user_shop_id() and public.is_admin());

drop policy if exists "transaction_items_select_shop" on public.transaction_items;
create policy "transaction_items_select_shop"
on public.transaction_items for select
using (exists (
  select 1 from public.transactions t
  where t.id = transaction_items.transaction_id
    and t.shop_id = public.get_current_user_shop_id()
));

drop policy if exists "transaction_items_insert_shop" on public.transaction_items;
create policy "transaction_items_insert_shop"
on public.transaction_items for insert
with check (exists (
  select 1 from public.transactions t
  where t.id = transaction_items.transaction_id
    and t.shop_id = public.get_current_user_shop_id()
    and public.is_staff_or_admin()
));

drop policy if exists "payments_select_shop" on public.payments;
create policy "payments_select_shop"
on public.payments for select
using (shop_id = public.get_current_user_shop_id() and auth.role() = 'authenticated');

drop policy if exists "payments_insert_shop" on public.payments;
create policy "payments_insert_shop"
on public.payments for insert
with check (shop_id = public.get_current_user_shop_id() and public.is_staff_or_admin());

drop policy if exists "payments_update_shop" on public.payments;
create policy "payments_update_shop"
on public.payments for update
using (shop_id = public.get_current_user_shop_id() and public.is_admin())
with check (shop_id = public.get_current_user_shop_id() and public.is_admin());

drop policy if exists "payments_delete_admin" on public.payments;
create policy "payments_delete_admin"
on public.payments for delete
using (shop_id = public.get_current_user_shop_id() and public.is_admin());

drop policy if exists "audit_logs_admin_only" on public.audit_logs;
create policy "audit_logs_admin_only"
on public.audit_logs for select
using (shop_id = public.get_current_user_shop_id() and public.is_admin());
