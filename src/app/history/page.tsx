'use client';

import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  History,
  QrCode,
  Star,
  MapPin,
  Clock
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { mockListings, mockOrders } from '@/data/mockData';


// Gabungkan data order dengan data listing
const enrichedOrders = mockOrders.map(order => {
  const listing = mockListings.find(l => l.id === order.listingId)!;
  return { ...order, ...listing, totalPrice: listing.discountPrice * order.qty + 2000 };
});

const activeOrders = enrichedOrders.filter(o => o.status === 'Menunggu Diambil');
const pastOrders = enrichedOrders.filter(o => o.status === 'Selesai');


export default function HistoryScreen() {
  const router = useRouter();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar activeIndex={2} />

      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">
      
      <div className="w-full min-h-screen bg-white overflow-hidden flex flex-col relative pb-24 md:pb-8">
        
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="px-6 py-6 border-b border-divider flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition md:hidden"
            >
              <ArrowLeft size={24} className="text-text-primary" />
            </button>
            <h1 className="text-2xl font-extrabold text-text-primary">Riwayat Pesanan</h1>
          </div>
          <div className="w-10 h-10 border border-divider rounded-full flex items-center justify-center bg-gray-50 text-text-primary">
            <History size={20} />
          </div>
        </div>

        {/* =========================================
            KONTEN AREA
        ========================================= */}
        <div className="w-full max-w-5xl mx-auto p-6 overflow-y-auto">
          
          {/* Section: Sedang Berlangsung */}
          <div className="mb-10">
            <h2 className="text-lg font-extrabold text-text-primary mb-4">Sedang Berlangsung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map(order => (
                <HistoryCard key={order.id} data={order} isActive={true} formatRupiah={formatRupiah} router={router} />
              ))}
            </div>
          </div>

          {/* Section: Selesai */}
          <div>
            <h2 className="text-lg font-extrabold text-text-primary mb-4">Selesai</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastOrders.map(order => (
                <HistoryCard key={order.id} data={order} isActive={false} formatRupiah={formatRupiah} router={router} />
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>

    <BottomNav activeIndex={2} />
    </div>
  );
}

// =========================================
// SUB-KOMPONEN: HISTORY CARD
// =========================================
function HistoryCard({ data, isActive, formatRupiah, router }: { data: any, isActive: boolean, formatRupiah: any, router: any }) {
  return (
    <div className={`p-5 rounded-2xl border ${isActive ? 'border-primary/30 shadow-lg shadow-primary/5 bg-primary/5' : 'border-divider bg-white'}`}>
      
      {/* Badge Status & Tanggal */}
      <div className="flex justify-between items-center mb-4">
        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${isActive ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
          {data.status}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-text-muted">
          <Clock size={12} />
          {data.time}
        </div>
      </div>

      {/* Info Makanan */}
      <div className="flex gap-4 items-center mb-4">
        <img 
          src={data.image} 
          alt={data.title} 
          className="w-16 h-16 rounded-xl object-cover border border-divider/50 shrink-0"
        />
        <div>
          <h3 className="text-sm font-bold text-text-primary line-clamp-1">{data.title}</h3>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <MapPin size={12} /> {data.merchant}
          </p>
        </div>
      </div>

      <div className="border-t border-divider my-4"></div>

      {/* Total Belanja */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-xs text-text-secondary">Total Belanja</span>
        <span className="text-sm font-extrabold text-primary">{formatRupiah(data.totalPrice)}</span>
      </div>

      {/* Aksi Berdasarkan Status */}
      {isActive ? (
        <button 
          onClick={() => router.push('/payment-result')}
          className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-md shadow-primary/20"
        >
          <QrCode size={16} />
          Lihat QR Code
        </button>
      ) : (
        <button 
          onClick={() => router.push(`/rating?merchant=${encodeURIComponent(data.merchant)}`)}
          className="w-full py-3 bg-white border border-primary text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition"
        >
          <Star size={16} />
          Beri Penilaian
        </button>
      )}
    </div>
  );
}