-- ============================================================
--  SAVEBITES — SUPABASE DATABASE SETUP
--  Jalankan seluruh file ini sekali di SQL Editor Supabase
--  Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================


-- ============================================================
--  BAGIAN 1: BUAT TABEL
-- ============================================================

-- Tabel profil pengguna
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  name          text not null,
  role          text not null check (role in ('buyer', 'seller')),
  phone         text,
  bio           text,
  address       text,
  lat           double precision,
  lng           double precision,
  payment_methods jsonb default '[]'::jsonb,
  created_at    timestamptz default now()
);

-- Tabel listing makanan
create table if not exists public.listings (
  id                bigserial primary key,
  title             text not null,
  merchant          text not null,
  merchant_location text not null,
  distance          text not null,
  rating            numeric default 5,
  reviews           int default 0,
  original_price    int not null,
  discount_price    int not null,
  stock             int not null,
  time_left         text not null,
  expired_at        timestamptz,
  category          text not null,
  image             text not null,
  description       text,
  allergens         text[] default '{}',
  seller_email      text not null,
  seller_id         uuid references public.profiles(id),
  created_at        timestamptz default now()
);

-- Tabel pesanan
create table if not exists public.orders (
  id            bigserial primary key,
  listing_id    bigint references public.listings(id),
  buyer_email   text not null,
  buyer_name    text not null,
  seller_email  text not null,
  seller_id     uuid references public.profiles(id),
  qty           int not null default 1,
  time          text not null,
  status        text not null default 'Menunggu Diambil'
                  check (status in ('Menunggu Diambil', 'Selesai', 'Dibatalkan')),
  rating        int,
  review        text,
  created_at    timestamptz default now()
);

-- Tabel kode konfirmasi pengambilan
create table if not exists public.order_confirmations (
  id           bigserial primary key,
  order_id     bigint references public.orders(id) on delete cascade unique,
  code         text not null,
  confirmed_at timestamptz,
  created_at   timestamptz default now()
);


-- ============================================================
--  BAGIAN 2: ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles           enable row level security;
alter table public.listings           enable row level security;
alter table public.orders             enable row level security;
alter table public.order_confirmations enable row level security;


-- ============================================================
--  BAGIAN 3: POLICIES
-- ============================================================

-- ── profiles ──
drop policy if exists "profiles_select_all"  on public.profiles;
drop policy if exists "profiles_insert_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;

create policy "profiles_select_all"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (true);

-- ── listings ──
drop policy if exists "listings_select_all"    on public.listings;
drop policy if exists "listings_insert_seller" on public.listings;

create policy "listings_select_all"
  on public.listings for select using (true);

create policy "listings_insert_seller"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "listings_update_seller"
  on public.listings for update
  using (true);

-- ── orders ──
drop policy if exists "orders_select_all"   on public.orders;
drop policy if exists "orders_insert_auth"  on public.orders;
drop policy if exists "orders_update_auth"  on public.orders;

create policy "orders_select_all"
  on public.orders for select using (true);

create policy "orders_insert_auth"
  on public.orders for insert
  with check (auth.uid() is not null);

create policy "orders_update_auth"
  on public.orders for update
  using (auth.uid() is not null);

-- ── order_confirmations ──
drop policy if exists "confirmations_select_all"  on public.order_confirmations;
drop policy if exists "confirmations_insert_auth" on public.order_confirmations;
drop policy if exists "confirmations_update_auth" on public.order_confirmations;

create policy "confirmations_select_all"
  on public.order_confirmations for select using (true);

create policy "confirmations_insert_auth"
  on public.order_confirmations for insert
  with check (auth.uid() is not null);

create policy "confirmations_update_auth"
  on public.order_confirmations for update
  using (auth.uid() is not null);


-- ============================================================
--  BAGIAN 4: TRIGGERS (stok otomatis berkurang/bertambah)
-- ============================================================

-- Kurangi stok saat order dibuat
create or replace function decrease_stock()
returns trigger as $$
begin
  update public.listings
  set stock = stock - new.qty
  where id = new.listing_id
    and stock >= new.qty;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_order_created on public.orders;
create trigger on_order_created
  after insert on public.orders
  for each row execute function decrease_stock();

-- Kembalikan stok saat order dibatalkan
create or replace function restore_stock()
returns trigger as $$
begin
  if new.status = 'Dibatalkan' and old.status != 'Dibatalkan' then
    update public.listings
    set stock = stock + new.qty
    where id = new.listing_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_order_cancelled on public.orders;
create trigger on_order_cancelled
  after update on public.orders
  for each row execute function restore_stock();


