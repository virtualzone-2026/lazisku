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
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch accumulation statistics error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="text-center text-xs text-gray-400 font-bold tracking-widest uppercase animate-pulse">
          MENGAKUMULASIKAN DATA KAMPANYE AMANAH...
        </div>
      </div>
    );
  }

  return (
    // 🚀 FIXED: Lebar disamakan dengan kontainer web utama (max-w-7xl) & padding dioptimalkan
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
      
      {/* 🚀 MODERN STYLE: Flat grid dengan sudut siku tajam (rounded-none) & border tipis elegan */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-100 bg-white rounded-none divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* KOTAK 1: TOTAL DANA DISALURKAN */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-2 transition-colors hover:bg-gray-50/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>💰</span> TOTAL DANA DISALURKAN
          </span>
          {stats.totalCollected > 0 ? (
            <span className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tight">
              Rp {stats.totalCollected.toLocaleString('id-ID')}
            </span>
          ) : (
            <span className="text-sm md:text-base font-black text-emerald-600 uppercase tracking-wider block py-1">
              🌱 SIAP DISALURKAN
            </span>
          )}
          <span className="text-[10px] text-gray-400 font-bold tracking-wide">
            Real-time via QRIS & VA Pakasir
          </span>
        </div>

        {/* KOTAK 2: JUMLAH DONATUR */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-2 transition-colors hover:bg-gray-50/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>🤝</span> JUMLAH DONATUR
          </span>
          {stats.totalDonors > 0 ? (
            <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
              {stats.totalDonors.toLocaleString('id-ID')}{' '}
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Jiwa</span>
            </span>
          ) : (
            <span className="text-sm md:text-base font-black text-emerald-600 uppercase tracking-wider block py-1">
              🤝 MARI MULAI KEBAIKAN
            </span>
          )}
          <span className="text-[10px] text-gray-400 font-bold tracking-wide">
            {stats.totalDonors > 0 ? 'Terverifikasi Sistem Amanah' : 'Jadilah Donatur Pertama'}
          </span>
        </div>

        {/* KOTAK 3: PROGRAM KEBAIKAN AKTIF */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-2 transition-colors hover:bg-gray-50/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>📦</span> PROGRAM KEBAIKAN AKTif
          </span>
          <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
            {stats.totalPrograms}{' '}
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Campaign</span>
          </span>
          <span className="text-[10px] text-gray-400 font-bold tracking-wide">
            Kemanusiaan, Pendidikan & Ziswaf
          </span>
        </div>

      </div>
    </div>
  );
}