'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';

export default function RatingScreen() {
  const router = useRouter();
  
  // State untuk menyimpan jumlah bintang dan teks ulasan
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [merchantName, setMerchantName] = useState("Merchant");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const m = searchParams.get('merchant');
      if (m) setMerchantName(m);
    }
  }, []);

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center md:p-8">
      
      {/* Container utama: 
          Full screen di HP, menjadi modal/kartu di layar besar (Desktop)
      */}
      <div className="w-full h-screen md:h-auto md:max-w-md bg-white md:rounded-[2.5rem] md:shadow-2xl flex flex-col overflow-hidden">
        
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="px-6 py-5 flex items-center justify-center relative border-b border-divider">
          <button 
            onClick={() => router.back()}
            className="absolute left-6 p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-extrabold text-text-primary">Penilaian</h1>
        </div>

        {/* =========================================
            KONTEN AREA
        ========================================= */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center">
          
          {/* Avatar Merchant */}
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-extrabold text-primary">
              {merchantName.charAt(0)}
            </span>
          </div>

          <p className="text-sm text-text-secondary text-center mb-1">
            Bagaimana pengalamanmu dengan
          </p>
          <h2 className="text-xl font-extrabold text-text-primary text-center mb-10 leading-tight">
            {merchantName}
          </h2>

          {/* Star Rating Interaktif */}
          <div className="flex justify-center gap-2 mb-10">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <button
                key={starIndex}
                onClick={() => setRating(starIndex)}
                className="p-1 transition-transform transform hover:scale-110 active:scale-90"
              >
                <Star 
                  size={44} 
                  className={`transition-colors duration-200 ${
                    starIndex <= rating 
                      ? "fill-yellow-400 text-yellow-400" // Menyala
                      : "text-gray-200" // Mati
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Review Text Field */}
          <div className="w-full mb-8">
            <label className="block text-sm font-bold text-text-primary mb-3">
              Tulis ulasan (Opsional)
            </label>
            <textarea 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              placeholder="Beri tahu kami pendapatmu tentang makanan ini..."
              className="w-full bg-white border border-divider rounded-2xl p-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
            />
          </div>

          {/* =========================================
              TOMBOL AKSI
          ========================================= */}
          <div className="w-full mt-auto flex flex-col gap-3 pb-safe">
            {/* Tombol Kirim: Hanya aktif jika rating > 0 */}
            <button 
              disabled={rating === 0}
              onClick={() => router.push('/home')}
              className={`w-full font-extrabold px-8 py-4 rounded-2xl transition transform active:scale-95 ${
                rating > 0 
                  ? 'bg-accent-gradient text-white shadow-lg shadow-accent/30 hover:opacity-90' 
                  : 'bg-gray-100 text-text-muted cursor-not-allowed'
              }`}
            >
              Kirim Penilaian
            </button>
            
            {/* Tombol Lewati */}
            <button 
              onClick={() => router.push('/home')}
              className="w-full py-4 text-sm font-bold text-text-secondary hover:text-text-primary transition"
            >
              Lewati
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}