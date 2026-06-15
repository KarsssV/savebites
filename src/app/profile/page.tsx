'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit2, ChevronRight, LogOut, Save, X,
  Wallet, Plus, Trash2, Check, MapPin,
  Phone, Store, User, Star
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRequireAuth, logout } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  getProfile, updateProfile, updatePaymentMethods,
  type Profile, type PaymentMethod
} from '@/lib/store';

const PAYMENT_TYPES = [
  { type: 'gopay', label: 'GoPay', color: 'bg-green-100 text-green-700' },
  { type: 'ovo', label: 'OVO', color: 'bg-purple-100 text-purple-700' },
  { type: 'dana', label: 'DANA', color: 'bg-blue-100 text-blue-700' },
  { type: 'bca', label: 'BCA', color: 'bg-blue-100 text-blue-800' },
  { type: 'bri', label: 'BRI', color: 'bg-orange-100 text-orange-700' },
  { type: 'mandiri', label: 'Mandiri', color: 'bg-yellow-100 text-yellow-700' },
  { type: 'bni', label: 'BNI', color: 'bg-orange-100 text-orange-800' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const session = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'payment' | 'location'>('info');

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Payment state
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayType, setNewPayType] = useState<PaymentMethod['type']>('gopay');
  const [newPayNumber, setNewPayNumber] = useState('');

  useEffect(() => {
    if (!session) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        getProfile(data.user.id).then((p) => {
          if (p) {
            setProfile(p);
            setFormName(p.name);
            setFormPhone(p.phone ?? '');
            setFormBio(p.bio ?? '');
            setFormAddress(p.address ?? '');
            setFormLat(String(p.lat ?? ''));
            setFormLng(String(p.lng ?? ''));
          }
        });
      }
    });
  }, [session]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Geocoding: alamat teks → koordinat (pakai Nominatim OpenStreetMap, gratis)
  const handleGeocode = async () => {
    if (!formAddress.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formAddress)}&format=json&limit=1`
      );
      const results = await res.json();
      if (results.length > 0) {
        setFormLat(results[0].lat);
        setFormLng(results[0].lon);
        alert(`Koordinat ditemukan: ${results[0].lat}, ${results[0].lon}`);
      } else {
        alert('Alamat tidak ditemukan. Coba lebih spesifik.');
      }
    } catch {
      alert('Gagal geocoding. Cek koneksi internet.');
    }
    setIsGeocoding(false);
  };

  const handleSaveInfo = async () => {
    if (!session || !profile) return;
    setIsSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const success = await updateProfile(userData.user.id, {
      name: formName,
      phone: formPhone,
      bio: formBio,
      address: formAddress,
      lat: formLat ? Number(formLat) : undefined,
      lng: formLng ? Number(formLng) : undefined,
    });

    if (success) {
      setProfile((prev) => prev ? {
        ...prev,
        name: formName,
        phone: formPhone,
        bio: formBio,
        address: formAddress,
        lat: formLat ? Number(formLat) : undefined,
        lng: formLng ? Number(formLng) : undefined,
      } : prev);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleAddPayment = async () => {
    if (!newPayNumber.trim() || !profile) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const typeInfo = PAYMENT_TYPES.find((t) => t.type === newPayType)!;
    const existing = profile.paymentMethods ?? [];
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newPayType,
      label: typeInfo.label,
      accountNumber: newPayNumber,
      isDefault: existing.length === 0,
    };
    const updated = [...existing, newMethod];
    await updatePaymentMethods(userData.user.id, updated);
    setProfile((prev) => prev ? { ...prev, paymentMethods: updated } : prev);
    setNewPayNumber('');
    setShowAddPayment(false);
  };

  const handleDeletePayment = async (id: string) => {
    if (!profile) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const updated = (profile.paymentMethods ?? []).filter((m) => m.id !== id);
    await updatePaymentMethods(userData.user.id, updated);
    setProfile((prev) => prev ? { ...prev, paymentMethods: updated } : prev);
  };

  const handleSetDefault = async (id: string) => {
    if (!profile) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const updated = (profile.paymentMethods ?? []).map((m) => ({
      ...m,
      isDefault: m.id === id,
    }));
    await updatePaymentMethods(userData.user.id, updated);
    setProfile((prev) => prev ? { ...prev, paymentMethods: updated } : prev);
  };

  if (!session) return null;

  const isSeller = session.role === 'seller';
  // Ganti bagian tabs agar buyer juga punya tab lokasi:
  const tabs = isSeller
    ? [
        { key: 'info', label: 'Profil' },
        { key: 'location', label: 'Lokasi Toko' },
        // { key: 'payment', label: 'Pembayaran' },
      ]
    : [
        { key: 'info', label: 'Profil' },
        { key: 'location', label: 'Lokasi Saya' },   
        //{ key: 'payment', label: 'Pembayaran' },
      ];

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar activeIndex={3} />

      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">
        <div className="w-full max-w-3xl mx-auto bg-cream overflow-hidden flex flex-col pb-24 md:pb-8">

          {/* Header */}
          <div className="p-6 pt-12 md:pt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-primary uppercase">
                  {session.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-text-primary">{session.name}</h1>
                <p className="text-sm text-text-secondary">{session.email}</p>
                <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {isSeller ? 'Penjual' : 'Pembeli'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            </button>
          </div>

          {/* Statistik */}
          {!isSeller && (
            <div className="px-6 mb-6">
              <div className="bg-primary-gradient p-5 rounded-[1.25rem] shadow-lg shadow-primary/30 flex items-center">
                <div className="flex-1 flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-white/80 mb-1">Uang Hemat</span>
                  <span className="text-xl font-extrabold text-white">Rp 145K</span>
                </div>
                <div className="w-px h-10 bg-white/30"></div>
                <div className="flex-1 flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-white/80 mb-1">Porsi Diselamatkan</span>
                  <span className="text-xl font-extrabold text-white">12</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="px-6 mb-4">
            <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-divider">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB: INFO ── */}
          {activeTab === 'info' && (
            <div className="px-6 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-5 border border-divider flex flex-col gap-4">

                <FormField
                  label={isSeller ? 'Nama Toko' : 'Nama Lengkap'}
                  icon={isSeller ? <Store size={16} /> : <User size={16} />}
                  value={isEditing ? formName : (profile?.name ?? session.name)}
                  onChange={setFormName}
                  editing={isEditing}
                  placeholder="Masukkan nama"
                />

                <FormField
                  label="Nomor Telepon"
                  icon={<Phone size={16} />}
                  value={isEditing ? formPhone : (profile?.phone ?? '-')}
                  onChange={setFormPhone}
                  editing={isEditing}
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                />

                {isSeller && (
                  <FormField
                    label="Deskripsi Toko"
                    icon={<Star size={16} />}
                    value={isEditing ? formBio : (profile?.bio ?? '-')}
                    onChange={setFormBio}
                    editing={isEditing}
                    placeholder="Ceritakan tokomu..."
                    multiline
                  />
                )}

                {isEditing && (
                  <button
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                  >
                    <Save size={16} />
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-400 rounded-2xl text-red-500 font-extrabold hover:bg-red-50 transition mt-2"
              >
                <LogOut size={18} /> Keluar
              </button>
            </div>
          )}

          {/* ── TAB: LOKASI (Seller only) ── */}
          {activeTab === 'location' && isSeller && (
            <div className="px-6 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-5 border border-divider flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center gap-1">
                    <MapPin size={14} className="text-primary" /> Alamat Toko
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="Jl. Contoh No. 1, Kota"
                        className="flex-1 bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleGeocode}
                        disabled={isGeocoding}
                        className="px-4 py-3 bg-primary/10 text-primary rounded-2xl text-xs font-bold hover:bg-primary/20 transition disabled:opacity-60 shrink-0"
                      >
                        {isGeocoding ? '...' : 'Cari'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
                      {profile?.address ?? 'Belum diisi'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-2">Latitude</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={formLat}
                        onChange={(e) => setFormLat(e.target.value)}
                        placeholder="-7.9666"
                        className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
                        {profile?.lat ?? '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-2">Longitude</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={formLng}
                        onChange={(e) => setFormLng(e.target.value)}
                        placeholder="112.6326"
                        className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
                        {profile?.lng ?? '-'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview peta mini jika koordinat sudah ada */}
                {profile?.lat && profile?.lng && (
                  <div className="rounded-2xl overflow-hidden border border-divider">

                    <div className="px-4 py-3 border-b border-divider bg-gray-50">
                      <h3 className="text-xs font-bold text-text-secondary">
                        Preview Lokasi Merchant
                      </h3>
                    </div>

                    <div className="h-56">
                      <MapPreview
                        lat={profile.lat}
                        lng={profile.lng}
                        name={profile.name}
                      />
                    </div>

                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                  >
                    <Save size={16} />
                    {isSaving ? 'Menyimpan...' : 'Simpan Lokasi'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: LOKASI BUYER ── */}
          {activeTab === 'location' && !isSeller && (
            <div className="px-6 flex flex-col gap-4">

              <div className="bg-white rounded-3xl p-5 border border-divider flex flex-col gap-4">

                {/* ADDRESS */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center gap-1">
                    <MapPin size={14} className="text-primary" />
                    Alamat Kamu
                  </label>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="Jl. Contoh No.1, Kota"
                        className="flex-1 bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />

                      <button
                        onClick={handleGeocode}
                        disabled={isGeocoding}
                        className="px-4 py-3 bg-primary/10 text-primary rounded-2xl text-xs font-bold hover:bg-primary/20 transition disabled:opacity-60"
                      >
                        {isGeocoding ? '...' : 'Cari'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
                      {profile?.address ?? 'Belum diisi'}
                    </p>
                  )}
                </div>

                {/* LAT LNG */}
                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-2">
                      Latitude
                    </label>

                    {isEditing ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={formLat}
                        onChange={(e) => setFormLat(e.target.value)}
                        placeholder="-7.9666"
                        className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
                        {profile?.lat ?? '-'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-2">
                      Longitude
                    </label>

                    {isEditing ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={formLng}
                        onChange={(e) => setFormLng(e.target.value)}
                        placeholder="112.6326"
                        className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
                        {profile?.lng ?? '-'}
                      </p>
                    )}
                  </div>

                </div>

                {/* PREVIEW MAP */}
                {profile?.lat && profile?.lng && (
                  <div className="rounded-2xl overflow-hidden border border-divider">
                    <div className="px-4 py-3 border-b border-divider bg-gray-50">
                      <h3 className="text-xs font-bold text-text-secondary">
                        Preview Lokasi
                      </h3>
                    </div>

                    <div className="h-56">
                      <MapPreview
                        lat={profile.lat}
                        lng={profile.lng}
                        name={session.name}
                      />
                    </div>
                  </div>
                )}

                {/* SAVE */}
                {isEditing && (
                  <button
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                  >
                    <Save size={16} />
                    {isSaving ? 'Menyimpan...' : 'Simpan Lokasi'}
                  </button>
                )}

              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-bold">Info:</span>
                  {' '}
                  Lokasi digunakan untuk menghitung jarak ke merchant terdekat
                  dan menampilkan posisi kamu pada peta.
                </p>
              </div>

            </div>
          )}

          {/* ── TAB: PEMBAYARAN ── */}
          {activeTab === 'payment' && (
            <div className="px-6 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-5 border border-divider">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                    <Wallet size={16} className="text-primary" />
                    Metode Pembayaran
                  </h3>
                  <button
                    onClick={() => setShowAddPayment(!showAddPayment)}
                    className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition"
                  >
                    <Plus size={14} /> Tambah
                  </button>
                </div>

                {/* Form tambah metode baru */}
                {showAddPayment && (
                  <div className="bg-cream/50 border border-divider rounded-2xl p-4 mb-4 flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-2">Jenis Dompet</label>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_TYPES.map((pt) => (
                          <button
                            key={pt.type}
                            onClick={() => setNewPayType(pt.type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              newPayType === pt.type
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-divider text-text-secondary hover:border-primary/40'
                            }`}
                          >
                            {pt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-2">
                        Nomor / ID Akun
                      </label>
                      <input
                        type="text"
                        value={newPayNumber}
                        onChange={(e) => setNewPayNumber(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full bg-white border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddPayment}
                        disabled={!newPayNumber.trim()}
                        className="flex-1 py-3 bg-primary text-white rounded-2xl text-xs font-bold disabled:opacity-60 hover:opacity-90 transition"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setShowAddPayment(false)}
                        className="flex-1 py-3 bg-white border border-divider text-text-secondary rounded-2xl text-xs font-bold hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Daftar metode pembayaran */}
                {(profile?.paymentMethods ?? []).length === 0 ? (
                  <div className="py-8 text-center">
                    <Wallet size={32} className="text-text-muted mx-auto mb-3" />
                    <p className="text-sm text-text-muted font-bold">Belum ada metode pembayaran</p>
                    <p className="text-xs text-text-muted mt-1">Tambahkan GoPay, OVO, atau rekening bankmu</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(profile?.paymentMethods ?? []).map((method) => {
                      const typeInfo = PAYMENT_TYPES.find((t) => t.type === method.type);
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                            method.isDefault
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-divider bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${typeInfo?.color ?? 'bg-gray-100 text-gray-700'}`}>
                              {typeInfo?.label}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{method.accountNumber}</p>
                              {method.isDefault && (
                                <p className="text-[10px] text-primary font-bold mt-0.5">● Utama</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!method.isDefault && (
                              <button
                                onClick={() => handleSetDefault(method.id)}
                                className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition"
                                title="Jadikan utama"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePayment(method.id)}
                              className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-bold">Info:</span> Metode pembayaran yang kamu simpan akan
                  digunakan sebagai pilihan saat checkout. Metode utama akan dipilih otomatis.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      <BottomNav activeIndex={3} />
    </div>
  );
}

// ── Sub-komponen ──────────────────────────────────────

function FormField({
  label, icon, value, onChange, editing, placeholder, type = 'text', multiline = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-text-secondary mb-2 flex items-center gap-1">
        <span className="text-primary">{icon}</span> {label}
      </label>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
        )
      ) : (
        <p className="text-sm text-text-primary bg-gray-50 rounded-2xl px-4 py-3">
          {value || <span className="text-text-muted">Belum diisi</span>}
        </p>
      )}
    </div>
  );
}

// Peta mini preview untuk seller (lazy loaded)
function MapPreview({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    // Import Leaflet secara dinamis
    let mapInstance: ReturnType<typeof import('leaflet')['map']> | null = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Fix ikon default Leaflet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Buat map instance
      mapInstance = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapInstance);

      L.marker([lat, lng]).addTo(mapInstance).bindPopup(name);

      // PENTING: invalidateSize setelah render agar peta mengisi container penuh
      setTimeout(() => {
        mapInstance?.invalidateSize();
      }, 100);
    };

    initMap();

    // Cleanup saat unmount
    return () => {
      mapInstance?.remove();
    };
  }, [mounted, lat, lng, name]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-xs text-text-muted">Memuat peta...</span>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

// Komponen menu (dipertahankan untuk keperluan lain)
function MenuOption({
  icon, title, onClick,
}: {
  icon: React.ReactNode; title: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition rounded-2xl group"
    >
      <div className="p-2 bg-cream rounded-xl text-text-primary group-hover:bg-primary/10 group-hover:text-primary transition">
        {icon}
      </div>
      <span className="ml-4 text-sm font-bold text-text-primary flex-1 text-left">{title}</span>
      <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition" />
    </button>
  );
}