-- ============================================================
--  BAGIAN 5: SEED DATA (Listings demo)
--  PENTING: Jalankan bagian ini SETELAH membuat akun
--  seller@savebites.com lewat Authentication → Users,
--  lalu insert profilenya dulu di Bagian 6.
-- ============================================================

alter table public.listings disable row level security;

insert into public.listings
  (title, merchant, merchant_location, distance, rating, reviews,
   original_price, discount_price, stock, time_left, expired_at,
   category, image, description, allergens, seller_email, seller_id)
values
  (
    'Paket Roti Manis Sisa Hari Ini',
    'Toko Roti Mawar',
    'Jl. Soekarno Hatta No. 12, Malang',
    '1.2 km', 4.8, 124, 25000, 10000, 3,
    '2 Jam',
    now() + interval '2 hours',
    'Roti & Kue',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    'Paket berisi 3-4 roti manis produksi hari ini.',
    array['Gandum','Susu','Telur'],
    'seller@savebites.com',
    (select id from public.profiles where name = 'Toko Roti Mawar' limit 1)
  ),
  (
    'Nasi Campur Ayam (Surplus)',
    'Warung Bu Sri',
    'Jl. MT Haryono No. 45, Malang',
    '0.8 km', 4.5, 89, 20000, 8000, 5,
    '1 Jam',
    now() + interval '1 hour',
    'Makanan Berat',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    'Nasi campur lengkap dengan lauk ayam goreng.',
    array['Kacang','Telur'],
    'warungbusri@savebites.com',
    (select id from public.profiles where name = 'Warung Bu Sri' limit 1)
  ),
  (
    'Sayur Organik Campur',
    'Pasar Segar',
    'Jl. Tlogomas No. 8, Malang',
    '2.5 km', 4.9, 210, 35000, 15000, 2,
    '4 Jam',
    now() + interval '4 hours',
    'Sayur & Buah',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'Sayuran organik sisa panen hari ini.',
    array[]::text[],
    'pasarsegar@savebites.com',
    (select id from public.profiles where name = 'Pasar Segar' limit 1)
  ),
  (
    'Croissant & Pastry Set',
    'La Paris Bakery',
    'Jl. Ijen No. 22, Malang',
    '3.1 km', 4.7, 156, 60000, 25000, 1,
    '30 Mnt',
    now() + interval '30 minutes',
    'Roti & Kue',
    'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80',
    'Set pastry lezat isi croissant butter dan pain au chocolat.',
    array['Gandum','Susu','Telur'],
    'laparis@savebites.com',
    (select id from public.profiles where name = 'La Paris Bakery' limit 1)
  );

alter table public.listings enable row level security;


-- ============================================================
--  BAGIAN 6: SEED PROFILES & SELLER LAIN (dummy)
--  Jalankan SETELAH buat akun demo di Authentication → Users:
--    buyer@savebites.com  / buyer123
--    seller@savebites.com / seller123
--
--  Ganti UUID_BUYER dan UUID_SELLER dengan UUID asli dari
--  Dashboard → Authentication → Users
-- ============================================================

-- Contoh (ganti UUID di bawah dengan UUID asli):
-- insert into public.profiles (id, name, role) values
--   ('UUID_BUYER',  'Sobat Penyelamat', 'buyer'),
--   ('UUID_SELLER', 'Toko Roti Mawar',  'seller');

-- Seller dummy lain (tanpa akun auth, hanya untuk data listing)
insert into public.profiles (id, name, role, address) values
  (gen_random_uuid(), 'Warung Bu Sri',  'seller', 'Jl. MT Haryono No. 45, Malang'),
  (gen_random_uuid(), 'Pasar Segar',    'seller', 'Jl. Tlogomas No. 8, Malang'),
  (gen_random_uuid(), 'La Paris Bakery','seller', 'Jl. Ijen No. 22, Malang')
on conflict do nothing;

-- Update seller_id dan seller_email per merchant
update public.listings l
set seller_id    = p.id,
    seller_email = case p.name
      when 'Warung Bu Sri'   then 'warungbusri@savebites.com'
      when 'Pasar Segar'     then 'pasarsegar@savebites.com'
      when 'La Paris Bakery' then 'laparis@savebites.com'
      else seller_email
    end
from public.profiles p
where l.merchant = p.name
  and p.name in ('Warung Bu Sri', 'Pasar Segar', 'La Paris Bakery');


-- ============================================================
--  BAGIAN 7: UPDATE merchant_location dari profile address
-- ============================================================

update public.listings l
set merchant_location = p.address
from public.profiles p
where l.seller_id = p.id
  and p.address is not null
  and p.address != '';


-- ============================================================
--  BAGIAN 8: AKTIFKAN REALTIME
--  Lakukan juga secara manual di:
--  Dashboard → Database → Replication → aktifkan toggle untuk:
--    - listings
--    - orders
--    - order_confirmations
-- ============================================================

-- (Realtime diaktifkan via Dashboard UI, tidak bisa lewat SQL)
-- Tabel yang perlu diaktifkan: listings, orders, order_confirmations


-- ============================================================
--  SELESAI
--  Langkah selanjutnya setelah run SQL ini:
--  1. Buat akun demo di Authentication → Users
--  2. Insert profiles buyer & seller dengan UUID asli (lihat Bagian 6)
--  3. Aktifkan Realtime di Dashboard → Database → Replication
--  4. Matikan email confirmation di Authentication → Settings
-- ============================================================