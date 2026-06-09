'use client';

import { useRouter } from 'next/navigation';
import { 
  Edit2, 
  Bell, 
  Wallet, 
  Heart, 
  HelpCircle, 
  Info, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth, logout } from '@/lib/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const session = useRequireAuth();

  if (!session) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar activeIndex={3} />

      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0 bg-cream md:bg-gray-50">
      
      {/* Container utama */}
      <div className="w-full h-full min-h-screen md:min-h-0 max-w-3xl mx-auto bg-cream md:bg-transparent overflow-hidden flex flex-col relative pb-24 md:pb-8">
        
        {/* =========================================
            HEADER PROFIL
        ========================================= */}
        <div className="p-6 pt-12 md:pt-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-primary uppercase">{session.name.charAt(0)}</span>
            </div>

            {/* Info Pengguna */}
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold text-text-primary">
                {session.name}
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                {session.email}
              </p>
              <span className="mt-1 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {session.role === 'seller' ? 'Penjual' : 'Pembeli'}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition">
            <Edit2 size={20} />
          </button>
        </div>

        {/* =========================================
            KARTU STATISTIK PENYELAMATAN
        ========================================= */}
        <div className="px-6 mb-8">
          <div className="bg-primary-gradient p-5 rounded-[1.25rem] shadow-lg shadow-primary/30 flex items-center">
            
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-white/80 mb-1">Uang Hemat</span>
              <span className="text-xl font-extrabold text-white">Rp 145K</span>
            </div>
            
            <div className="w-px h-10 bg-white/30"></div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-white/80 mb-1">Porsi Diselamatkan</span>
              <span className="text-xl font-extrabold text-white">12</span>
            </div>
            
          </div>
        </div>

        {/* =========================================
            MENU OPTIONS
        ========================================= */}
        <div className="flex-1 bg-white rounded-t-3xl md:rounded-3xl flex flex-col pt-4">
          
          <div className="px-2">
            <MenuOption icon={<Bell size={20} />} title="Notifikasi" onClick={() => {}} />
            <MenuOption icon={<Wallet size={20} />} title="Metode Pembayaran" onClick={() => {}} />
            <MenuOption icon={<Heart size={20} />} title="Merchant Favorit" onClick={() => {}} />
            
            <div className="border-t border-divider my-4 mx-4"></div>
            
            <MenuOption icon={<HelpCircle size={20} />} title="Pusat Bantuan" onClick={() => {}} />
            <MenuOption icon={<Info size={20} />} title="Syarat & Ketentuan" onClick={() => {}} />
          </div>

          {/* Tombol Keluar */}
          <div className="px-6 mt-6 mb-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-500 rounded-2xl text-red-500 font-extrabold hover:bg-red-50 transition transform active:scale-95"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>

        </div>

      </div>
    </main>

    <BottomNav activeIndex={3} />
    </div>
  );
}

// =========================================
// SUB-KOMPONEN: MENU OPTION
// =========================================
function MenuOption({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition rounded-2xl group"
    >
      <div className="p-2 bg-cream rounded-xl text-text-primary group-hover:bg-primary/10 group-hover:text-primary transition">
        {icon}
      </div>
      <span className="ml-4 text-sm font-bold text-text-primary flex-1 text-left">
        {title}
      </span>
      <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition" />
    </button>
  );
}