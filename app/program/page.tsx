// app/program/page.tsx
// 🚀 FIXED: Menghapus 'use client' agar sinkron dengan dinamika data Sanity CMS secara real-time!

import React from 'react';
import Campaign from '@/components/Campaign';

// 🚀 JURUS SAKTI ANTI-CACHE: Memaksa Next.js mengambil data segar dari API Sanity setiap halaman diakses
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProgramPage() {
  return (
    // 🚀 FIXED: Menyelaraskan md:px-12 menjadi md:px-16 agar presisi lurus simetris dengan halaman Home & Blog
    <div className="min-h-screen bg-gray-50 px-4 md:px-16 py-12">
      {/* 🚀 FIXED: Mengubah max-w-6xl menjadi max-w-5xl agar selaras 100% dengan Header & Footer */}
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* ===================================================================
            HEADER JUDUL HALAMAN (MINIMALIS & TEGAS)
            =================================================================== */}
        <div className="border-l-4 border-emerald-500 pl-6 py-1.5">
          {/* Menyelaraskan warna ke abu-abu gelap #333333 khas Liputan6 agar senada dengan halaman lainnya */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] tracking-tight">
            Semua Program Kebaikan
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">
            Jelajahi dan salurkan infak terbaik Anda secara instan amanah melalui QRIS terintegrasi
          </p>
        </div>

        {/* ===================================================================
            GRID COMPONENT: MENAMPILKAN CARDS & FITUR FILTERING DATA REAL-TIME
            =================================================================== */}
        <div className="bg-transparent">
          <Campaign />
        </div>

      </div>
    </div>
  );
}