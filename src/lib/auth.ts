'use client';

import { useMemo, useSyncExternalStore, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

export type Role = 'buyer' | 'seller';

export interface Session {
  email: string;
  name: string;
  role: Role;
}

export function homeFor(role: Role): string {
  return role === 'seller' ? '/seller' : '/home';
}

const SESSION_KEY = 'savebites:session';
const AUTH_EVENT = 'savebites:auth';

// ── Helpers ────────────────────────────────────────────
function emitAuth() {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(AUTH_EVENT));
}

function saveSession(s: Session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  emitAuth();
}

function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
  emitAuth();
}

// ── Fetch profile dari Supabase ────────────────────────
async function fetchProfile(userId: string): Promise<{ name: string; role: Role } | null> {
  const { data } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', userId)
    .single();
  
  if (data) return data;

  // Fallback: ambil dari user metadata jika profile belum ada
  const { data: userData } = await supabase.auth.getUser();
  const meta = userData?.user?.user_metadata;
  if (meta?.name && meta?.role) {
    // Coba insert profile dari metadata
    await supabase.from('profiles').insert({
      id: userId,
      name: meta.name,
      role: meta.role,
    });
    return { name: meta.name, role: meta.role as Role };
  }

  return null;
}

// ── Login ──────────────────────────────────────────────
// export async function login(
//   email: string,
//   password: string
// ): Promise<Session | null> {
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//   if (error || !data.user) return null;

//   const profile = await fetchProfile(data.user.id);
//   if (!profile) return null;

//   const session: Session = {
//     email: data.user.email!,
//     name: profile.name,
//     role: profile.role,
//   };

//   // Simpan langsung ke sessionStorage — JANGAN tunggu onAuthStateChange
//   saveSession(session);
//   return session;
// }

// ── Register ───────────────────────────────────────────
export async function register(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}): Promise<Session | null> {
  // Step 1: Buat akun auth
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) { console.error('SignUp error:', error.message); return null; }
  if (!data.user) { console.error('No user returned from signUp'); return null; }

  // Step 2: Insert profile — pakai upsert agar tidak gagal jika sudah ada
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      name: input.name,
      role: input.role,
    });

  if (profileError) {
    console.error('Profile upsert error:', profileError.message);
    return null;
  }

  // Step 3: Langsung login setelah register
  return await login(input.email, input.password);
}

export async function login(
  email: string,
  password: string
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) { console.error('Login error:', error.message); return null; }
  if (!data.user) return null;

  // Ambil profile dengan retry sekali jika gagal
  // (kadang ada race condition setelah register)
  let profile = await fetchProfile(data.user.id);
  if (!profile) {
    await new Promise((r) => setTimeout(r, 500));
    profile = await fetchProfile(data.user.id);
  }

  if (!profile) {
    console.error('Profile not found for user:', data.user.id);
    return null;
  }

  const session: Session = {
    email: data.user.email!,
    name: profile.name,
    role: profile.role,
  };

  saveSession(session);
  return session;
}

// ── Logout ─────────────────────────────────────────────
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  clearSession();
}

// ── Get current session ────────────────────────────────
// Cek sessionStorage dulu (cepat), fallback ke Supabase (lambat)
export async function getSession(): Promise<Session | null> {
  // Cek cache dulu
  if (typeof window !== 'undefined') {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try { return JSON.parse(raw) as Session; } catch { /* lanjut */ }
    }
  }

  // Fallback: tanya Supabase (misal setelah hard refresh)
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const profile = await fetchProfile(data.session.user.id);
  if (!profile) return null;

  const session: Session = {
    email: data.session.user.email!,
    name: profile.name,
    role: profile.role,
  };

  // Simpan ke cache untuk request berikutnya
  if (typeof window !== 'undefined') saveSession(session);
  return session;
}

// ── onAuthStateChange: hanya untuk handle token refresh & logout ──
// Tidak lagi dipakai untuk set session awal (sudah ditangani login/register)
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      clearSession();
      return;
    }

    // TOKEN_REFRESHED: perbarui cache tanpa ganggu flow login
    if (event === 'TOKEN_REFRESHED' && session?.user) {
      const existing = window.sessionStorage.getItem(SESSION_KEY);
      if (!existing) {
        // Tab baru / hard refresh: rebuild session dari Supabase
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          saveSession({
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
          });
        }
      }
    }

    // INITIAL_SESSION: untuk hard refresh (F5) dimana sessionStorage kosong
    if (event === 'INITIAL_SESSION' && session?.user) {
      const existing = window.sessionStorage.getItem(SESSION_KEY);
      if (!existing) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          saveSession({
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
          });
        }
      }
    }
  });
}

// ── Reactive hook ──────────────────────────────────────
function subscribe(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_EVENT, cb);
  return () => window.removeEventListener(AUTH_EVENT, cb);
}

function getSnapshot(): string | null {
  return typeof window === 'undefined'
    ? null
    : window.sessionStorage.getItem(SESSION_KEY);
}

export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return useMemo(() => {
    if (!raw) return null;
    try { return JSON.parse(raw) as Session; }
    catch { return null; }
  }, [raw]);
}

// ── Route guard ────────────────────────────────────────
export function useRequireAuth(role?: Role): Session | null {
  const router = useRouter();
  const session = useSession();
  const allowed = !!session && (!role || session.role === role);

  useEffect(() => {
    // Beri jeda 100ms agar INITIAL_SESSION sempat mengisi sessionStorage
    // sebelum guard memutuskan redirect
    const timer = setTimeout(() => {
      if (!session) router.replace('/login');
      else if (role && session.role !== role) router.replace(homeFor(session.role));
    }, 100);

    return () => clearTimeout(timer);
  }, [session, role, router]);

  return allowed ? session : null;
}