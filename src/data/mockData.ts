export const mockListings = [
  {
    id: 1,
    title: "Paket Roti Manis Sisa Hari Ini",
    merchant: "Toko Roti Mawar",
    merchantLocation: "Jl. Soekarno Hatta No. 12, Malang",
    distance: "1.2 km",
    rating: 4.8,
    reviews: 124,
    originalPrice: 25000,
    discountPrice: 10000,
    stock: 3,
    timeLeft: "2 Jam",
    category: "Roti & Kue",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    description: "Paket berisi 3-4 roti manis (campur rasa coklat, keju, dan sosis) produksi hari ini. Kondisi masih sangat layak konsumsi dan enak, dijual murah untuk menghindari food waste.",
    allergens: ["Gandum", "Susu", "Telur"]
  },
  {
    id: 2,
    title: "Nasi Campur Ayam (Surplus)",
    merchant: "Warung Bu Sri",
    merchantLocation: "Jl. MT Haryono No. 45, Malang",
    distance: "0.8 km",
    rating: 4.5,
    reviews: 89,
    originalPrice: 20000,
    discountPrice: 8000,
    stock: 5,
    timeLeft: "1 Jam",
    category: "Makanan Berat",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
    description: "Nasi campur lengkap dengan lauk ayam goreng, sayur, dan sambal. Stok berlebih hari ini yang masih sangat fresh dan nikmat.",
    allergens: ["Kacang", "Telur"]
  },
  {
    id: 3,
    title: "Sayur Organik Campur",
    merchant: "Pasar Segar",
    merchantLocation: "Jl. Tlogomas No. 8, Malang",
    distance: "2.5 km",
    rating: 4.9,
    reviews: 210,
    originalPrice: 35000,
    discountPrice: 15000,
    stock: 2,
    timeLeft: "4 Jam",
    category: "Sayur & Buah",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    description: "Sayuran organik sisa panen hari ini. Terdapat bayam, kangkung, dan wortel. Sangat cocok untuk dibuat salad atau ditumis.",
    allergens: []
  },
  {
    id: 4,
    title: "Croissant & Pastry Set",
    merchant: "La Paris Bakery",
    merchantLocation: "Jl. Ijen No. 22, Malang",
    distance: "3.1 km",
    rating: 4.7,
    reviews: 156,
    originalPrice: 60000,
    discountPrice: 25000,
    stock: 1,
    timeLeft: "30 Mnt",
    category: "Roti & Kue",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80",
    description: "Set pastry lezat isi croissant butter dan pain au chocolat. Sisa etalase hari ini, masih renyah dan nikmat dengan secangkir teh.",
    allergens: ["Gandum", "Susu", "Telur"]
  }
];

export const mockOrders = [
  {
    id: 1,
    listingId: 1,
    time: "Hari ini, 13:40",
    status: "Menunggu Diambil",
    qty: 1
  },
  {
    id: 2,
    listingId: 2,
    time: "Kemarin, 19:20",
    status: "Selesai",
    qty: 2
  },
  {
    id: 3,
    listingId: 4,
    time: "12 Mei 2026, 20:15",
    status: "Selesai",
    qty: 1
  }
];

export const mockMapPins = [
  { id: 1, listingId: 1, top: '40%', left: '30%' },
  { id: 2, listingId: 2, top: '55%', left: '60%' },
  { id: 3, listingId: 3, top: '30%', left: '70%' },
];
