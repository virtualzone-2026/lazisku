'use client';

import React, { useState, useEffect } from 'react';

export default function TotalAccumulationWidget() {
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalDonors: 0,
    totalPrograms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/programs?v=' + Date.now(), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          // 🚀 KALKULASI KUMULATIF AKUMULASI DANA & DONATUR REAL-TIME
          const calculated = json.data.reduce(
            (acc: any, program: any) => {
              const collected = Number(program.collectedRaw || 0);
              const donorCount = Array.isArray(program.donors) ? program.donors.length : 0;
              
              return {
                totalCollected: acc.totalCollected + collected,
                totalDonors: acc.totalDonors + donorCount,
              };
            },
            { totalCollected: 0, totalDonors: 0 }
          );

          setStats({
            totalCollected: calculated.totalCollected,
            totalDonors: calculated.totalDonors,
            totalPrograms: json.data.length,
          });
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch accumulation statistics error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-none p-6 text-center text-xs text-gray-400 font-medium tracking-wider">
          MEMUAT DATA AKUMULASI DANA AMANAH...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      {/* 🚀 FIXED STYLE: Struktur grid berdesain flat dengan sudut siku tajam (rounded-none) */}
      <div className="bg-white border border-gray-200 rounded-none shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* KOTAK 1: TOTAL DANA TERKUMPUL */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <span>💰</span> Total Dana Disalurkan
          </span>
          <span className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight">
            Rp {stats.totalCollected.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">
            Real-time via QRIS & VA Pakasir
          </span>
        </div>

        {/* KOTAK 2: TOTAL DONATUR / HAMBA ALLAH */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <span>🤝</span> Hamba Allah & Donatur
          </span>
          <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
            {stats.totalDonors.toLocaleString('id-ID')} <span className="text-xs font-bold text-gray-400">Jiwa</span>
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">
            Terverifikasi Sistem Amanah
          </span>
        </div>

        {/* KOTAK 3: TOTAL PROGRAM AGREGAT */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <span>📦</span> Program Kebaikan Aktif
          </span>
          <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
            {stats.totalPrograms} <span className="text-xs font-bold text-gray-400">Campaign</span>
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">
            Kemanusiaan, Pendidikan & Ziswaf
          </span>
        </div>

      </div>
    </div>
  );
}