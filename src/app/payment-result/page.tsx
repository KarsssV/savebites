'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, QrCode } from 'lucide-react';

export default function PaymentResultScreen() {
  const router = useRouter();
  
  // State sementara untuk keperluan UI/UX Testing. 
  // Ubah ke 'false' untuk melihat tampilan Gagal.
  const [isSuccess, setIsSuccess] = useState(true);

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6 md:p-8">
      
      {/* Container utama: 
          Lebar maksimal diset agar menyerupai 'Card/Modal' yang rapi di tengah layar Desktop,
          namun tetap responsif merenggang di HP.
      */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-divider flex flex-col items-center text-center relative overflow-hidden">
        
        {/* =========================================
            TOMBOL RAHASIA UNTUK TESTING (Bisa Dihapus Nanti)
        ========================================= */}
        <button 
          onClick={() => setIsSuccess(!isSuccess)}
          className="absolute top-4 right-4 text-[10px] bg-gray-100 text-text-muted px-2 py-1 rounded-md hover:bg-gray-200 transition"
        >
          Toggle Status
        </button>

        <div className="flex-1 flex flex-col items-center justify-center w-full mt-8">
          
          {/* Ikon Status */}
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-inner ${
            isSuccess ? 'bg-primary/10' : 'bg-red-50'
          }`}>
            {isSuccess ? (
              <CheckCircle2 size={64} className="text-primary" />
            ) : (
              <XCircle size={64} className="text-red-500" />
            )}
          </div>

          {/* Judul & Subjudul */}
          <h1 className="text-2xl font-extrabold text-text-primary mb-3">
            {isSuccess ? 'Pembayaran Berhasil!' : 'Pembayaran Gagal'}
          </h1>
          
          <p className="text-sm text-text-secondary leading-relaxed mb-8 px-4">
            {isSuccess 
              ? 'Hore! Makananmu berhasil diselamatkan. Tunjukkan QR Code ini ke kasir merchant ya.' 
              : 'Aduh, pembayaranmu gagal diproses. Coba pakai metode lain yuk.'}
          </p>

          {/* =========================================
              KODE QR (Hanya Tampil Jika Berhasil)
          ========================================= */}
          {isSuccess && (
            <div className="w-full bg-cream/30 border border-divider rounded-2xl p-6 flex flex-col items-center mb-8">
              <QrCode size={120} className="text-text-primary mb-4" />
              <div className="bg-primary/10 px-4 py-2 rounded-xl">
                <span className="text-sm font-black tracking-widest text-primary">
                  KODE: SVB-883921
                </span>
              </div>
            </div>
          )}

        </div>

        {/* =========================================
            TOMBOL AKSI BAWAH
        ========================================= */}
        <div className="w-full mt-auto flex flex-col gap-3">
          {isSuccess ? (
            <button 
              onClick={() => router.push('/home')}
              className="w-full bg-accent-gradient text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-accent/30 hover:opacity-90 transition transform active:scale-95"
            >
              Kembali ke Beranda
            </button>
          ) : (
            <>
              <button 
                onClick={() => router.back()} // Asumsi kembali ke halaman Checkout
                className="w-full bg-accent-gradient text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-accent/30 hover:opacity-90 transition transform active:scale-95"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => router.push('/home')}
                className="w-full bg-white border-2 border-divider text-text-secondary font-extrabold px-8 py-4 rounded-2xl hover:bg-gray-50 transition transform active:scale-95"
              >
                Kembali ke Beranda
              </button>
            </>
          )}
        </div>

      </div>
    </main>
  );
}