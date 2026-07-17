// schemas/index.ts
import program from './program';           // File skema program donasi Anda
import news from './news';                 // Skema kabar berita
import category from './category';         // Skema kategori artikel/berita
import donationTransaction from './donationTransaction'; // Penampung data transaksi pending (Nama & WA)
// 🚀 FIXED: Mengimpor skema laporan yang baru dibuat
import laporan from './laporan'; 

export const schemaTypes = [
  program,
  // 🚀 FIXED: Didaftarkan ke dalam array agar aktif di dashboard & API Sanity Studio
  laporan, 
  category, 
  news,      
  donationTransaction 
];