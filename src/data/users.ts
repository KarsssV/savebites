// "Database" akun statis (lokal, tanpa backend).
// Dua peran: pembeli (buyer) dan penjual (seller).

export type Role = 'buyer' | 'seller';

export interface Account {
  email: string;
  password: string;
  name: string;
  role: Role;
}

// Akun demo bawaan. Pakai untuk login.
export const accounts: Account[] = [
  {
    email: 'buyer@savebites.com',
    password: 'buyer123',
    name: 'Sobat Penyelamat',
    role: 'buyer',
  },
  {
    email: 'seller@savebites.com',
    password: 'seller123',
    name: 'Toko Roti Mawar',
    role: 'seller',
  },
];
