'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Perbaikan 1: Ubah items-center menjadi md:items-center agar di HP mulai dari atas dan bisa di-scroll
    <main className="min-h-screen bg-cream flex justify-center md:items-center md:p-8">
      
      {/* Perbaikan 2: Ganti h-screen menjadi min-h-screen agar wadah bisa memanjang menyesuaikan isi */}
      <div className="w-full min-h-screen md:min-h-0 md:max-w-5xl bg-white md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* =========================================
            KOLOM 1: Branding / Hero 
        ========================================= */}
        <div className="relative w-full h-[300px] shrink-0 md:w-1/2 md:h-auto bg-primary-gradient p-8 md:p-12 flex flex-col justify-between rounded-b-3xl md:rounded-none">
          
          <button 
            onClick={() => router.back()}
            className="w-fit p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mt-8 md:mt-0 mb-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Selamat Datang<br />Kembali!
            </h1>
            <p className="text-white/80 mt-4 text-sm md:text-base max-w-sm">
              Masuk untuk melanjutkan misi penyelamatan makananmu bersama pahlawan lainnya.
            </p>
          </div>
          
          <div className="hidden md:block"></div>
        </div>

        {/* =========================================
            KOLOM 2: Form Login
        ========================================= */}
        {/* Perbaikan 3: Tambahkan pb-12 agar ada ruang kosong di paling bawah saat di-scroll di HP */}
        <div className="w-full md:w-1/2 px-6 py-8 pb-12 md:p-12 bg-white -mt-6 md:mt-0 relative z-10 rounded-t-3xl md:rounded-none">
          
          <h2 className="text-2xl font-extrabold text-text-primary mb-6 md:hidden">
            Masuk ke Akun
          </h2>

          <div className="mb-5">
            <label className="block text-sm font-bold text-text-primary mb-2">Email</label>
            <div className="flex items-center bg-cream/50 border border-divider rounded-2xl px-4 py-3">
              <Mail className="text-text-muted mr-3" size={20} />
              <input 
                type="email" 
                placeholder="Masukkan emailmu"
                className="bg-transparent w-full focus:outline-none text-text-primary placeholder:text-text-muted text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-text-primary mb-2">Kata Sandi</label>
            <div className="flex items-center bg-cream/50 border border-divider rounded-2xl px-4 py-3">
              <Lock className="text-text-muted mr-3" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan kata sandi"
                className="bg-transparent w-full focus:outline-none text-text-primary placeholder:text-text-muted text-sm"
              />
              <button onClick={() => setShowPassword(!showPassword)} type="button">
                {showPassword ? (
                  <EyeOff className="text-text-muted ml-2" size={20} />
                ) : (
                  <Eye className="text-text-muted ml-2" size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <button type="button" className="text-xs font-bold text-primary hover:underline">
              Lupa Kata Sandi?
            </button>
          </div>

          <button 
            type="button"
            onClick={() => router.push('/home')}
            className="w-full h-14 bg-accent-gradient text-white font-extrabold rounded-2xl shadow-lg shadow-accent/30 hover:opacity-90 transition transform active:scale-95"
          >
            Masuk
          </button>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-divider"></div>
            <span className="px-4 text-xs font-semibold text-text-secondary">Atau</span>
            <div className="flex-1 border-t border-divider"></div>
          </div>

          <div className="flex justify-center gap-4">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-divider rounded-2xl shadow-sm hover:bg-gray-50 transition">
              <span className="font-bold text-text-primary">G</span>
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-divider rounded-2xl shadow-sm hover:bg-gray-50 transition">
              <span className="font-bold text-text-primary">A</span>
            </button>
          </div>

          <div className="mt-10 text-center text-sm">
            <span className="text-text-secondary">Belum punya akun? </span>
            <Link href="/signup" className="font-extrabold text-primary hover:underline">
              Daftar Sekarang
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}