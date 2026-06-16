This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


# SaveBites - Setup Guide

## Prerequisites

Pastikan perangkat telah terinstal:

* Node.js (versi 18 atau lebih baru)
* npm
* Git
* Akun Supabase

---

## 1. Clone Repository

```bash
git clone <repository-url>
cd savebites
```

---

## 2. Install Dependencies

Jalankan perintah berikut untuk menginstal seluruh dependency yang diperlukan:

```bash
npm install
```

Install package tambahan yang digunakan dalam proyek:

```bash
npm install @supabase/supabase-js
```

```bash
npm install leaflet react-leaflet
```

```bash
npm install --save-dev @types/leaflet
```

Jika ingin menggunakan Supabase CLI:

```bash
npm install -g supabase
```

---

## 3. Membuat Project Supabase

1. Buka dashboard Supabase.
2. Login atau buat akun baru.
3. Klik **New Project**.
4. Berikan nama project:

```text
SaveBites
```

5. Tentukan password database sesuai kebutuhan.
6. Tunggu hingga proses provisioning selesai.

---

## 4. Konfigurasi Environment Variables

Pada dashboard Supabase:

1. Klik tombol **Connect** pada bagian atas halaman project.
2. Cari bagian API Configuration.
3. Salin nilai berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Buat file `.env.local` pada root project:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

---

## 5. Setup Database Schema

1. Buka menu **SQL Editor** pada dashboard Supabase.
2. Buka file:

```text
supabase-db-setup.sql
```

3. Salin seluruh isi file tersebut.
4. Tempel pada SQL Editor.
5. Jalankan query untuk membuat seluruh tabel dan struktur database yang dibutuhkan.

---

## 6. Membuat Akun Pengguna

Pada dashboard Supabase:

1. Buka menu:

```text
Authentication → Users
```

2. Klik **Add User**.
3. Pilih **Create New User**.
4. Buat akun untuk Seller dan Buyer.

Contoh:

### Seller

```text
Email    : warungbusri@savebites.com
Password : warungbusri123
```

### Buyer

```text
Email    : buyersetia@savebites.com
Password : buyersetia123
```

5. Klik **Create User**.

---

## 7. Menyesuaikan User UID

Setelah user berhasil dibuat:

1. Klik salah satu user pada halaman Authentication.
2. Salin nilai **User UID** yang terdapat pada halaman Overview.

Contoh:

```text
e7c9c8f2-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 8. Insert Initial Data

Buka file:

```text
supabase-db-insert.sql
```

Pada bagian:

```sql
insert into public.profiles (...)
```

ganti setiap:

```sql
gen_random_uuid()
```

dengan User UID yang sesuai dengan akun yang telah dibuat sebelumnya.

Contoh:

### Akun Seller

```text
warungbusri@savebites.com
```

gunakan UID milik akun Seller tersebut.

### Akun Buyer

```text
buyersetia@savebites.com
```

gunakan UID milik akun Buyer tersebut.

Setelah seluruh UID sesuai:

1. Salin isi file `supabase-db-insert.sql`.
2. Tempel ke SQL Editor.
3. Jalankan query untuk mengisi data awal (seed data).

---

## 9. Menjalankan Aplikasi

Jalankan development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Aplikasi dapat diakses melalui:

```text
http://localhost:3000
```

---

## Test Accounts

### Seller

```text
Email    : warungbusri@savebites.com
Password : warungbusri123
```

### Buyer

```text
Email    : buyersetia@savebites.com
Password : buyersetia123
```

---

## Technology Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* Leaflet
* React Leaflet

---

## Notes

* Pastikan file `.env.local` tidak diunggah ke repository publik.
* Seluruh perubahan database sebaiknya disimpan dalam file SQL migration untuk memudahkan sinkronisasi antar anggota tim.
* Jika menggunakan Supabase CLI, pastikan Docker Desktop telah terinstal dan berjalan.

<!-- First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file. -->

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Account
Demo accounts (also shown as a hint on the login screen):

Role	Email	Password
Pembeli (buyer)	buyer@savebites.com	buyer123
Penjual (seller)	seller@savebites.com	seller123

photos:
Minuman: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
Snack: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

