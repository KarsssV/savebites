import { redirect } from 'next/navigation';

export default function RootPage() {
  // Sementara diarahkan ke halaman login sebagai titik awal alur aplikasi
  redirect('/login');
}