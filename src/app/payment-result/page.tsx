'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { useRequireAuth } from '@/lib/auth';

export default function PaymentResultScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');

  const [isSuccess] = useState(true);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedCode = sessionStorage.getItem('savebites:last_order_code');
    if (savedCode) setCode(savedCode);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) return null;

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-divider flex flex-col items-center text-center relative overflow-hidden">

        <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">

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

          <h1 className="text-2xl font-extrabold text-text-primary mb-3">
            Pembayaran Berhasil!
          </h1>

          <p className="text-sm text-text-secondary leading-relaxed mb-8 px-4">
            Tunjukkan kode ini ke penjual saat mengambil makananmu.
          </p>

          {/* Kode Konfirmasi */}
          {code && (
            <div className="w-full bg-cream/50 border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center mb-8 gap-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                Kode Pengambilan
              </p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black tracking-[0.3em] text-primary">
                  {code}
                </span>
                <button
                  onClick={handleCopy}
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary/20 transition"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-text-muted">
                Kode ini hanya berlaku untuk pesanan ini
              </p>
            </div>
          )}
        </div>

        <div className="w-full mt-4 flex flex-col gap-3">
          <button
            onClick={() => router.push('/history')}
            className="w-full bg-primary text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition transform active:scale-95"
          >
            Lihat Pesanan
          </button>
          <button
            onClick={() => router.push('/home')}
            className="w-full bg-white border-2 border-divider text-text-secondary font-extrabold px-8 py-4 rounded-2xl hover:bg-gray-50 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </main>
  );
}