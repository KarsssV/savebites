'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, ShoppingBag, Store, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { register, homeFor, type Role } from '@/lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [role, setRole] = useState<Role>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  // Ganti fungsi handleSignup menjadi:
  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Lengkapi semua kolom terlebih dahulu.');
      return;
    }
    if (password.length < 4) {
      setError('Kata sandi minimal 4 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    const session = await register({ name: name.trim(), email, password, role });
    if (!session) {
      setError('Email sudah terdaftar. Coba masuk.');
      return;
    }
    router.push(homeFor(session.role));
  };

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

          {/* Pilihan Peran */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-text-primary mb-2">Daftar sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition ${role === 'buyer' ? 'border-primary bg-primary/10 text-primary' : 'border-divider bg-cream/50 text-text-secondary hover:border-primary/40'}`}
              >
                <ShoppingBag size={18} /> Pembeli
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition ${role === 'seller' ? 'border-primary bg-primary/10 text-primary' : 'border-divider bg-cream/50 text-text-secondary hover:border-primary/40'}`}
              >
                <Store size={18} /> Penjual
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-text-primary mb-2">
              {role === 'seller' ? 'Nama Toko' : 'Nama Lengkap'}
            </label>
            <div className="flex items-center bg-cream/50 border border-divider rounded-2xl px-4 py-3">
              <User className="text-text-muted mr-3" size={20} />
              <input
                type="text"
                placeholder={role === 'seller' ? 'Masukkan nama tokomu' : 'Masukkan namamu'}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
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
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSignup(); }}
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

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignup}
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