insert into public.shops (name)
values ('Al-Masdar Security Systems')
on conflict do nothing;

with shop as (
  select id from public.shops where name = 'Al-Masdar Security Systems' limit 1
)
insert into public.customers (shop_id, name, phone, city, notes, created_by)
select shop.id, v.name, v.phone, v.city, v.notes, null
from shop
cross join (values
  ('أبو أحمد', '0599000001', 'غزة', 'عميل دائم'),
  ('شركة النور', '0599000002', 'خانيونس', 'مشروع كاميرات'),
  ('محمد عادل', '0599000003', 'رفح', 'دفع جزئي سابق')
) as v(name, phone, city, notes)
on conflict do nothing;

with shop as (
  select id from public.shops where name = 'Al-Masdar Security Systems' limit 1
)
insert into public.products (shop_id, name, category, sku, price, stock, low_stock_threshold, notes, created_by)
select shop.id, v.name, v.category, v.sku, v.price, v.stock, v.threshold, v.notes, null
from shop
cross join (values
  ('Hikvision Bullet Camera 2MP', 'Camera', 'HIK-BC-2MP', 180, 12, 3, 'موديل شائع'),
  ('DVR 8 Channel', 'DVR', 'DVR-8CH', 420, 7, 2, 'يدعم H.265'),
  ('NVR 16 Channel', 'NVR', 'NVR-16CH', 650, 5, 2, 'مناسب للمنشآت الكبيرة'),
  ('RG59 Cable Meter', 'Cable', 'CAB-RG59', 4.5, 500, 100, 'يباع بالمتر'),
  ('Cat6 Cable Meter', 'Cable', 'CAB-CAT6', 5.0, 420, 100, 'كيبل شبكي'),
  ('BNC Connector', 'Connector', 'CON-BNC', 2.0, 300, 50, 'موصل BNC'),
  ('12V Power Supply', 'Power Supply', 'PSU-12V', 18, 40, 10, 'مزود طاقة ثابت'),
  ('Surveillance Monitor', 'Monitor', 'MON-22', 550, 6, 2, 'شاشة مراقبة'),
  ('Hard Disk 1TB', 'Hard Disk', 'HDD-1TB', 210, 18, 5, 'تسجيل مستمر')
) as v(name, category, sku, price, stock, threshold, notes)
on conflict do nothing;

-- Auth users must be created in the Supabase Auth dashboard.
-- After creating a user, copy the auth user id and insert a matching row into public.user_profiles.
-- Example:
-- insert into public.user_profiles (id, shop_id, full_name, role)
-- values ('user-uuid-here', (select id from public.shops where name = 'Al-Masdar Security Systems' limit 1), 'Admin Name', 'admin');
