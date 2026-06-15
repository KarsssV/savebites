'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
import { useRequireAuth } from '@/lib/auth';
import { cancelOrder } from '@/lib/store';

// Daftar alasan sesuai dengan kode Flutter asli
const REASONS = [
  'Ingin mengganti metode pembayaran',
  'Ingin menambah/mengurangi pesanan',
  'Waktu pengambilan tidak pas',
  'Lokasi merchant terlalu jauh',
  'Menemukan opsi makanan lain',
  'Lainnya'
];

export default function CancellationScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');

  // State untuk menyimpan alasan yang dipilih
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  if (!session) return null;

  const orderId = Number(new URLSearchParams(window.location.search).get('orderId')) || 0;

  // Ganti handleCancelOrder menjadi:
  const handleCancelOrder = async () => {
    if (orderId) await cancelOrder(orderId);
    alert('Pesanan berhasil dibatalkan');
    router.push('/history');
  };

  return (
    <main className="min-h-screen bg-cream flex justify-center md:p-8">
      
      {/* Container utama: 
          Full screen di HP, menjadi modal/kartu di layar besar (Desktop)
      */}
      <div className="w-full h-full min-h-screen md:min-h-0 md:max-w-md bg-cream md:bg-white md:rounded-[2.5rem] md:shadow-2xl flex flex-col relative pb-24 md:pb-8">
        
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="px-6 py-5 flex items-center justify-center relative bg-white md:bg-transparent border-b border-divider md:border-none md:pt-8 z-10">
          <button 
            onClick={() => router.back()}
            className="absolute left-6 p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-extrabold text-text-primary">Batalkan Pesanan</h1>
        </div>

        {/* =========================================
            KONTEN AREA
        ========================================= */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-6">
          
          {/* Banner Peringatan */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-8">
            <Info size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 leading-relaxed">
              Pesanan yang sudah dibatalkan tidak dapat dikembalikan lagi.
            </p>
          </div>

          <h2 className="text-base font-extrabold text-text-primary mb-4">
            Kenapa kamu ingin membatalkan pesanan ini?
          </h2>

          {/* Daftar Pilihan Alasan */}
          <div className="flex flex-col gap-3">
            {REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              
              return (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                    isSelected 
                      ? 'border-red-500 bg-red-50/30 shadow-sm' 
                      : 'border-divider bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`text-sm ${isSelected ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
                    {reason}
                  </span>
                  
                  {/* Custom Radio Icon */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-red-500' : 'border-text-muted'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* =========================================
            BOTTOM ACTION BAR
        ========================================= */}
        <div className="fixed md:absolute bottom-0 left-0 right-0 w-full bg-white md:bg-transparent border-t border-divider md:border-none px-6 py-4 pb-safe z-50">
          <button 
            disabled={!selectedReason}
            onClick={handleCancelOrder}
            className={`w-full font-extrabold px-8 py-4 rounded-2xl transition transform active:scale-95 ${
              selectedReason 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Batalkan Pesanan
          </button>
        </div>

      </div>
    </main>
  );
}