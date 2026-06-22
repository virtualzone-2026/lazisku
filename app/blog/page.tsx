'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setNewsList(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400 font-medium text-sm">Memuat kabar terbaru...</div>;
  if (newsList.length === 0) return <div className="text-center py-20 text-gray-400 text-sm">Belum ada berita yang diterbitkan.</div>;

  const heroPost = newsList[0];
  const remainingPosts = newsList.slice(1);

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* ===================================================================
          HERO SECTION: BERITA UTAMA (🚀 FIXED: max-w-5xl & px-4 md:px-16)
          =================================================================== */}
      <section className="px-4 md:px-16 py-10 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <Link href={`/blog/${heroPost.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual Gambar Besar (Maksimal 7 Kolom Desktop) */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-gray-200/80 bg-gray-100">
                <img 
                  src={heroPost.image} 
                  alt={heroPost.title} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    Headline
                  </span>
                </div>
              </div>
            </div>

            {/* Konten Teks Headline */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="space-y-1.5">
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider block">
                  {heroPost.category || 'Kabar Terbaru'}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] leading-tight tracking-tight group-hover:text-emerald-600 transition-colors duration-300">
                  {heroPost.title}
                </h1>
              </div>
              <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed line-clamp-3">
                Baca selengkapnya mengenai update aktivitas penyaluran amanah dan kabar perkembangan yayasan Wasilah Hidayah Nusantara di lapangan...
              </p>
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-gray-400 pt-1">
                <span className="text-gray-600">Redaksi Wasilah</span>
                <span>•</span>
                <span>{heroPost.timeAgo}</span>
              </div>
            </div>

          </Link>
        </div>
      </section>

      {/* ===================================================================
          GRID SECTION: DAFTAR BERITA LAINNYA (🚀 FIXED: max-w-5xl & px-4 md:px-16)
          =================================================================== */}
      <section className="px-4 md:px-16 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Sub-Header */}
          <div className="border-l-4 border-emerald-500 pl-4 py-0.5">
            <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wider">Informasi Terkini</h2>
            <p className="text-gray-400 text-xs font-medium">Kumpulan laporan dan artikel edukasi dari yayasan</p>
          </div>

          {/* Grid Berita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`} 
                className="group flex flex-col space-y-3 bg-white p-2 rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-sm transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="bg-white/95 backdrop-blur text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase">
                      {post.category || 'Info'}
                    </span>
                  </div>
                </div>

                {/* Info Teks */}
                <div className="space-y-1.5 px-1 py-0.5">
                  <h3 className="text-sm font-bold text-[#333333] leading-snug tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-0.5">
                    <span>{post.timeAgo}</span>
                    <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform">Baca ➔</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}