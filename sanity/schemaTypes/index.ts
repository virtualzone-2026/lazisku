// schemas/index.ts
import program from './program';           // File skema program donasi Anda
import news from './news';                 // Skema kabar berita
import category from './category';         // Skema kategori artikel/berita
import donationTransaction from './donationTransaction'; // Penampung data transaksi pending (Nama & WA)
import laporan from './laporan';           // Skema laporan yayasan
// 🚀 FIXED: Mengimpor skema pendaftaran fundraiser yang baru dibuat
import fundraiser from './fundraiser'; 

export const schemaTypes = [
  program,
  laporan, 
  category, 
  news,      
  donationTransaction,
  // 🚀 FIXED: Didaftarkan ke dalam array agar aktif di dashboard & API Sanity Studio
  fundraiser
];