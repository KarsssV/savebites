'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, MapPin, Store, Navigation } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth } from '@/lib/auth';
import {
  getSellerLocations,
  useListings,
  getProfile,
  type SellerLocation
} from '@/lib/store';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Leaflet harus di-import secara dynamic karena tidak support SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

export default function MapScreen() {
  const router = useRouter();
  const session = useRequireAuth('buyer');
  const listings = useListings();

  const [sellers, setSellers] = useState<SellerLocation[]>([]);
const [selected, setSelected] = useState<SellerLocation | null>(null);
const [search, setSearch] = useState('');
const [isClient, setIsClient] = useState(false);

const [buyerLocation, setBuyerLocation] = useState<{
  lat: number;
  lng: number;
} | null>(null);

  useEffect(() => {
    setIsClient(true);

    getSellerLocations().then(setSellers);

    const loadBuyerLocation = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) return;

      const profile = await getProfile(data.user.id);

      if (profile?.lat && profile?.lng) {
        setBuyerLocation({
          lat: profile.lat,
          lng: profile.lng,
        });
      }
    };

    loadBuyerLocation();
  }, []);

  if (!session) return null;

  const filtered = sellers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  // Listing milik seller yang dipilih
  const sellerListings = selected
    ? listings.filter((l) => l.merchant === selected.name)
    : [];

  // Pusat peta: Surabaya sebagai default
  const center: [number, number] = [-7.250445, 112.768845];

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar activeIndex={1} />

      <main className="flex-1 md:ml-64 w-full relative h-screen overflow-hidden">
        <div className="w-full h-full flex flex-col">

          {/* Search Bar */}
          <div className="absolute top-0 left-0 right-0 z-[1000] px-6 pt-12 md:pt-6 pb-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex gap-3 items-center">
              <button
                onClick={() => router.push('/home')}
                className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-text-primary hover:bg-gray-50 transition shrink-0"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1 bg-white rounded-2xl shadow-lg flex items-center px-4 h-12">
                <Search size={20} className="text-text-muted mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari merchant atau alamat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-sm text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>
          </div>

          {/* Peta Leaflet */}
          {isClient && (
            <div className="w-full h-full">
              <LeafletMap
                center={
                  buyerLocation
                    ? [buyerLocation.lat, buyerLocation.lng]
                    : center
                }
                sellers={filtered}
                onSelect={setSelected}
                selected={selected}
                buyerLocation={buyerLocation}
              />
            </div>
          )}

          {/* Bottom Sheet: Seller terpilih */}
          {selected && (
            <div className="absolute bottom-[80px] md:bottom-4 left-4 right-4 z-[1000] animate-slide-up">
              <div className="bg-white rounded-3xl p-5 shadow-2xl border border-divider">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-text-primary">{selected.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                        <MapPin size={11} /> {selected.address}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-text-muted hover:text-text-primary text-lg font-bold px-2"
                  >
                    ×
                  </button>
                </div>

                {/* Daftar listing seller */}
                {sellerListings.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 mb-4 hide-scrollbar">
                    {sellerListings.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => router.push(`/detail?id=${l.id}`)}
                        className="shrink-0 w-32 cursor-pointer"
                      >
                        <img
                          src={l.image}
                          alt={l.title}
                          className="w-32 h-20 object-cover rounded-xl mb-1"
                        />
                        <p className="text-xs font-bold text-text-primary line-clamp-2 leading-tight">
                          {l.title}
                        </p>
                        <p className="text-xs font-black text-primary mt-0.5">
                          Rp {l.discountPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (sellerListings[0]) {
                      router.push(`/detail?id=${sellerListings[0].id}`);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition"
                >
                  <Navigation size={16} />
                  Lihat Semua Makanan
                </button>
              </div>
            </div>
          )}

          <BottomNav activeIndex={1} />
        </div>
      </main>
    </div>
  );
}

// Komponen peta terpisah agar import leaflet CSS bisa dilakukan di sini
function LeafletMap({
  center,
  sellers,
  onSelect,
  selected,
  buyerLocation,
}: {
  center: [number, number];
  sellers: SellerLocation[];
  onSelect: (s: SellerLocation) => void;
  selected: SellerLocation | null;
  buyerLocation: {
    lat: number;
    lng: number;
  } | null;
}) {
  useEffect(() => {
    // Import CSS Leaflet secara dinamis
    import('leaflet/dist/leaflet.css' as never);

    // Fix ikon marker default Leaflet yang hilang di Next.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const buyerIcon =
  typeof window !== 'undefined'
    ? require('leaflet').divIcon({
        className: '',
        html: `
          <div style="
            width:16px;
            height:16px;
            background:#3B82F6;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
    : null;

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sellers.map((seller) => (
        <Marker
          key={seller.id}
          position={[seller.lat, seller.lng]}
          eventHandlers={{ click: () => onSelect(seller) }}
        >
          <Popup>
            <div className="text-sm font-bold">{seller.name}</div>
            <div className="text-xs text-gray-500">{seller.address}</div>
          </Popup>
        </Marker>
      ))}

      {buyerLocation && buyerIcon && (
        <Marker
          position={[
            buyerLocation.lat,
            buyerLocation.lng,
          ]}
          icon={buyerIcon}
        >
          <Popup>
            <div className="text-sm font-bold">
              Lokasi Kamu
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}