'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { type Role } from './auth';

// ── Types ──────────────────────────────────────────────
export interface Listing {
  id: number;
  title: string;
  merchant: string;
  merchantLocation: string;
  distance: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  discountPrice: number;
  stock: number;
  timeLeft: string;
  expiredAt: string | null;
  category: string;
  image: string;
  description: string;
  allergens: string[];
  sellerEmail: string;
  sellerId?: string;
}

export type OrderStatus = 'Menunggu Diambil' | 'Selesai' | 'Dibatalkan';

export interface Order {
  id: number;
  listingId: number;
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  sellerId: string;
  qty: number;
  time: string;
  status: OrderStatus;
  rating?: number;
  review?: string;
  confirmationCode?: string;
  confirmedAt?: string;
}

// Tambah helper ini di atas rowToListing
function timeLeftToMinutes(timeLeft: string): number {
  if (timeLeft.includes('30 Mnt') || timeLeft.includes('30 Menit')) return 30;
  if (timeLeft.includes('1 Jam')) return 60;
  if (timeLeft.includes('2 Jam')) return 120;
  if (timeLeft.includes('3 Jam')) return 180;
  if (timeLeft.includes('4 Jam')) return 240;
  if (timeLeft.includes('Malam') || timeLeft.includes('malam')) {
    // Hitung menit sampai jam 21:00 hari ini
    const now = new Date();
    const tonight = new Date();
    tonight.setHours(21, 0, 0, 0);
    const diff = Math.max(0, Math.floor((tonight.getTime() - now.getTime()) / 60000));
    return diff;
  }
  return 60; // default 1 jam
}

// Update rowToListing — tambah expiredAt
function rowToListing(r: any): Listing {
  return {
    id: r.id,
    title: r.title,
    merchant: r.merchant,
    merchantLocation: r.merchant_location,
    distance: r.distance,
    rating: r.rating,
    reviews: r.reviews,
    originalPrice: r.original_price,
    discountPrice: r.discount_price,
    stock: r.stock,
    timeLeft: r.time_left,
    expiredAt: r.expired_at ?? null,   // <-- tambah ini
    category: r.category,
    image: r.image,
    description: r.description ?? '',
    allergens: r.allergens ?? [],
    sellerEmail: r.seller_email,
    sellerId: r.seller_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): Order {
  return {
    id: r.id,
    listingId: r.listing_id,
    buyerEmail: r.buyer_email,
    buyerName: r.buyer_name,
    sellerEmail: r.seller_email,
    sellerId: r.seller_id,
    qty: r.qty,
    time: r.time,
    status: r.status,
    rating: r.rating ?? undefined,
    review: r.review ?? undefined,
    confirmationCode: r.order_confirmations?.code ?? undefined,
    confirmedAt: r.order_confirmations?.confirmed_at ?? undefined,
  };
}

// Generate kode konfirmasi unik 6 karakter
export function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Listings: semua (untuk buyer home) ────────────────
export function useListings(): Listing[] {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .gt('stock', 0)                              // hanya stok > 0
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setListings(data.map(rowToListing));
      });

    const channel = supabase
      .channel('listings-all')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.new.stock > 0) {
            setListings((prev) => [rowToListing(payload.new), ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.new.stock <= 0) {
            // Hapus dari tampilan jika stok habis
            setListings((prev) => prev.filter((l) => l.id !== payload.new.id));
          } else {
            // Update stok terbaru
            setListings((prev) =>
              prev.map((l) => l.id === payload.new.id ? rowToListing(payload.new) : l)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return listings;
}

// ── Listings: hanya milik seller ini (untuk dashboard seller) ──
export function useSellerListings(sellerEmail: string): Listing[] {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!sellerEmail) return;

    supabase
      .from('listings')
      .select('*')
      .eq('seller_email', sellerEmail)
      .order('created_at', { ascending: false })
      // Tidak filter stok 0 di sini agar seller tetap bisa lihat semua miliknya
      .then(({ data }) => {
        if (data) setListings(data.map(rowToListing));
      });

    const channel = supabase
      .channel(`listings-seller-${sellerEmail}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.new.seller_email === sellerEmail) {
            setListings((prev) => [rowToListing(payload.new), ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.new.seller_email === sellerEmail) {
            setListings((prev) =>
              prev.map((l) => l.id === payload.new.id ? rowToListing(payload.new) : l)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sellerEmail]);

  return listings;
}

export async function addListing(
  input: Omit<Listing, 'id'>
): Promise<Listing | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  let merchantLocation = input.merchantLocation;
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('address')
      .eq('id', userId)
      .single();
    if (profile?.address) merchantLocation = profile.address;
  }

  // Hitung expired_at dari timeLeft
  const minutes = timeLeftToMinutes(input.timeLeft);
  const expiredAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('listings')
    .insert({
      title: input.title,
      merchant: input.merchant,
      merchant_location: merchantLocation,
      distance: input.distance,
      rating: input.rating,
      reviews: input.reviews,
      original_price: input.originalPrice,
      discount_price: input.discountPrice,
      stock: input.stock,
      time_left: input.timeLeft,
      expired_at: expiredAt,   // <-- tambah ini
      category: input.category,
      image: input.image,
      description: input.description,
      allergens: input.allergens,
      seller_email: input.sellerEmail,
      seller_id: userId ?? null,
    })
    .select()
    .single();

  if (error || !data) { console.error(error); return null; }
  return rowToListing(data);
}

// ── Orders: hanya milik buyer ini ─────────────────────
export function useBuyerOrders(buyerEmail: string): Order[] {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!buyerEmail) return;

    supabase
      .from('orders')
      .select('*, order_confirmations(code, confirmed_at)')
      .eq('buyer_email', buyerEmail)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data.map(rowToOrder));
      });

    const channel = supabase
      .channel(`orders-buyer-${buyerEmail}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.buyer_email === buyerEmail) {
            setOrders((prev) => [rowToOrder(payload.new), ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.buyer_email === buyerEmail) {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? rowToOrder(payload.new) : o))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [buyerEmail]);

  return orders;
}

// ── Orders: hanya pesanan masuk ke seller ini ─────────
export function useSellerOrders(sellerEmail: string): Order[] {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!sellerEmail) return;

    supabase
      .from('orders')
      .select('*, order_confirmations(code, confirmed_at)')
      .eq('seller_email', sellerEmail)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data.map(rowToOrder));
      });

    const channel = supabase
      .channel(`orders-seller-${sellerEmail}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.seller_email === sellerEmail) {
            setOrders((prev) => [rowToOrder(payload.new), ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.seller_email === sellerEmail) {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? rowToOrder(payload.new) : o))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sellerEmail]);

  return orders;
}

// Tetap export useOrders untuk kompatibilitas (buyer history)
export function useOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_confirmations(code, confirmed_at)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data.map(rowToOrder));
      });
  }, []);

  return orders;
}

export async function addOrder(input: {
  listingId: number;
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  qty: number;
}): Promise<{ order: Order; code: string } | null> {
  const now = new Date();
  const timeLabel = `Hari ini, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Insert order tanpa seller_id (tidak wajib untuk fitur konfirmasi)
  const { data: orderData, error } = await supabase
    .from('orders')
    .insert({
      listing_id: input.listingId,
      buyer_email: input.buyerEmail,
      buyer_name: input.buyerName,
      seller_email: input.sellerEmail,
      qty: input.qty,
      time: timeLabel,
      status: 'Menunggu Diambil',
    })
    .select()
    .single();

  if (error || !orderData) {
    console.error('Order insert error:', error);
    return null;
  }

  // Buat kode konfirmasi
  const code = generateConfirmationCode();
  const { error: confError } = await supabase
    .from('order_confirmations')
    .insert({
      order_id: orderData.id,
      code,
    });

  if (confError) {
    console.error('Confirmation insert error:', confError);
    // Order sudah terbuat, tetap lanjut meski konfirmasi gagal
  }

  return { order: rowToOrder(orderData), code };
}

export async function confirmOrderCode(
  orderId: number,
  inputCode: string
): Promise<boolean> {
  const { data } = await supabase
    .from('order_confirmations')
    .select('code')
    .eq('order_id', orderId)
    .single();

  if (!data || data.code !== inputCode.toUpperCase()) return false;

  // Tandai sudah dikonfirmasi
  await supabase
    .from('order_confirmations')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('order_id', orderId);

  return true;
}

export async function completeOrder(id: number): Promise<void> {
  await supabase
    .from('orders')
    .update({ status: 'Selesai' })
    .eq('id', id);
}

export async function cancelOrder(id: number): Promise<void> {
  await supabase
    .from('orders')
    .update({ status: 'Dibatalkan' })
    .eq('id', id);
}

export async function rateOrder(
  id: number,
  rating: number,
  review: string
): Promise<void> {
  await supabase
    .from('orders')
    .update({ rating, review, status: 'Selesai' })
    .eq('id', id);
}

// ── Gambar per kategori ────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  'Roti & Kue': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'Makanan Berat': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  'Sayur & Buah': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  Minuman: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
  Snack: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
};

export function imageForCategory(category: string): string {
  return CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES['Makanan Berat'];
}

// ── Profile ────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string;
  role: Role;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  bio?: string;
  paymentMethods?: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'gopay' | 'ovo' | 'dana' | 'bca' | 'bri' | 'mandiri' | 'bni';
  label: string;
  accountNumber: string;
  isDefault: boolean;
}

export interface SellerLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  listingCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProfile(r: any): Profile {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    address: r.address ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    phone: r.phone ?? undefined,
    bio: r.bio ?? undefined,
    paymentMethods: r.payment_methods ?? [],
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data ? rowToProfile(data) : null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'role'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      address: updates.address,
      lat: updates.lat,
      lng: updates.lng,
      phone: updates.phone,
      bio: updates.bio,
    })
    .eq('id', userId);

  if (error) { console.error(error); return false; }
  return true;
}

export async function updatePaymentMethods(
  userId: string,
  methods: PaymentMethod[]
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ payment_methods: methods })
    .eq('id', userId);

  if (error) { console.error(error); return false; }
  return true;
}

// Ambil semua seller yang punya koordinat (untuk peta)
export async function getSellerLocations(): Promise<SellerLocation[]> {
  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, name, address, lat, lng')
    .eq('role', 'seller')
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (!sellers) return [];

  const { data: listings } = await supabase
    .from('listings')
    .select('seller_id');

  return sellers.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address ?? '',
    lat: s.lat,
    lng: s.lng,
    listingCount: listings?.filter((l) => l.seller_id === s.id).length ?? 0,
  }));
}