// app/page.tsx
import React from 'react';
import Hero from '@/components/Hero';
import Campaign from '@/components/Campaign';
import News from '@/components/News';

// 🚀 JURUS SAKTI ANTI-CACHE: Memaksa Next.js untuk selalu mengambil data paling segar dari API Sanity saat halaman diakses!
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section (Layar Utama Atas dengan Call to Action) */}
      <Hero />
      
      {/* 2. Container Area Konten Utama */}
      {/* 🚀 FIXED: Menyelaraskan md:px-12 menjadi md:px-16 agar presisi lurus bergaris dengan Header, Footer, dan halaman list berita */}
      <div className="min-h-screen bg-gray-50 px-4 md:px-16 py-12">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* ===================================================================
              SEKSI 1: PROGRAM GALANG DANA (LENGKAP DENGAN FILTER & REAL-TIME SEARCH)
              =================================================================== */}
          <div className="space-y-6">
            <div className="border-l-4 border-emerald-500 pl-6 py-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#333333] tracking-tight">
                Program Galang Dana
              </h2>
              <p className="text-gray-500 mt-1 font-medium text-sm">
                Salurkan infak terbaik Anda via QRIS Instan untuk berbagai sektor kebaikan
              </p>
            </div>
            
            {/* Memanggil komponen grid campaign ter-filter */}
            <Campaign />
          </div>

          {/* ===================================================================
              SEKSI 2: KABAR & INFORMASI TERBARU YAYASAN (GRID 4 KOLOM MINIMALIS)
              =================================================================== */}
          <News />

        </div>
      </div>
    </>
  );
}