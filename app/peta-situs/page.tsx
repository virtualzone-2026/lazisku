// app/peta-situs/page.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import { Metadata } from 'next';
import { createClient } from 'next-sanity';

// 🚀 CONFIG SANITY CLIENT BYPASS SAFE BULLETPROOF
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '19a8r8sr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20',
  useCdn: false,
});

// ===================================================================
// META DATA SEO TAK TERTANDINGI (OPEN GRAPH & METADATA LENGKAP)
// ===================================================================
export const metadata: Metadata = {
  title: 'Peta Situs Resmi (Sitemap) | LAZIS Khoiro Ummah',
  description: 'Indeks navigasi lengkap seluruh program donasi, zakat digital, infak kemanusiaan, wakaf, dan kabar berita pembaruan LAZIS Khoiro Ummah.',
  alternates: {
    canonical: 'https://www.lazisku.com/peta-situs',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Peta Situs Resmi (Sitemap) | LAZIS Khoiro Ummah',
    description: 'Akses cepat seluruh struktur halaman program kebaikan dan transparansi laporan LAZIS Khoiro Ummah.',
    url: 'https://www.lazisku.com/peta-situs',
    siteName: 'LAZIS Khoiro Ummah',
    locale: 'id_ID',
    type: 'website',
  },
};

// Interface Data Fetching
interface SitemapItem {
  title: string;
  slug: string;
  _createdAt?: string;
}

export default async function PetaSitusPage() {
  let programs: SitemapItem[] = [];
  let news: SitemapItem[] = [];

  try {
    // Ambil data agregat langsung dari Sanity secara simultan
    const query = `{
      "programs": *[_type == "program"] | order(_createdAt desc) { title, "slug": slug.current },
      "news": *[_type == "news"] | order(publishedAt desc) { title, "slug": slug.current }
    }`;
    
    const data = await sanityClient.fetch(query);
    programs = data.programs || [];
    news = data.news || [];
  } catch (error) {
    console.error('Gagal memuat data peta situs untuk SEO:', error);
  }

  // Struktur Halaman Statis Inti Internal
  const halamanInti = [
    { title: 'Beranda / Halaman Utama', url: '/' },
    { title: 'Kalkulator Zakat Otomatis', url: '/kalkulator' },
    { title: 'Semua Program Donasi', url: '/program-donasi' },
    { title: 'Tentang Kami & Legalitas', url: '/tentang-kami' },
    { title: 'Hubungi Kami (Layanan Amil)', url: '/hubungi-kami' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:px-16 text-left">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="border-b border-gray-200 pb-6 space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-[#333333] uppercase tracking-tight">
            Peta Situs Resmi (HTML Sitemap)
          </h1>
          <p className="text-xs text-gray-500 font-semibold tracking-wide leading-relaxed max-w-2xl">
            Halaman ini disediakan untuk mempermudah perayapan indeks robot mesin pencari (Google, Bing, Yandex) sekaligus membantu donatur menavigasi seluruh struktur direktori URL LAZIS Khoiro Ummah secara linear dan transparan.
          </p>
        </div>

        {/* STRUCTURE SITEMAP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* KOLOM 1: HALAMAN UTAMA & INTERNAL */}
          <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm space-y-4">
            <h2 className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-none uppercase tracking-widest inline-block">
              📂 Halaman Utama & Fitur
            </h2>
            <ul className="space-y-2.5 text-xs font-bold text-gray-600">
              {halamanInti.map((item, idx) => (
                <li key={idx} className="border-b border-gray-50 pb-2 last:border-none">
                  <a href={item.url} className="hover:text-emerald-600 transition block">
                    {item.title} <span className="text-[10px] text-gray-300 font-normal block mt-0.5">{`https://www.lazisku.com${item.url}`}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLOM 2: PROGRAM KAMPANYE AKTIF (DYNAMIC SANITY) */}
          <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm space-y-4">
            <h2 className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-none uppercase tracking-widest inline-block">
              📦 Program Kebaikan Aktif ({programs.length})
            </h2>
            {programs.length > 0 ? (
              <ul className="space-y-2.5 text-xs font-bold text-gray-600 max-h-[500px] overflow-y-auto pr-1">
                {programs.map((item, idx) => (
                  <li key={idx} className="border-b border-gray-50 pb-2 last:border-none">
                    <a href={`/campaign/${item.slug}`} className="hover:text-emerald-600 transition block">
                      {item.title} <span className="text-[10px] text-gray-300 font-normal block mt-0.5">{`https://www.lazisku.com/campaign/${item.slug}`}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-gray-400 italic">Belum ada program kampanye aktif.</p>
            )}
          </div>

          {/* KOLOM 3: BERITA KEMANUSIAAN & EDUKASI Islam (DYNAMIC SANITY) */}
          <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm space-y-4">
            <h2 className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-none uppercase tracking-widest inline-block">
              📰 Berita & Kabar Penyaluran ({news.length})
            </h2>
            {news.length > 0 ? (
              <ul className="space-y-2.5 text-xs font-bold text-gray-600 max-h-[500px] overflow-y-auto pr-1">
                {news.map((item, idx) => (
                  <li key={idx} className="border-b border-gray-50 pb-2 last:border-none">
                    <a href={`/news/${item.slug}`} className="hover:text-emerald-600 transition block">
                      {item.title} <span className="text-[10px] text-gray-300 font-normal block mt-0.5">{`https://www.lazisku.com/news/${item.slug}`}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-gray-400 italic">Belum ada artikel berita diterbitkan.</p>
            )}
          </div>

        </div>

        {/* FOOTER METRICS INFO */}
        <div className="text-center md:text-left text-[10px] text-gray-400 font-semibold tracking-wide pt-4 border-t border-gray-200">
          © {new Date().getFullYear()} LAZIS Khoiro Ummah. Nilai tautan peta situs dipetakan otomatis terintegrasi skema indeks.
        </div>

      </div>
    </div>
  );
}