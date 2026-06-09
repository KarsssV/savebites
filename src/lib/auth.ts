'use client';

// Logika autentikasi sisi-klien (lokal). Sesi disimpan di localStorage.
// Tidak ada backend — cocok untuk demo yang berjalan lokal.

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { accounts, type Account, type Role } from '@/data/users';

export type { Role } from '@/data/users';

// Data sesi yang disimpan (tanpa password).
export type Session = Omit<Account, 'password'>;

const SESSION_KEY = 'savebites:session';
const USERS_KEY = 'savebites:users'; // akun hasil pendaftaran (signup)
const AUTH_EVENT = 'savebites:auth-change';

function emitAuthChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EVENT));
}

// Akun bawaan + akun yang didaftarkan lewat signup.
function allAccounts(): Account[] {
  if (typeof window === 'undefined') return accounts;
  try {
    const extra = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as Account[];
    return [...accounts, ...extra];
  } catch {
    return accounts;
  }
}

// Validasi kredensial. Mengembalikan sesi bila cocok, atau null bila gagal.
export function login(email: string, password: string): Session | null {
  const user = allAccounts().find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );
  if (!user) return null;
  const session: Session = { email: user.email, name: user.name, role: user.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emitAuthChange();
  return session;
}

// Daftarkan akun baru lalu langsung login. Null bila email sudah dipakai.
export function register(account: Account): Session | null {
  const email = account.email.trim();
  const exists = allAccounts().some((a) => a.email.toLowerCase() === email.toLowerCase());
  if (exists) return null;
  const extra = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as Account[];
  extra.push({ ...account, email });
  localStorage.setItem(USERS_KEY, JSON.stringify(extra));
  return login(email, account.password);
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    emitAuthChange();
  }
}

// Halaman tujuan default per peran.
export function homeFor(role: Role): string {
  return role === 'seller' ? '/seller' : '/home';
}

// --- Sumber data sesi yang reaktif (useSyncExternalStore) ---
// Pola yang direkomendasikan React untuk membaca penyimpanan eksternal
// (localStorage) tanpa memicu hydration mismatch atau setState-in-effect.

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(SESSION_KEY);
}

function getServerSnapshot(): string | null {
  return null; // server tidak punya sesi
}

// Hook reaktif: mengembalikan sesi saat ini (atau null bila belum login).
export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }, [raw]);
}

// Hook penjaga halaman. Pastikan user sudah login (dan punya `role` bila diisi).
// Mengembalikan Session bila boleh tampil, atau null (halaman me-render null
// sementara redirect berjalan). Redirect dilakukan di efek samping.
export function useRequireAuth(role?: Role): Session | null {
  const router = useRouter();
  const session = useSession();
  const allowed = !!session && (!role || session.role === role);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    } else if (role && session.role !== role) {
      router.replace(homeFor(session.role));
    }
  }, [session, role, router]);

  return allowed ? session : null;
}
