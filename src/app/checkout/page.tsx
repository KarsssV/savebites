'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Wallet, 
  ChevronRight, 
  Receipt,
  Clock,
  Store
} from 'lucide-react';

export default function CheckoutScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('Gopay');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const qtyParam = searchParams.get('qty');
      if (qtyParam) {
        setQty(parseInt(qtyParam, 10));
      }
    }
  }, []);

  // Mock data pesanan
  const orderData = {
    title: "Paket Roti Manis Sisa Hari Ini",
    merchant: "Toko Roti Mawar",
    merchantLocation: "Jl. Soekarno Hatta No. 12, Malang",
    distance: "1.2 km",
    price: 10000,
    qty: qty,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"
  };

  // Kalkulasi biaya
  const subtotal = orderData.price * orderData.qty;
  const appFee = 2000; // Biaya layanan aplikasi
  const total = subtotal + appFee;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center md:items-start md:p-8">
      
      <div className="w-full h-full min-h-screen md:min-h-0 md:max-w-5xl md:bg-transparent overflow-hidden flex flex-col md:flex-row gap-6">
        
        {/* =========================================
            KOLOM KIRI: Detail Pesanan & Pengambilan
        ========================================= */}
        <div className="w-full md:w-2/3 flex flex-col gap-2 md:gap-6">
          
          {/* Header (Mobile & Desktop) */}
          <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-20 md:rounded-3xl md:shadow-sm md:border md:border-divider">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft size={24} className="text-text-primary" />
            </button>
            <h1 className="text-lg font-extrabold text-text-primary">Konfirmasi Pesanan</h1>
          </div>

          {/* Area Pengambilan */}
          <div className="bg-white p-6 md:rounded-3xl md:shadow-sm md:border md:border-divider mt-2 md:mt-0">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Lokasi Pengambilan
            </h2>
            
            <div className="border border-divider rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-text-primary text-sm">{orderData.merchant}</h3>
                  <p className="text-xs text-text-secondary">{orderData.distance}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary pl-13 line-clamp-2">
                {orderData.merchantLocation}
              </p>
              
              <div className="mt-4 pt-4 border-t border-divider flex items-start gap-2">
                <Clock size={16} className="text-accent mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-text-primary">Waktu Pengambilan</span>
                  <span className="block text-xs text-text-secondary mt-0.5">Hari ini, sebelum 20:00 WIB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Item Pesanan */}
          <div className="bg-white p-6 md:rounded-3xl md:shadow-sm md:border md:border-divider mt-2 md:mt-0 mb-6 md:mb-0">
            <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Receipt size={18} className="text-primary" />
              Pesanan Kamu
            </h2>
            
            <div className="flex gap-4 items-center">
              <img 
                src={orderData.image} 
                alt={orderData.title} 
                className="w-20 h-20 rounded-xl object-cover border border-divider/50"
              />
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-text-primary line-clamp-2 leading-snug">
                  {orderData.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-secondary">{orderData.qty}x</span>
                  <span className="text-sm font-black text-primary">
                    {formatRupiah(orderData.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================
            KOLOM KANAN: Ringkasan & Pembayaran (Sticky di Desktop)
        ========================================= */}
        <div className="w-full md:w-1/3 md:sticky md:top-8 flex flex-col h-fit pb-32 md:pb-0">
          
          <div className="bg-white p-6 md:rounded-3xl md:shadow-sm md:border md:border-divider mt-2 md:mt-0">
            
            {/* Metode Pembayaran */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary mb-3">Metode Pembayaran</h2>
              <button className="w-full flex items-center justify-between border border-divider rounded-2xl p-4 hover:border-primary transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Wallet size={16} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-text-primary">{paymentMethod}</span>
                    <span className="text-[10px] text-text-secondary">Saldo: Rp 45.000</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-muted" />
              </button>
            </div>

            {/* Ringkasan Pembayaran */}
            <div>
              <h2 className="text-sm font-bold text-text-primary mb-3">Ringkasan Pembayaran</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Harga ({orderData.qty} item)</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Biaya Layanan Aplikasi</span>
                  <span>{formatRupiah(appFee)}</span>
                </div>
                <div className="border-t border-divider my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-primary">Total Pembayaran</span>
                  <span className="text-lg font-black text-primary">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>

            {/* Tombol Checkout Desktop (Disembunyikan di Mobile) */}
            <button 
              onClick={() => router.push('/payment-result')}
              className="hidden md:block w-full mt-8 bg-primary-gradient text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition transform active:scale-95"
            >
              Bayar Sekarang
            </button>
          </div>

        </div>

      </div>

      {/* =========================================
          BOTTOM FIXED BAR (Hanya untuk Mobile)
      ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-divider px-6 py-4 pb-safe z-50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted mb-0.5">Total Pembayaran</span>
            <span className="text-xl font-black text-primary leading-none">
              {formatRupiah(total)}
            </span>
          </div>
          
          <button 
            onClick={() => router.push('/payment-result')}
            className="bg-primary-gradient text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition transform active:scale-95"
          >
            Bayar
          </button>
        </div>
      </div>

    </main>
  );
}