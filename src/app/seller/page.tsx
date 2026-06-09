'use client';

import { useRouter } from 'next/navigation';
import { Plus, Package, ShoppingBag, Star, Clock, Store } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth } from '@/lib/auth';
import { useListings, useOrders } from '@/lib/store';

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default function SellerDashboard() {
  const router = useRouter();
  const session = useRequireAuth('seller'); // hanya penjual
  const listings = useListings();
  const orders = useOrders();

  if (!session) return null;

  const myListings = listings.filter((l) => l.sellerEmail === session.email);
  const myOrders = orders.filter((o) => o.sellerEmail === session.email);

  const titleOf = (listingId: number) => listings.find((l) => l.id === listingId)?.title ?? 'Makanan';
  const incoming = myOrders.filter((o) => o.status === 'Menunggu Diambil').length;

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">
        {/* Header */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-[180px] bg-primary-gradient rounded-b-3xl md:rounded-none z-0" />
          <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 md:pt-8 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white">
                <Store size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/80 text-xs">Dasbor Penjual</span>
                <span className="text-white text-base font-extrabold">{session.name}</span>
              </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5">
                <Package size={18} className="text-primary mb-2" />
                <p className="text-2xl font-black text-text-primary leading-none">{myListings.length}</p>
                <p className="text-xs text-text-secondary mt-1">Makanan Tayang</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5">
                <ShoppingBag size={18} className="text-accent mb-2" />
                <p className="text-2xl font-black text-text-primary leading-none">{incoming}</p>
                <p className="text-xs text-text-secondary mt-1">Pesanan Aktif</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-12">
          {/* Tombol Posting */}
          <button
            onClick={() => router.push('/post-food')}
            className="w-full mb-8 py-4 bg-primary text-white font-extrabold rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Posting Makanan Baru
          </button>

          {/* Pesanan Masuk */}
          <div className="mb-10">
            <h2 className="text-lg font-extrabold text-text-primary mb-4">Pesanan Masuk</h2>
            {myOrders.length === 0 ? (
              <EmptyState text="Belum ada pesanan masuk." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myOrders.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl p-5 border border-divider">
                    <div className="flex justify-between items-center mb-3">
                      <StatusBadge status={o.status} />
                      <span className="flex items-center gap-1 text-[11px] text-text-muted">
                        <Clock size={12} /> {o.time}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-primary line-clamp-1">{titleOf(o.listingId)}</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      {o.buyerName} • {o.qty} porsi
                    </p>

                    {/* Ulasan dari pembeli (jika ada) */}
                    {typeof o.rating === 'number' && (
                      <div className="mt-3 pt-3 border-t border-divider">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={s <= o.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                        {o.review && <p className="text-xs text-text-secondary italic">“{o.review}”</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Makananku */}
          <div>
            <h2 className="text-lg font-extrabold text-text-primary mb-4">Makananku</h2>
            {myListings.length === 0 ? (
              <EmptyState text="Belum ada makanan. Posting yang pertama!" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {myListings.map((l) => (
                  <div key={l.id} className="bg-white rounded-2xl p-2.5 border border-divider/50">
                    <img src={l.image} alt={l.title} className="w-full h-28 rounded-xl object-cover mb-2" />
                    <h3 className="text-xs font-extrabold text-text-primary line-clamp-2 leading-snug">{l.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-primary">{formatRupiah(l.discountPrice)}</span>
                      <span className="text-[10px] font-bold text-text-secondary bg-cream px-2 py-0.5 rounded-md">
                        Sisa {l.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'Menunggu Diambil'
      ? 'bg-accent/10 text-accent'
      : status === 'Dibatalkan'
        ? 'bg-red-50 text-red-500'
        : 'bg-primary/10 text-primary';
  return <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${styles}`}>{status}</span>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white border border-dashed border-divider rounded-2xl py-10 text-center text-sm text-text-muted font-bold">
      {text}
    </div>
  );
}
