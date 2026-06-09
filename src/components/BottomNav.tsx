'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Map as MapIcon, Plus, Receipt, User, LayoutDashboard } from 'lucide-react';
import { useSession } from '@/lib/auth';

export default function BottomNav(_props: { activeIndex?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const isSeller = session?.role === 'seller';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center px-2 py-3 pb-safe">
        {isSeller ? (
          <>
            <NavItem
              icon={<LayoutDashboard size={24} />}
              label="Dasbor"
              isActive={pathname === '/seller'}
              onClick={() => router.push('/seller')}
            />

            <button
              onClick={() => router.push('/post-food')}
              className="w-14 h-14 bg-[#2E7040] rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40 -mt-8 border-4 border-white transform hover:scale-105 transition"
            >
              <Plus size={28} />
            </button>

            <NavItem
              icon={<User size={24} />}
              label="Profil"
              isActive={pathname === '/profile'}
              onClick={() => router.push('/profile')}
            />
          </>
        ) : (
          <>
            <NavItem
              icon={<Home size={24} />}
              label="Beranda"
              isActive={pathname === '/home'}
              onClick={() => router.push('/home')}
            />
            <NavItem
              icon={<MapIcon size={24} />}
              label="Peta"
              isActive={pathname === '/map'}
              onClick={() => router.push('/map')}
            />
            <NavItem
              icon={<Receipt size={24} />}
              label="Pesanan"
              isActive={pathname === '/history'}
              onClick={() => router.push('/history')}
            />
            <NavItem
              icon={<User size={24} />}
              label="Profil"
              isActive={pathname === '/profile'}
              onClick={() => router.push('/profile')}
            />
          </>
        )}
      </div>
    </nav>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-16">
      <div className={`p-1.5 rounded-xl transition ${isActive ? 'text-primary bg-primary/10' : 'text-text-muted'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-text-muted'}`}>
        {label}
      </span>
    </button>
  );
}
