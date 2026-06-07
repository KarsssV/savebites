'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Star,
  Navigation
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { mockListings, mockMapPins } from '@/data/mockData';

export default function MapScreen() {
  const router = useRouter();
  
  // State untuk melacak merchant mana yang sedang di-klik di peta dummy
  const [selectedPin, setSelectedPin] = useState<number | null>(1);

  // Enrich pins with listing data
  const dummyPins = mockMapPins.map(pin => {
    const listing = mockListings.find(l => l.id === pin.listingId)!;
    return { ...pin, name: listing.merchant, distance: listing.distance, rating: listing.rating, stock: listing.stock, listingId: pin.listingId };
  });

  const activeMerchant = dummyPins.find(p => p.id === selectedPin);

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar activeIndex={1} />

      <main className="flex-1 md:ml-64 w-full relative h-screen bg-gray-100 overflow-hidden">
      
      {/* Container utama */}
      <div className="w-full h-full flex flex-col relative">
        
        {/* =========================================
            BACKGROUND PETA DUMMY
        ========================================= */}
        <div className="absolute inset-0 z-0">
          {/* Gambar ini adalah ilustrasi peta kota. Kamu bisa ganti dengan gambar peta aslimu nanti */}
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
            alt="Map Background" 
            className="w-full h-full object-cover opacity-80"
          />
          {/* Lapisan agak pudar agar UI di atasnya lebih terbaca */}
          <div className="absolute inset-0 bg-cream/40 backdrop-blur-[1px]"></div>
        </div>

        {/* =========================================
            HEADER & SEARCH BARS (Mengambang di atas peta)
        ========================================= */}
        <div className="relative z-10 px-6 pt-12 md:pt-8 pb-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => router.push('/home')}
              className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-text-primary hover:bg-gray-50 transition shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 bg-white rounded-2xl shadow-lg flex items-center px-4 h-12">
              <Search size={20} className="text-text-muted mr-3" />
              <input 
                type="text"
                placeholder="Cari lokasi terdekat..."
                className="bg-transparent w-full focus:outline-none text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
          </div>
        </div>

        {/* =========================================
            PIN MARKERS DUMMY
        ========================================= */}
        {dummyPins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin.id)}
            style={{ top: pin.top, left: pin.left }}
            className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              selectedPin === pin.id ? 'scale-125' : 'scale-100 hover:scale-110'
            }`}
          >
            <div className={`relative flex flex-col items-center ${selectedPin === pin.id ? 'text-accent' : 'text-primary'}`}>
              <MapPin size={36} className="drop-shadow-lg fill-white" />
              {/* Indikator Stok di atas Pin */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {pin.stock}
              </div>
            </div>
          </button>
        ))}

        {/* Pin Lokasi User (Biru) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-lg animate-pulse"></div>
        </div>

        {/* =========================================
            BOTTOM SHEET (Detail Merchant Terpilih)
        ========================================= */}
        {activeMerchant && (
          <div className="absolute bottom-[90px] left-0 right-0 px-6 z-30 transition-transform duration-300 animate-slide-up">
            <div className="bg-white rounded-3xl p-5 shadow-2xl border border-divider">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-text-primary">{activeMerchant.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-text-primary">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {activeMerchant.rating}
                    </span>
                    <span className="text-xs text-text-muted">• {activeMerchant.distance}</span>
                  </div>
                </div>
                <div className="bg-primary/10 px-3 py-1.5 rounded-lg text-xs font-black text-primary">
                  {activeMerchant.stock} Tersedia
                </div>
              </div>
              
              <button 
                onClick={() => router.push(`/detail?id=${activeMerchant.listingId}&merchant=${encodeURIComponent(activeMerchant.name)}`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition transform active:scale-95 mt-2"
              >
                <Navigation size={18} />
                Lihat Makanan
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            BOTTOM NAVIGATION BAR
        ========================================= */}
        <BottomNav activeIndex={1} />

      </div>
    </main>
    </div>
  );
}