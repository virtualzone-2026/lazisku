'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    // 🚀 CONTAINER UTAMA DENGAN ORNAMEN FUTURISTIK ELEGAN
    <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-gray-950 overflow-hidden shrink-0">
      
      {/* 1. Background Image dengan Efek Parallax Sederhana */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 opacity-40"
        style={{ 
          backgroundImage: "url('/images/hero-bg.png')",
          filter: 'blur(2px)'
        }}
      />

      {/* 2. Cyberpunk Grid & Glow Ornaments */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Aurora Ambient Glow Efek Kiri & Kanan */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] z-10" />

      {/* 3. Overlay Gelap Dinamis (Gradient) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-gray-950 via-gray-950/80 to-gray-950" />

      {/* 4. Konten Utama Hero */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 md:px-12 py-24 text-center flex flex-col items-center">
        
        {/* 🚀 FIXED AREA LOGO: Bersih, Menyala dengan Glow Futuristik Halus */}
        <div className="flex items-center mb-12 cursor-pointer group select-none">
          <div className="relative h-28 md:h-32 w-auto flex items-center justify-center transition-all duration-750 ease-out group-hover:scale-105">
            {/* Ambient Radial Glow di Belakang Logo Saat Hover */}
            <div className="absolute inset-0 bg-emerald-500/0 rounded-full blur-2xl transition-all duration-700 group-hover:bg-emerald-500/20" />
            <img 
              src="/images/logo-lazisku.png" 
              alt="Logo lazisku" 
              className="relative z-10 h-full w-auto object-contain transition-all duration-700 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:drop-shadow-[0_0_30px_rgba(52,211,153,0.7)]"
            />
          </div>
        </div>

        {/* Judul Utama (Headline) Gradasi & Aksen Neon Glow */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 leading-[1.15] mb-8 uppercase">
          Wujudkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Senyum</span> Mereka Dengan <span className="relative inline-block text-white">
            <span className="relative z-10">Sedekah</span>
            <span className="absolute bottom-2 left-0 w-full h-[6px] bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] -z-10"></span>
          </span> Anda
        </h1>

        {/* Deskripsi Singkat (Sub-headline) Halus & Clean */}
        <p className="text-gray-400 text-base md:text-lg mb-14 max-w-3xl leading-relaxed tracking-wide font-normal">
          Salurkan bantuan terbaik Anda melalui <span className="text-white font-semibold border-b border-emerald-500/30 pb-0.5">Yayasan Khoiro Ummah Bina Umat</span> secara transparan, amanah, dan instan menggunakan QRIS. Setiap rupiah yang Anda donasikan adalah jembatan masa depan bagi sesama.
        </p>

        {/* Tombol Ajakan Bertindak (CTA Button) Futuristik Elegan */}
        <Link
          href="/program"
          className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold tracking-widest px-10 py-4.5 rounded-full text-xs uppercase shadow-lg shadow-emerald-950/40 border border-emerald-400/20 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20 hover:border-emerald-400/40"
        >
          {/* Efek Kilatan Scanner Cahaya Medial */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          
          <span className="relative z-10 flex items-center gap-2">
            Donasi Sekarang
            <svg 
              className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              viewBox="0 0 24 24" 
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>

      </div>
    </section>
  );
}