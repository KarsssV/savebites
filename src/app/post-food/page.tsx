'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  Clock,
  DollarSign,
  Package,
  Tag,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Store,
  Trash2,
  Plus,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

const CATEGORIES = ['Roti & Kue', 'Makanan Berat', 'Minuman', 'Sayur & Buah', 'Snack', 'Lainnya'];
const ALLERGEN_OPTIONS = ['Gandum', 'Susu', 'Telur', 'Kacang', 'Seafood', 'Kedelai'];
const TIME_OPTIONS = ['30 Menit', '1 Jam', '2 Jam', '3 Jam', '4 Jam', 'Hingga Malam Ini'];

export default function PostFoodScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    category: '',
    originalPrice: '',
    discountPrice: '',
    stock: '',
    timeLeft: '',
    description: '',
  });
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleAllergen = (a: string) => {
    setSelectedAllergens(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const discountPercent = () => {
    const ori = parseFloat(form.originalPrice);
    const disc = parseFloat(form.discountPrice);
    if (!ori || !disc || ori <= 0) return null;
    return Math.round((1 - disc / ori) * 100);
  };

  const isFormValid =
    form.title.trim() &&
    form.category &&
    form.originalPrice &&
    form.discountPrice &&
    form.stock &&
    form.timeLeft;

  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-cream flex">
        <Sidebar activeIndex={-1} />
        <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 px-8 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-text-primary mb-2">Berhasil Diposting!</h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                Makananmu sudah tayang dan siap diselamatkan oleh pembeli terdekat.
              </p>
            </div>
            <div className="w-full max-w-xs flex flex-col gap-3">
              <button
                onClick={() => router.push('/home')}
                className="w-full py-4 bg-primary text-white font-extrabold rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => { setIsSubmitted(false); setForm({ title: '', category: '', originalPrice: '', discountPrice: '', stock: '', timeLeft: '', description: '' }); setImagePreview(null); setSelectedAllergens([]); }}
                className="w-full py-4 bg-white border border-divider text-text-primary font-bold rounded-2xl hover:bg-gray-50 transition"
              >
                Posting Lagi
              </button>
            </div>
          </div>
        </main>
        <BottomNav activeIndex={-1} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <Sidebar activeIndex={-1} />

      <main className="flex-1 md:ml-64 w-full relative pb-24 md:pb-0">

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-divider px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-text-primary leading-none">Posting Makanan</h1>
            <p className="text-xs text-text-muted mt-0.5">Selamatkan makanan surplusmu dari food waste</p>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto px-6 py-6 flex flex-col gap-6">

          {/* =====================
              UPLOAD FOTO
          ===================== */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-divider">
            <SectionLabel icon={<Camera size={16} />} label="Foto Makanan" />
            <label htmlFor="image-upload" className="cursor-pointer block">
              {imagePreview ? (
                <div className="relative w-full h-52 rounded-2xl overflow-hidden group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <span className="text-white font-bold text-sm">Ganti Foto</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setImagePreview(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-44 rounded-2xl border-2 border-dashed border-divider bg-gray-50 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Camera size={22} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">Tap untuk unggah foto</p>
                    <p className="text-xs text-text-muted mt-1">JPG, PNG — maks. 5MB</p>
                  </div>
                </div>
              )}
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* =====================
              INFO DASAR
          ===================== */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-divider flex flex-col gap-5">
            <SectionLabel icon={<Store size={16} />} label="Informasi Makanan" />

            {/* Nama Makanan */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2">Nama Makanan *</label>
              <input
                type="text"
                placeholder="Contoh: Paket Roti Manis Sisa Hari Ini"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {/* Kategori */}
            <div className="relative">
              <label className="block text-xs font-bold text-text-secondary mb-2">Kategori *</label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`w-full bg-gray-50 border rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between transition ${form.category ? 'text-text-primary border-primary' : 'text-text-muted border-divider'} focus:outline-none hover:border-primary`}
              >
                <span>{form.category || 'Pilih kategori...'}</span>
                <ChevronDown size={16} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-divider rounded-2xl shadow-xl z-20 overflow-hidden">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { handleChange('category', cat); setShowCategoryDropdown(false); }}
                      className={`w-full px-5 py-3 text-left text-sm font-bold hover:bg-primary/5 transition ${form.category === cat ? 'text-primary bg-primary/5' : 'text-text-primary'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2">Deskripsi (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Ceritakan lebih detail tentang makananmu, kondisi, isi paket, dll..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
              />
            </div>
          </div>

          {/* =====================
              HARGA
          ===================== */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-divider flex flex-col gap-5">
            <SectionLabel icon={<DollarSign size={16} />} label="Harga" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">Harga Normal (Rp) *</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={form.originalPrice}
                  onChange={e => handleChange('originalPrice', e.target.value)}
                  className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={form.discountPrice}
                  onChange={e => handleChange('discountPrice', e.target.value)}
                  className="w-full bg-gray-50 border border-divider rounded-2xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
            </div>

            {/* Indikator Diskon */}
            {discountPercent() !== null && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${discountPercent()! > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <Tag size={16} />
                {discountPercent()! > 0
                  ? `Diskon ${discountPercent()}% — Hemat Rp ${(parseFloat(form.originalPrice) - parseFloat(form.discountPrice)).toLocaleString('id-ID')}`
                  : 'Harga jual harus lebih rendah dari harga normal'}
              </div>
            )}
          </div>

          {/* =====================
              STOK & WAKTU
          ===================== */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-divider flex flex-col gap-5">
            <SectionLabel icon={<Package size={16} />} label="Stok & Ketersediaan" />

            <div className="grid grid-cols-2 gap-4">
              {/* Stok */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">Jumlah Stok *</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-divider rounded-2xl px-4 py-2">
                  <button
                    type="button"
                    onClick={() => handleChange('stock', String(Math.max(1, parseInt(form.stock || '1') - 1)))}
                    className="w-7 h-7 rounded-full bg-white border border-divider flex items-center justify-center font-bold text-text-primary hover:bg-gray-100 transition"
                  >-</button>
                  <span className="flex-1 text-center font-extrabold text-text-primary text-sm">
                    {form.stock || '0'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChange('stock', String(parseInt(form.stock || '0') + 1))}
                    className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:opacity-90 transition"
                  >+</button>
                </div>
              </div>

              {/* Waktu Ambil */}
              <div className="relative">
                <label className="block text-xs font-bold text-text-secondary mb-2">Batas Waktu Ambil *</label>
                <button
                  type="button"
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className={`w-full bg-gray-50 border rounded-2xl px-3 py-3 text-sm text-left flex items-center justify-between transition ${form.timeLeft ? 'text-text-primary border-primary' : 'text-text-muted border-divider'} hover:border-primary`}
                >
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary shrink-0" />
                    <span className="truncate">{form.timeLeft || 'Pilih...'}</span>
                  </div>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-divider rounded-2xl shadow-xl z-20 overflow-hidden">
                    {TIME_OPTIONS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { handleChange('timeLeft', t); setShowTimeDropdown(false); }}
                        className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/5 transition ${form.timeLeft === t ? 'text-primary bg-primary/5' : 'text-text-primary'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================
              ALERGEN
          ===================== */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-divider flex flex-col gap-4">
            <SectionLabel icon={<AlertTriangle size={16} />} label="Informasi Alergen (Opsional)" />
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergen(a)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition ${selectedAllergens.includes(a)
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'bg-gray-50 border-divider text-text-secondary hover:border-accent/40'
                  }`}
                >
                  {selectedAllergens.includes(a) && '✓ '}{a}
                </button>
              ))}
            </div>
            {selectedAllergens.length > 0 && (
              <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                Mengandung: {selectedAllergens.join(', ')}
              </p>
            )}
          </div>

          {/* =====================
              TOMBOL SUBMIT
          ===================== */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-4 rounded-2xl font-extrabold text-base transition transform active:scale-95 flex items-center justify-center gap-2 ${isFormValid
              ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:opacity-90'
              : 'bg-gray-100 text-text-muted cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            Posting Sekarang
          </button>

          {!isFormValid && (
            <p className="text-center text-xs text-text-muted -mt-3">Lengkapi semua kolom wajib (*) untuk melanjutkan</p>
          )}

          <div className="h-4" />
        </div>
      </main>

      <BottomNav activeIndex={-1} />
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="text-primary">{icon}</div>
      <h2 className="text-sm font-extrabold text-text-primary">{label}</h2>
    </div>
  );
}
