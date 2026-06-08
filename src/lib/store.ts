'use client';

// "Backend" sederhana untuk demo lokal: localStorage sebagai database bersama.
// Real-time antar-tab lewat event `storage` (tab lain) + event kustom (tab ini).
// Penjual menambah makanan -> pembeli langsung lihat. Pembeli pesan/menilai ->
// penjual langsung tahu.

import { useMemo, useSyncExternalStore } from 'react';
import { mockListings, mockOrders } from '@/data/mockData';

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
  category: string;
  image: string;
  description: string;
  allergens: string[];
  sellerEmail: string;
}

export type OrderStatus = 'Menunggu Diambil' | 'Selesai' | 'Dibatalkan';

export interface Order {
  id: number;
  listingId: number;
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  qty: number;
  time: string;
  status: OrderStatus;
  rating?: number;
  review?: string;
}

const LISTINGS_KEY = 'savebites:listings';
const ORDERS_KEY = 'savebites:orders';
const DATA_EVENT = 'savebites:data-change';

// Email akun demo (lihat src/data/users.ts) untuk memberi pemilik pada data awal.
const DEMO_SELLER = 'seller@savebites.com';
const DEMO_BUYER = 'buyer@savebites.com';

// --- Data awal (seed) ---
const seedListings: Listing[] = mockListings.map((l) => ({ ...l, sellerEmail: DEMO_SELLER }));
const seedOrders: Order[] = mockOrders.map((o) => ({
  id: o.id,
  listingId: o.listingId,
  buyerEmail: DEMO_BUYER,
  buyerName: 'Sobat Penyelamat',
  sellerEmail: DEMO_SELLER,
  qty: o.qty,
  time: o.time,
  status: o.status as OrderStatus,
}));
const seedListingsJson = JSON.stringify(seedListings);
const seedOrdersJson = JSON.stringify(seedOrders);

// --- Sinkronisasi ---
function emit() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DATA_EVENT));
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(DATA_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(DATA_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// --- Listings ---
function listingsSnapshot(): string {
  if (typeof window === 'undefined') return seedListingsJson;
  return window.localStorage.getItem(LISTINGS_KEY) ?? seedListingsJson;
}

function readListings(): Listing[] {
  try {
    return JSON.parse(listingsSnapshot()) as Listing[];
  } catch {
    return seedListings;
  }
}

function saveListings(list: Listing[]) {
  window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(list));
  emit();
}

export function useListings(): Listing[] {
  const raw = useSyncExternalStore(subscribe, listingsSnapshot, () => seedListingsJson);
  return useMemo(() => JSON.parse(raw) as Listing[], [raw]);
}

export function addListing(input: Omit<Listing, 'id'>): Listing {
  const list = readListings();
  const id = list.reduce((max, l) => Math.max(max, l.id), 0) + 1;
  const listing: Listing = { ...input, id };
  saveListings([listing, ...list]);
  return listing;
}

// --- Orders ---
function ordersSnapshot(): string {
  if (typeof window === 'undefined') return seedOrdersJson;
  return window.localStorage.getItem(ORDERS_KEY) ?? seedOrdersJson;
}

function readOrders(): Order[] {
  try {
    return JSON.parse(ordersSnapshot()) as Order[];
  } catch {
    return seedOrders;
  }
}

function saveOrders(list: Order[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  emit();
}

export function useOrders(): Order[] {
  const raw = useSyncExternalStore(subscribe, ordersSnapshot, () => seedOrdersJson);
  return useMemo(() => JSON.parse(raw) as Order[], [raw]);
}

function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `Hari ini, ${hh}:${mm}`;
}

export function addOrder(input: {
  listingId: number;
  buyerEmail: string;
  buyerName: string;
  sellerEmail: string;
  qty: number;
}): Order {
  const list = readOrders();
  const id = list.reduce((max, o) => Math.max(max, o.id), 0) + 1;
  const order: Order = { ...input, id, time: nowLabel(), status: 'Menunggu Diambil' };
  saveOrders([order, ...list]);
  return order;
}

function patchOrder(id: number, patch: Partial<Order>) {
  saveOrders(readOrders().map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

export function cancelOrder(id: number) {
  patchOrder(id, { status: 'Dibatalkan' });
}

export function rateOrder(id: number, rating: number, review: string) {
  patchOrder(id, { rating, review, status: 'Selesai' });
}

// Gambar bawaan per kategori (hemat penyimpanan: simpan URL, bukan file).
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
