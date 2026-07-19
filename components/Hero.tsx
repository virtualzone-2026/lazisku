'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    // 🚀 CONTAINER UTAMA: Menggunakan grid asimetris untuk meniru layout referensi mewah
    <section className="relative w-full min-h-[95vh] flex items-center bg-gray-950 overflow-hidden shrink-0 pb-20 pt-28 md:pt-20">
      
      {/* 1. Background Cityscape / Dokumentasi dengan Opasitas Rendah */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ 
          backgroundImage: "url('/images/hero-bg.png')",
          filter: 'grayscale(30%)'
        }}
      />

      {/* 2. Cyberpunk Grid & Glow Ornaments */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)]" />
      
      {/* Glow Efek di Sisi Kiri Teks */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] z-10 animate-pulse" />

      {/* 3. Overlay Gelap untuk Kekuatan Kontras */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent" />

      {/* 4. Konten Utama Berbasis Grid 2 Kolom (Lebar max-w-7xl agar Megah) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* KOLOM KIRI: Area Teks & CTA (Mengambil 7 Kolom) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Label Kecil di Atas Headline */}
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-4 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            Yayasan Khoiro Ummah Bina Umat
          </span>

          {/* Judul Utama: Kombinasi Bold Sans & Handwriting Aksen */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[1.05] mb-6">
            FROM BATTLING <br />
            CRISIS TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] normal-case font-medium italic block my-2 font-serif tracking-normal">
              Spreading Hope
            </span>
          </h1>

          {/* Deskripsi Singkat */}
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-xl leading-relaxed tracking-wide font-normal">
            Salurkan bantuan terbaik Anda secara transparan, amanah, dan instan menggunakan QRIS. Setiap rupiah yang Anda donasikan adalah jembatan masa depan bagi sesama.
          </p>

          {/* Tombol Ajakan Bertindak (CTA) Meniru Gaya "JOIN THE FIGHT" */}
          <Link
            href="/program"
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold tracking-widest px-8 py-4 rounded text-xs uppercase shadow-lg shadow-emerald-950/50 border border-emerald-400/30 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/20"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            <span className="relative z-10 flex items-center gap-2">
              ★ Donasi Sekarang
            </span>
          </Link>
        </div>

        {/* KOLOM KANAN: Visual Subjek Manusia yang Menonjol (Mengambil 5 Kolom) */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end h-[350px] md:h-[500px] w-full z-20">
          {/* Ambient Glow Lingkaran di Belakang Gambar Utama */}
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-[100px] transform scale-75" />
          
          <img 
            src="/images/hero-character.png" // ⚠️ Gunakan gambar subjek/anak yang sudah di-remove background-nya (PNG transparan)
            alt="Subjek Donasi Lazisku" 
            className="h-full w-auto object-contain relative z-10 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:scale-105"
          />
        </div>

      </div>

      {/* 5. DEKORASI BATAS BAWAH (Wave/Organic Edge Masking) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-30 pointer-events-none">
        <svg 
          className="relative block w-full h-[40px] md:h-[70px]" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          {/* Jalur Kurva Warna Putih untuk Menyambung Mulus dengan Section di Bawahnya */}
          <path 
            d="M0,0 C300,90 900,10 1200,60 L1200,120 L0,120 Z" 
            className="fill-white"
          />
        </svg>
      </div>

    </section>
  );
}