'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, History, QrCode, Star, MapPin, Clock, XCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth } from '@/lib/auth';
import { useOrders, useListings } from '@/lib/store';

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default function HistoryScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');
  const orders = useOrders();
  const listings = useListings();

  if (!session) return null;

  // Pesanan milik pembeli ini, diperkaya dengan data makanan.
  const enriched = orders
    .filter((o) => o.buyerEmail === session.email)
    .map((o) => {
      const l = listings.find((x) => x.id === o.listingId);
      return {
        ...o,
        title: l?.title ?? 'Makanan',
        image: l?.image ?? '',
        merchant: l?.merchant ?? '',
        totalPrice: (l?.discountPrice ?? 0) * o.qty + 2000,
      };
    });

  const activeOrders = enriched.filter((o) => o.status === 'Menunggu Diambil');
  const pastOrders = enriched.filter((o) => o.status !== 'Menunggu Diambil');

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">
        <div className="w-full min-h-screen bg-white overflow-hidden flex flex-col relative pb-24 md:pb-8">
          {/* HEADER */}
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
            <div className="w-10 h-10 border border-divider rounded-full flex items-center justify-center bg-gray-50 text-text-primary">
              <History size={20} />
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto p-6 overflow-y-auto">
            {/* Section: Sedang Berlangsung */}
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

            {/* Section: Selesai / Dibatalkan */}
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

  return (
    <div className={`p-5 rounded-2xl border ${isActive ? 'border-primary/30 shadow-lg shadow-primary/5 bg-primary/5' : 'border-divider bg-white'}`}>
      {/* Badge Status & Tanggal */}
      <div className="flex justify-between items-center mb-4">
        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${isActive ? 'bg-accent/10 text-accent' : isCancelled ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
          {data.status}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-text-muted">
          <Clock size={12} />
          {data.time}
        </div>
      </div>

      {/* Info Makanan */}
      <div className="flex gap-4 items-center mb-4">
        <img
          src={data.image}
          alt={data.title}
          className="w-16 h-16 rounded-xl object-cover border border-divider/50 shrink-0"
        />
        <div>
          <h3 className="text-sm font-bold text-text-primary line-clamp-1">{data.title}</h3>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <MapPin size={12} /> {data.merchant}
          </p>
        </div>
      </div>

      <div className="border-t border-divider my-4"></div>

      {/* Total Belanja */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-xs text-text-secondary">Total Belanja</span>
        <span className="text-sm font-extrabold text-primary">{formatRupiah(data.totalPrice)}</span>
      </div>

      {/* Aksi Berdasarkan Status */}
      {isActive ? (
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/payment-result')}
            className="flex-1 py-3 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-md shadow-primary/20"
          >
            <QrCode size={16} /> QR Code
          </button>
          <button
            onClick={() => router.push(`/cancellation?orderId=${data.id}`)}
            className="flex-1 py-3 bg-white border border-red-300 text-red-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition"
          >
            <XCircle size={16} /> Batalkan
          </button>
        </div>
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
