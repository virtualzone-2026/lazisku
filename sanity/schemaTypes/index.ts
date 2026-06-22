import program from './program';   // File skema program donasi Anda
import news from './news';         // Skema kabar berita
import category from './category'; // 🚀 BARU: Mengimpor skema kategori artikel/berita

export const schemaTypes = [
  program,
  category, // 🚀 BARU: Didaftarkan agar Anda bisa membuat master kategori di dashboard
  news,     // Skema berita yang sekarang sudah terelasi dengan skema kategori di atas
];