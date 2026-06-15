'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import {
  MapPin,
  ChevronDown,
  Bell,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth } from '@/lib/auth';
import { useListings, type Listing } from '@/lib/store';
import CountdownBadge from '@/components/CountdownBadge';


export default function HomeScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');
  const listings = useListings();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);

  const categories = ['Semua', 'Roti & Kue', 'Makanan Berat', 'Minuman', 'Sayur & Buah', 'Snack'];

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 0 || item.category === categories[selectedCategory];
    return matchesSearch && matchesCategory;
  });

  if (!session) return null; // menunggu/redirect login

  const firstName = session.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-cream flex">

      {/* =========================================
          SIDEBAR (Desktop)
      ========================================= */}
      <Sidebar activeIndex={0} />

      {/* =========================================
          MAIN CONTENT AREA
          (Di HP full width, di Desktop geser ke kanan selebar sidebar: md:ml-64)
      ========================================= */}
      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">

        {/* Background Gradient Atas */}
        <div className="absolute top-0 left-0 right-0 h-[220px] bg-primary-gradient rounded-b-3xl md:rounded-none z-0" />

        <div className="relative z-10 w-full max-w-5xl mx-auto md:px-8">

          {/* Header & Profil */}
          <div className="px-6 pt-12 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white font-bold uppercase">
                {session.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-white/80 text-xs">Halo, {firstName} 👋</span>
                <button
                  onClick={() => setLocationEnabled(!locationEnabled)}
                  className="flex items-center gap-1 text-white text-sm font-bold hover:text-white/80 transition"
                >
                  <MapPin size={14} className={locationEnabled ? "text-green-300" : "text-white/80"} />
                  <span className="truncate max-w-[120px] md:max-w-none">
                    {locationEnabled ? 'Lokasi aktif' : 'Malang, Jawa Timur'}
                  </span>
                  <ChevronDown size={16} className="text-white/70" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Logo di HP, disembunyikan di Desktop karena sudah ada di Sidebar */}
              <div className="md:hidden bg-white px-3 py-1.5 rounded-lg shadow-md flex flex-col items-center justify-center leading-tight">
                <span className="text-[10px] font-black text-primary tracking-wider">SAVE</span>
                <span className="text-[10px] font-black text-primary tracking-wider">BITES</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 mb-6 flex gap-3">
            <div className="flex-1 bg-white rounded-2xl shadow-lg shadow-black/5 flex items-center px-4 py-1">
              <Search size={20} className="text-primary mr-2" />
              <input
                type="text"
                placeholder="Cari makanan atau merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="w-full overflow-x-auto hide-scrollbar px-6 pb-4">
            <div className="flex gap-2 w-max">
              {categories.map((cat, idx) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(idx)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition shadow-sm ${selectedCategory === idx
                    ? 'bg-primary text-white border border-primary shadow-primary/20'
                    : 'bg-white text-text-secondary border border-divider hover:bg-gray-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Makanan di Sekitarmu */}
          <div className="px-6 pb-12 mt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-text-primary">🔥 Di Sekitarmu</h2>
                <p className="text-xs text-text-secondary mt-1">Malang, Jawa Timur (default)</p>
              </div>
              <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition">
                Lihat semua
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredListings.length > 0 ? (
                filteredListings.map((item) => (
                  <ListingCard key={item.id} data={item} router={router} />
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-text-muted text-sm font-bold">
                  Makanan tidak ditemukan
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* =========================================
          BOTTOM NAVIGATION BAR (Mobile)
      ========================================= */}
      <BottomNav activeIndex={0} />

    </div>
  );
}

// --- SUB-KOMPONEN LISTING CARD ---
function ListingCard({ data, router }: { data: Listing, router: any }) {
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div
      onClick={() => router.push(`/detail?id=${data.id}`)}
      className="bg-white rounded-2xl p-2.5 shadow-sm border border-divider/50 flex flex-col hover:shadow-md transition cursor-pointer group"
    >
      <div className="relative w-full h-28 md:h-36 rounded-xl overflow-hidden mb-3">
        <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          <div className="absolute top-2 left-2">
            <div className={`backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black shadow-sm ${
              data.stock <= 1
                ? 'bg-red-500/90 text-white'
                : data.stock <= 3
                ? 'bg-amber-500/90 text-white'
                : 'bg-white/90 text-accent'
            }`}>
              Sisa {data.stock}
            </div>
          </div>
        <div className="absolute bottom-2 right-2">
          <CountdownBadge expiredAt={data.expiredAt} />
        </div>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-secondary truncate pr-2">{data.merchant}</span>
        <div className="flex items-center gap-0.5 text-[10px] font-bold text-text-primary">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          {data.rating}
        </div>
      </div>
      <h3 className="text-xs md:text-sm font-extrabold text-text-primary line-clamp-2 leading-snug mb-1">
        {data.title}
      </h3>
      <div className="flex items-center gap-1 text-[10px] text-text-muted mb-3 mt-auto">
        <MapPin size={10} />
        <span>{data.distance}</span>
      </div>
      <div className="flex items-end justify-between border-t border-divider/50 pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted line-through">
            {formatRupiah(data.originalPrice)}
          </span>
          <span className="text-sm md:text-base font-black text-primary">
            {formatRupiah(data.discountPrice)}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/detail?id=${data.id}`); }}
          className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition"
        >
          <div className="text-xs font-black">+</div>
        </button>
      </div>
    </div>
  );
}