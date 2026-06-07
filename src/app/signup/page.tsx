'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

export default function SignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-0 md:p-8">
      
      {/* Container Utama: Responsif HP (1 kolom) vs Laptop (2 kolom) */}
      <div className="w-full min-h-screen md:min-h-0 md:h-auto max-w-5xl bg-white md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* =========================================
            KOLOM 1: Branding / Hero 
        ========================================= */}
        <div className="relative w-full h-[250px] md:w-1/2 md:h-auto bg-primary-gradient p-8 md:p-12 flex flex-col justify-between rounded-b-3xl md:rounded-none">
          
          <button 
            onClick={() => router.back()}
            className="w-fit p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mt-4 md:mt-0 mb-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Mulai<br />Perjalananmu
            </h1>
            <p className="text-white/80 mt-4 text-sm md:text-base max-w-sm">
              Daftar sekarang dan jadilah pahlawan penyelamat makanan bersama kami.
            </p>
          </div>
          
          {/* Spacer untuk desktop agar konten berada di tengah */}
          <div className="hidden md:block"></div>
        </div>

        {/* =========================================
            KOLOM 2: Form Pendaftaran
        ========================================= */}
        <div className="w-full md:w-1/2 px-6 py-8 md:p-12 bg-white -mt-6 md:mt-0 relative z-10 rounded-t-3xl md:rounded-none">
          
          {/* Header Mobile */}
          <h2 className="text-2xl font-extrabold text-text-primary mb-6 md:hidden">
            Buat Akun Baru
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-bold text-text-primary mb-2">Nama Lengkap</label>
            <div className="flex items-center bg-cream/50 border border-divider rounded-2xl px-4 py-3">
              <User className="text-text-muted mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Masukkan namamu"
                className="bg-transparent w-full focus:outline-none text-text-primary placeholder:text-text-muted text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
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
                placeholder="Buat kata sandi"
                className="bg-transparent w-full focus:outline-none text-text-primary placeholder:text-text-muted text-sm"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="text-text-muted ml-2" size={20} />
                ) : (
                  <Eye className="text-text-muted ml-2" size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-text-primary mb-2">Konfirmasi Kata Sandi</label>
            <div className="flex items-center bg-cream/50 border border-divider rounded-2xl px-4 py-3">
              <Lock className="text-text-muted mr-3" size={20} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Ulangi kata sandi"
                className="bg-transparent w-full focus:outline-none text-text-primary placeholder:text-text-muted text-sm"
              />
              <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff className="text-text-muted ml-2" size={20} />
                ) : (
                  <Eye className="text-text-muted ml-2" size={20} />
                )}
              </button>
            </div>
          </div>

          <button 
            onClick={() => router.push('/otp')}
            className="w-full h-14 bg-accent-gradient text-white font-extrabold rounded-2xl shadow-lg shadow-accent/30 hover:opacity-90 transition"
          >
            Daftar Sekarang
          </button>

          <div className="mt-8 text-center text-sm">
            <span className="text-text-secondary">Sudah punya akun? </span>
            <Link href="/login" className="font-extrabold text-primary hover:underline">
              Masuk
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}