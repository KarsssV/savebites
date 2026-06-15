'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Receipt,
  Clock, Store, Banknote
} from 'lucide-react';
import { useRequireAuth } from '@/lib/auth';
import { useListings, addOrder } from '@/lib/store';

export default function CheckoutScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');
  const listings = useListings();
  const [isLoading, setIsLoading] = useState(false);

  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams('');
  const listingId = Number(params.get('id')) || (listings[0]?.id ?? 1);
  const qty = Math.max(1, Number(params.get('qty')) || 1);
  const listing = listings.find((l) => l.id === listingId) ?? listings[0];

  const price = listing?.discountPrice ?? 0;
  const subtotal = price * qty;
  const appFee = 2000;
  const total = subtotal + appFee;

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(n);

  const handlePay = async () => {
    if (!session || !listing) return;
    setIsLoading(true);

    const result = await addOrder({
      listingId: listing.id,
      buyerEmail: session.email,
      buyerName: session.name,
      sellerEmail: listing.sellerEmail,
      qty,
    });

    setIsLoading(false);

    if (!result) {
      alert('Gagal membuat pesanan, coba lagi.');
      return;
    }

    sessionStorage.setItem('savebites:last_order_code', result.code);
    sessionStorage.setItem('savebites:last_order_id', String(result.order.id));
    router.push('/payment-result');
  };

  if (!session) return null;
  if (!listing) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-text-muted font-bold">Memuat data...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center md:items-start md:p-8">
      <div className="w-full h-full min-h-screen md:min-h-0 md:max-w-5xl overflow-hidden flex flex-col md:flex-row gap-6">

        {/* KOLOM KIRI */}
        <div className="w-full md:w-2/3 flex flex-col gap-2 md:gap-6">

          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-20 md:rounded-3xl md:shadow-sm md:border md:border-divider">
            <button onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
              <ArrowLeft size={24} className="text-text-primary" />
            </button>
            <h1 className="text-lg font-extrabold text-text-primary">Konfirmasi Pesanan</h1>
          </div>

          {/* Lokasi Pengambilan */}
          <div className="bg-white p-6 md:rounded-3xl md:shadow-sm md:border md:border-divider mt-2 md:mt-0">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" /> Lokasi Pengambilan
            </h2>
            <div className="border border-divider rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-text-primary text-sm">{listing.merchant}</h3>
                  <p className="text-xs text-text-secondary">{listing.distance}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">{listing.merchantLocation}</p>
              <div className="mt-4 pt-4 border-t border-divider flex items-start gap-2">
                <Clock size={16} className="text-accent mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-text-primary">Waktu Pengambilan</span>
                  <span className="block text-xs text-text-secondary mt-0.5">
                    Hari ini, dalam {listing.timeLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Item */}
          <div className="bg-white p-6 md:rounded-3xl md:shadow-sm md:border md:border-divider mt-2 md:mt-0 mb-6 md:mb-0">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Receipt size={18} className="text-primary" /> Pesanan Kamu
            </h2>
            <div className="flex gap-4 items-center">
              <img src={listing.image} alt={listing.title}
                className="w-20 h-20 rounded-xl object-cover border border-divider/50" />
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-text-primary line-clamp-2 leading-snug">
                  {listing.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-secondary">{qty}x</span>
                  <span className="text-sm font-black text-primary">{formatRupiah(price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="w-full md:w-1/3 md:sticky md:top-8 flex flex-col h-fit pb-32 md:pb-0">
          <div className="bg-white p-6 md:rounded-3xl md:shadow-sm md:border md:border-divider mt-2 md:mt-0">

            {/* Metode Pembayaran — COD Only */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary mb-3">Metode Pembayaran</h2>
              <div className="w-full flex items-center gap-3 border-2 border-primary/30 bg-primary/5 rounded-2xl p-4">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Banknote size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-primary">Bayar di Tempat (COD)</span>
                  <span className="text-[11px] text-text-secondary mt-0.5">
                    Bayar langsung ke merchant saat mengambil pesanan
                  </span>
                </div>
              </div>
            </div>

            {/* Ringkasan */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary mb-3">Ringkasan Pembayaran</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Harga ({qty} item)</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Biaya Layanan</span>
                  <span>{formatRupiah(appFee)}</span>
                </div>
                <div className="border-t border-divider my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-primary">Total</span>
                  <span className="text-lg font-black text-primary">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>

            {/* Info COD */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-6">
              <p className="text-xs text-amber-700 leading-relaxed">
                💡 Siapkan uang pas sebesar <span className="font-extrabold">{formatRupiah(total)}</span> saat mengambil pesanan di merchant.
              </p>
            </div>

            {/* Tombol Desktop */}
            <button
              onClick={handlePay}
              disabled={isLoading}
              className="hidden md:block w-full bg-primary-gradient text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Konfirmasi Pesanan'}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-divider px-6 py-4 z-50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted mb-0.5">Total (COD)</span>
            <span className="text-xl font-black text-primary">{formatRupiah(total)}</span>
          </div>
          <button
            onClick={handlePay}
            disabled={isLoading}
            className="bg-primary-gradient text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg disabled:opacity-50 transition active:scale-95"
          >
            {isLoading ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </main>
  );
}