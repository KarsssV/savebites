'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Star, MapPin, Clock, XCircle, Hash } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth } from '@/lib/auth';
import { useBuyerOrders, useListings } from '@/lib/store';

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(angka);

export default function HistoryScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');
  const orders = useBuyerOrders(session?.email ?? '');
  const listings = useListings();

  if (!session) return null;

const enriched = orders
  .map((o) => {
    const l = listings.find((x) => x.id === o.listingId);
    return {
      ...o,
      title: l?.title ?? 'Makanan',
      image: l?.image ?? null,          
      merchant: l?.merchant ?? '',
      totalPrice: (l?.discountPrice ?? 0) * o.qty + 2000,
    };
  })
  .filter((o) => o.image !== null);    

  const activeOrders = enriched.filter((o) => o.status === 'Menunggu Diambil');
  const pastOrders = enriched.filter((o) => o.status !== 'Menunggu Diambil');

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">
        <div className="w-full min-h-screen bg-white overflow-hidden flex flex-col relative pb-24 md:pb-8">
          <div className="px-6 py-6 border-b border-divider flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition md:hidden"
              >
                <ArrowLeft size={24} className="text-text-primary" />
              </button>
              <h1 className="text-2xl font-extrabold text-text-primary">Riwayat Pesanan</h1>
            </div>
            <History size={20} className="text-text-muted" />
          </div>

          <div className="w-full max-w-5xl mx-auto p-6 overflow-y-auto">
            <div className="mb-10">
              <h2 className="text-lg font-extrabold text-text-primary mb-4">Sedang Berlangsung</h2>
              {activeOrders.length === 0 ? (
                <p className="text-sm text-text-muted font-bold">Belum ada pesanan aktif.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOrders.map((order) => (
                    <HistoryCard key={order.id} data={order} router={router} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-text-primary mb-4">Selesai</h2>
              {pastOrders.length === 0 ? (
                <p className="text-sm text-text-muted font-bold">Belum ada riwayat.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastOrders.map((order) => (
                    <HistoryCard key={order.id} data={order} router={router} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HistoryCard({ data, router }: { data: any; router: any }) {
  const isActive = data.status === 'Menunggu Diambil';
  const isCancelled = data.status === 'Dibatalkan';

  // Ambil kode dari sessionStorage jika ini pesanan terakhir
  const savedCode = typeof window !== 'undefined'
    ? sessionStorage.getItem('savebites:last_order_code') ?? ''
    : '';
  const savedOrderId = typeof window !== 'undefined'
    ? sessionStorage.getItem('savebites:last_order_id') ?? ''
    : '';
  const code = String(data.id) === savedOrderId ? savedCode : (data.confirmationCode ?? '');

  return (
    <div className={`p-5 rounded-2xl border ${isActive
      ? 'border-primary/30 shadow-lg shadow-primary/5 bg-primary/5'
      : 'border-divider bg-white'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
          isActive ? 'bg-accent/10 text-accent'
          : isCancelled ? 'bg-red-50 text-red-500'
          : 'bg-primary/10 text-primary'}`}>
          {data.status}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-text-muted">
          <Clock size={12} /> {data.time}
        </div>
      </div>

      <div className="flex gap-4 items-center mb-4">
        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            className="w-16 h-16 rounded-xl object-cover border border-divider/50 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-100 border border-divider/50 shrink-0 flex items-center justify-center">
            <span className="text-2xl">🍱</span>
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-text-primary line-clamp-1">{data.title}</h3>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <MapPin size={12} /> {data.merchant}
          </p>
        </div>
      </div>

      {/* Tampilkan kode konfirmasi jika pesanan aktif */}
      {isActive && code && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <Hash size={16} className="text-primary shrink-0" />
          <div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Kode Pengambilan</p>
            <p className="text-lg font-black tracking-widest text-primary">{code}</p>
          </div>
        </div>
      )}

      <div className="border-t border-divider my-4"></div>

      <div className="flex justify-between items-center mb-5">
        <span className="text-xs text-text-secondary">Total Belanja</span>
        <span className="text-sm font-extrabold text-primary">{formatRupiah(data.totalPrice)}</span>
      </div>

      {isActive ? (
        <button
          onClick={() => router.push(`/cancellation?orderId=${data.id}`)}
          className="w-full py-3 bg-white border border-red-300 text-red-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition"
        >
          <XCircle size={16} /> Batalkan Pesanan
        </button>
      ) : isCancelled ? (
        <p className="text-center text-xs font-bold text-red-400 py-2">Pesanan dibatalkan</p>
      ) : typeof data.rating === 'number' ? (
        <div className="flex items-center justify-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={16} className={s <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
          ))}
          <span className="text-xs text-text-secondary ml-2">Sudah dinilai</span>
        </div>
      ) : (
        <button
          onClick={() => router.push(`/rating?orderId=${data.id}&merchant=${encodeURIComponent(data.merchant)}`)}
          className="w-full py-3 bg-white border border-primary text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition"
        >
          <Star size={16} /> Beri Penilaian
        </button>
      )}
    </div>
  );
}