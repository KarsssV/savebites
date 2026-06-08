'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Map, Receipt, User, Plus, LogOut, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { useSession, logout } from '@/lib/auth';

type Item = { icon: LucideIcon; label: string; href: string };

const BUYER_ITEMS: Item[] = [
  { icon: Home, label: 'Beranda', href: '/home' },
  { icon: Map, label: 'Peta Lokasi', href: '/map' },
  { icon: Receipt, label: 'Riwayat Pesanan', href: '/history' },
  { icon: User, label: 'Profil Saya', href: '/profile' },
];

const SELLER_ITEMS: Item[] = [
  { icon: LayoutDashboard, label: 'Dasbor', href: '/seller' },
  { icon: Plus, label: 'Posting Makanan', href: '/post-food' },
  { icon: User, label: 'Profil Saya', href: '/profile' },
];

export default function Sidebar(_props: { activeIndex?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  const items = session?.role === 'seller' ? SELLER_ITEMS : BUYER_ITEMS;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 fixed h-screen bg-white shadow-xl z-50 left-0 top-0 border-r border-divider overflow-y-auto">
      {/* Logo / Branding */}
      <div className="p-8 flex items-center justify-center border-b border-divider/50">
        <div className="bg-primary/10 px-4 py-2 rounded-xl text-center">
          <span className="block text-sm font-black text-primary tracking-widest">SAVE</span>
          <span className="block text-sm font-black text-primary tracking-widest">BITES</span>
        </div>
      </div>

      {/* Menu Navigasi Desktop (sesuai peran) */}
      <div className="flex-1 py-8 px-4 flex flex-col gap-2">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            icon={<item.icon size={20} />}
            label={item.label}
            isActive={pathname === item.href}
            onClick={() => router.push(item.href)}
          />
        ))}
      </div>

      {/* Aksi utama penjual: Posting Makanan */}
      {session?.role === 'seller' && (
        <div className="p-4">
          <button onClick={() => router.push('/post-food')} className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 transition">
            <Plus size={20} />
            <span>Posting Makanan</span>
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-divider/50 mb-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 text-red-500 rounded-xl font-bold flex items-center gap-3 hover:bg-red-50 px-4 transition"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-bold ${
        isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
