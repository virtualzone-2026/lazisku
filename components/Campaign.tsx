'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Campaign() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🚀 STATE UNTUK FILTER & PENCARIAN
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 🚀 FIXED DYNAMIC FETCH: Ditambahkan parameter timestamp (?v=) dan cache: no-store agar kebal cache Next.js!
    fetch('/api/programs?v=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPrograms(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Campaign component fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-gray-500 font-medium text-sm">Memuat program kebaikan...</div>;
  }

  // 🚀 PROSES FILTERING DATA SECARA REAL-TIME
  const filteredPrograms = programs.filter((program) => {
    // Match Kategori (Kebal huruf besar-kecil)
    const matchesCategory = 
      selectedCategory === 'SEMUA' || 
      program.category?.toUpperCase() === selectedCategory;
    
    // Match Teks Pencarian (Judul Campaign)
    const matchesSearch = program.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* ===================================================================
          BARIS FILTER KATEGORI & SEARCH BAR (POLOS TANPA BUNGKUS KOTAK BESAR)
          =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        
        {/* Navigasi Filter Kategori (Kiri) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedCategory('SEMUA')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
              selectedCategory === 'SEMUA'
                ? 'bg-yellow-400 text-gray-900 border-yellow-400 font-black shadow-yellow-100'
                : 'bg-white text-gray-500 hover:text-emerald-600 border-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedCategory('KEMANUSIAAN')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
              selectedCategory === 'KEMANUSIAAN'
                ? 'bg-yellow-400 text-gray-900 border-yellow-400 font-black shadow-yellow-100'
                : 'bg-white text-gray-500 hover:text-emerald-600 border-gray-200'
            }`}
          >
            Kemanusiaan
          </button>
          <button
            onClick={() => setSelectedCategory('PENDIDIKAN')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
              selectedCategory === 'PENDIDIKAN'
                ? 'bg-yellow-400 text-gray-900 border-yellow-400 font-black shadow-yellow-100'
                : 'bg-white text-gray-500 hover:text-emerald-600 border-gray-200'
            }`}
          >
            Pendidikan
          </button>
        </div>

        {/* Input Box Pencarian (Kanan) */}
        <div className="relative max-w-xs w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari galang dana..."
            className="w-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 pl-10 pr-4 py-3.5 rounded-xl placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      {/* ===================================================================
          GRID LAYOUT CARD CAMPAIGN GALANG DANA
          =================================================================== */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400 text-xs font-medium">
          Tidak ditemukan program galang dana yang cocok gaes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300">
              <div>
                {/* Gambar Campaign Dinamis dari Sanity CDN */}
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100">
                  <img src={program.image} alt={program.title} className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                  <span className="absolute top-3 left-3 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                    {program.category}
                  </span>
                </div>

                {/* Judul Campaign */}
                <h2 className="font-bold text-gray-800 mt-4 text-base uppercase line-clamp-2 min-h-[3rem]">
                  {program.title}
                </h2>
                
                {/* Status Dana Terkumpul Dinamis */}
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-4">
                  <div>
                    <p>TERKUMPUL</p>
                    <p className="font-bold text-emerald-600 text-sm mt-0.5">{program.collected}</p>
                  </div>
                  <div className="text-right">
                    <p>TARGET</p>
                    <p className="font-bold text-gray-700 text-sm mt-0.5">{program.target}</p>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Menuju Halaman Detail Campaign */}
              <div className="mt-5 pt-4 border-t border-gray-50">
                <Link
                  href={`/campaign/${program.slug}`}
                  className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-widest shadow-sm shadow-emerald-100"
                >
                  Infak Sekarang
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}