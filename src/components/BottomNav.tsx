'use client';

import { useRouter } from 'next/navigation';
import { Home, Map as MapIcon, Plus, Receipt, User } from 'lucide-react';

export default function BottomNav({ activeIndex }: { activeIndex: number }) {
  const router = useRouter();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center px-2 py-3 pb-safe">
        <NavItem 
          icon={<Home size={24} />} 
          label="Beranda" 
          isActive={activeIndex === 0} 
          onClick={() => router.push('/home')} 
        />
        <NavItem 
          icon={<MapIcon size={24} />} 
          label="Peta" 
          isActive={activeIndex === 1} 
          onClick={() => router.push('/map')} 
        />
        
        <button 
          onClick={() => router.push('/post-food')}
          className="w-14 h-14 bg-[#2E7040] rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40 -mt-8 border-4 border-white transform hover:scale-105 transition"
        >
          <Plus size={28} />
        </button>

        <NavItem 
          icon={<Receipt size={24} />} 
          label="Pesanan" 
          isActive={activeIndex === 2} 
          onClick={() => router.push('/history')} 
        />
        <NavItem 
          icon={<User size={24} />} 
          label="Profil" 
          isActive={activeIndex === 3} 
          onClick={() => router.push('/profile')} 
        />
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
