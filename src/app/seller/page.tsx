'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Package, ShoppingBag, Star,
  Clock, Store, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth } from '@/lib/auth';
import {
  useSellerListings, useSellerOrders,
  confirmOrderCode, completeOrder,
  type Order
} from '@/lib/store';

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(angka);

export default function SellerDashboard() {
  const router = useRouter();
  const session = useRequireAuth('seller');

  // Gunakan hook yang sudah difilter per seller
  const listings = useSellerListings(session?.email ?? '');
  const orders = useSellerOrders(session?.email ?? '');

  // State modal konfirmasi pesanan
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!session) return null;

  const titleOf = (listingId: number) =>
    listings.find((l) => l.id === listingId)?.title ?? 'Makanan';

  const incoming = orders.filter((o) => o.status === 'Menunggu Diambil').length;

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setInputCode('');
    setCodeStatus('idle');
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setInputCode('');
    setCodeStatus('idle');
  };

  const handleVerifyCode = async () => {
    if (!selectedOrder) return;
    setIsConfirming(true);
    const valid = await confirmOrderCode(selectedOrder.id, inputCode);
    setCodeStatus(valid ? 'valid' : 'invalid');
    setIsConfirming(false);
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;
    await completeOrder(selectedOrder.id);
    handleCloseModal();
  };

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

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5">
                <Package size={18} className="text-primary mb-2" />
                <p className="text-2xl font-black text-text-primary leading-none">{listings.length}</p>
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
          <button
            onClick={() => router.push('/post-food')}
            className="w-full mb-8 py-4 bg-primary text-white font-extrabold rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Posting Makanan Baru
          </button>

          {/* Pesanan Masuk */}
          <div className="mb-10">
            <h2 className="text-lg font-extrabold text-text-primary mb-4">Pesanan Masuk</h2>
            {orders.length === 0 ? (
              <EmptyState text="Belum ada pesanan masuk." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    title={titleOf(o.listingId)}
                    onClick={() => o.status === 'Menunggu Diambil' ? handleOpenOrder(o) : null}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Makananku */}
            <div>
              <h2 className="text-lg font-extrabold text-text-primary mb-4">Makananku</h2>
              {listings.length === 0 ? (
                <EmptyState text="Belum ada makanan. Posting yang pertama!" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {listings.map((l) => (
                    <div key={l.id} className={`bg-white rounded-2xl p-2.5 border relative ${
                      l.stock === 0 ? 'border-gray-200 opacity-60' : 'border-divider/50'
                    }`}>
                      <div className="relative">
                        <img
                          src={l.image}
                          alt={l.title}
                          className="w-full h-28 rounded-xl object-cover mb-2"
                        />
                        {l.stock === 0 && (
                          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xs font-extrabold bg-black/60 px-3 py-1 rounded-lg">
                              HABIS
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-extrabold text-text-primary line-clamp-2 leading-snug">
                        {l.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-black text-primary">
                          {formatRupiah(l.discountPrice)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          l.stock === 0
                            ? 'bg-red-50 text-red-500'
                            : l.stock <= 2
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-cream text-text-secondary'
                        }`}>
                          {l.stock === 0 ? 'Habis' : `Sisa ${l.stock}`}
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

      {/* ── Modal Konfirmasi Pesanan ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-text-primary">Konfirmasi Pesanan</h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Info Pesanan */}
            <div className="bg-cream/50 rounded-2xl p-4 mb-6">
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Detail Pesanan</p>
              <h3 className="text-sm font-extrabold text-text-primary mb-1">
                {titleOf(selectedOrder.listingId)}
              </h3>
              <p className="text-xs text-text-secondary">
                Pembeli: <span className="font-bold text-text-primary">{selectedOrder.buyerName}</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Jumlah: <span className="font-bold text-text-primary">{selectedOrder.qty} porsi</span>
              </p>
            </div>

            {/* Input Kode Konfirmasi */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-text-primary mb-3">
                Masukkan Kode dari Pembeli
              </label>
              <div className={`flex items-center border-2 rounded-2xl px-4 py-3 transition ${
                codeStatus === 'valid' ? 'border-green-500 bg-green-50'
                : codeStatus === 'invalid' ? 'border-red-400 bg-red-50'
                : 'border-divider bg-gray-50'
              }`}>
                <input
                  type="text"
                  placeholder="Contoh: A1B2C3"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    setCodeStatus('idle');
                  }}
                  maxLength={6}
                  className={`w-full bg-transparent text-center text-2xl font-black tracking-[0.3em] focus:outline-none uppercase ${
                    codeStatus === 'valid' ? 'text-green-700'
                    : codeStatus === 'invalid' ? 'text-red-600'
                    : 'text-text-primary'
                  }`}
                />
              </div>

              {/* Feedback verifikasi */}
              {codeStatus === 'valid' && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-bold">
                  <CheckCircle2 size={18} />
                  Kode valid! Pesanan bisa diselesaikan.
                </div>
              )}
              {codeStatus === 'invalid' && (
                <div className="mt-3 flex items-center gap-2 text-red-500 text-sm font-bold">
                  <AlertCircle size={18} />
                  Kode salah. Minta pembeli cek ulang.
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-3">
              {codeStatus !== 'valid' ? (
                <button
                  onClick={handleVerifyCode}
                  disabled={inputCode.length < 6 || isConfirming}
                  className={`w-full py-4 rounded-2xl font-extrabold transition transform active:scale-95 ${
                    inputCode.length === 6 && !isConfirming
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:opacity-90'
                      : 'bg-gray-100 text-text-muted cursor-not-allowed'
                  }`}
                >
                  {isConfirming ? 'Memverifikasi...' : 'Verifikasi Kode'}
                </button>
              ) : (
                <button
                  onClick={handleCompleteOrder}
                  className="w-full py-4 bg-accent-gradient text-white rounded-2xl font-extrabold shadow-lg shadow-accent/30 hover:opacity-90 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Selesaikan Pesanan
                </button>
              )}

              <button
                onClick={handleCloseModal}
                className="w-full py-3 text-sm font-bold text-text-secondary hover:text-text-primary transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order, title, onClick
}: {
  order: Order;
  title: string;
  onClick: () => void;
}) {
  const isActive = order.status === 'Menunggu Diambil';

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition ${
        isActive
          ? 'border-primary/30 bg-primary/5 hover:shadow-md hover:border-primary/50 cursor-pointer'
          : 'border-divider bg-white cursor-default'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <StatusBadge status={order.status} />
        <span className="flex items-center gap-1 text-[11px] text-text-muted">
          <Clock size={12} /> {order.time}
        </span>
      </div>

      <h3 className="text-sm font-bold text-text-primary line-clamp-1">{title}</h3>
      <p className="text-xs text-text-secondary mt-1">
        {order.buyerName} • {order.qty} porsi
      </p>

      {isActive && (
        <div className="mt-3 pt-3 border-t border-divider/50">
          <p className="text-xs text-primary font-bold flex items-center gap-1">
            👆 Klik untuk konfirmasi pengambilan
          </p>
        </div>
      )}

      {typeof order.rating === 'number' && (
        <div className="mt-3 pt-3 border-t border-divider">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= order.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
              />
            ))}
          </div>
          {order.review && (
            <p className="text-xs text-text-secondary italic">"{order.review}"</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'Menunggu Diambil' ? 'bg-accent/10 text-accent'
    : status === 'Dibatalkan' ? 'bg-red-50 text-red-500'
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