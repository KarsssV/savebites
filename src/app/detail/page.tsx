'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Heart,
  Share2,
  Store,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { mockListings } from '@/data/mockData';

export default function DetailScreen() {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [merchantName, setMerchantName] = useState("");
  const [listingId, setListingId] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const m = searchParams.get('merchant');
      const idParam = searchParams.get('id');
      if (m) setMerchantName(m);
      if (idParam) setListingId(parseInt(idParam, 10));
    }
  }, []);

  // Ambil data dari mockListings berdasarkan ID, fallback ke item pertama
  const foundListing = mockListings.find(l => l.id === listingId) || mockListings[0];

  // Gabungkan dengan merchant dari URL jika ada (dari peta)
  const data = {
    ...foundListing,
    merchant: merchantName || foundListing.merchant,
    merchantLocation: foundListing.merchantLocation,
    reviews: foundListing.reviews,
    description: foundListing.description,
    allergens: foundListing.allergens,
    timeLeft: foundListing.timeLeft + " Menit",
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center md:items-center md:p-8">

      {/* Container Utama Responsif */}
      <div className="w-full h-full min-h-screen md:min-h-0 md:h-[600px] md:max-h-[85vh] md:max-w-5xl bg-white md:rounded-[2rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

        {/* =========================================
            BAGIAN GAMBAR (KIRI di Desktop, ATAS di HP)
        ========================================= */}
        <div className="relative w-full h-[350px] md:h-full md:w-1/2">
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay Atas (Untuk visibilitas tombol back) */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Tombol Aksi Melayang */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10 pb-safe-top">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition">
                <Share2 size={20} />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition"
              >
                <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
          </div>

          {/* Badge Status Makanan */}
          <div className="absolute bottom-6 left-4 flex gap-2">
            <div className="bg-accent px-3 py-1.5 rounded-lg text-xs font-black text-white shadow-lg flex items-center gap-1.5">
              <Clock size={14} /> Sisa {data.timeLeft}
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-primary shadow-lg">
              Stok: {data.stock} Porsi
            </div>
          </div>
        </div>

        {/* =========================================
            BAGIAN KONTEN DETAIL (KANAN di Desktop, BAWAH di HP)
        ========================================= */}
        <div className="w-full md:w-1/2 bg-white rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 flex flex-col h-full">

          {/* Area Scrollable Content */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto pb-32 md:pb-32">

            {/* Header Info */}
            <div className="mb-6">
              <div className="flex items-center gap-1 text-sm font-bold text-text-primary mb-2">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span>{data.rating}</span>
                <span className="text-text-muted font-normal">({data.reviews} ulasan)</span>
              </div>
              <h1 className="text-2xl font-extrabold text-text-primary leading-tight mb-2">
                {data.title}
              </h1>
            </div>

            {/* Merchant Card */}
            <div className="bg-cream/50 border border-divider rounded-2xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-text-primary text-sm">{merchantName}</h3>
                  <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                    <MapPin size={12} />
                    <span>{data.distance} • {data.merchantLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="mb-6">
              <h3 className="font-bold text-text-primary mb-2">Deskripsi Makanan</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Allergen Info */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex gap-3">
              <AlertCircle size={20} className="text-accent shrink-0" />
              <div>
                <h4 className="font-bold text-accent text-sm mb-1">Informasi Alergen</h4>
                <p className="text-xs text-orange-800">Mengandung: {data.allergens.join(", ")}</p>
              </div>
            </div>

            {/* Kualitas Terjamin */}
            <div className="flex items-start gap-3 text-sm text-text-secondary mb-6">
              <ShieldCheck size={24} className="text-primary shrink-0" />
              <p className="text-xs leading-relaxed">
                <span className="font-bold text-text-primary">Kualitas Terjamin.</span> Makanan ini masih sangat layak konsumsi dan belum melewati masa kedaluwarsa.
              </p>
            </div>

            {/* Kuantitas */}
            <div className="flex items-center justify-between bg-gray-50 border border-divider p-4 rounded-2xl">
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">Jumlah Pesanan</span>
                <span className="text-xs text-text-muted">Maksimal {data.stock} porsi</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-divider flex items-center justify-center text-text-primary font-bold hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="font-bold text-primary w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(data.stock, quantity + 1))}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:opacity-90 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* =========================================
              BOTTOM CHECKOUT BAR
              (Fixed di HP, Nempel di bawah container di Desktop)
          ========================================= */}
          <div className="fixed md:absolute bottom-0 left-0 right-0 w-full bg-white border-t border-divider px-6 py-4 pb-safe flex items-center justify-between z-50">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-muted line-through mb-0.5">
                {formatRupiah(data.originalPrice * quantity)}
              </span>
              <span className="text-2xl font-black text-primary leading-none">
                {formatRupiah(data.discountPrice * quantity)}
              </span>
            </div>

            <button
              onClick={() => router.push(`/checkout?qty=${quantity}`)}
              className="bg-accent-gradient text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-accent/30 hover:opacity-90 transition transform active:scale-95"
            >
              Selamatkan!
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}