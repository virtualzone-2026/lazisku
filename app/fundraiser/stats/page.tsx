'use client';

import React, { useState } from 'react';

export default function FundraiserStatsPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheckStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError('');
    setStats(null);

    try {
      const res = await fetch(`/api/fundraiser/stats?phone=${phone}`);
      const json = await res.json();
      
      if (json.success) {
        setStats(json);
      } else {
        setError(json.message || 'Gagal mengambil data statistik.');
      }
    } catch (err) {
      setError('Terjadi gangguan jaringan saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white border border-gray-200 p-6 shadow-sm rounded-none text-left space-y-5">
        
        <div className="text-center space-y-1 border-b border-gray-100 pb-4">
          <h1 className="text-sm font-black text-gray-800 uppercase tracking-widest">Performa Afiliasi</h1>
          <p className="text-[10px] font-medium text-gray-400">Cek total perolehan dana dari link fundraiser Anda</p>
        </div>

        {/* Form Pengecekan */}
        <form onSubmit={handleCheckStats} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nomor WhatsApp Anda</label>
            <input 
              type="tel"
              required
              placeholder="Contoh: 08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-none text-xs font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-2.5 text-xs uppercase tracking-widest rounded-none transition"
          >
            {loading ? 'Memuat Data...' : 'Lihat Total Pendapatan ➔'}
          </button>
        </form>

        {error && <p className="text-center text-xs font-bold text-red-600 bg-red-50 py-2 border border-dashed border-red-200">{error}</p>}

        {/* Hasil Tampilan Statistik Perolehan */}
        {stats && (
          <div className="space-y-4 pt-2 border-t border-gray-100 animate-fade-in">
            <div className="bg-gray-50/70 border border-gray-200/60 p-4 space-y-3 rounded-none">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Nama Relawan</span>
                <span className="text-xs font-black text-gray-700">{stats.profile.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Status Akun</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 uppercase rounded-none tracking-wide text-white ${stats.profile.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                  {stats.profile.status === 'approved' ? 'Aktif Verifikasi' : 'Pending Approval'}
                </span>
              </div>
              <div className="border-t border-gray-200/60 my-2 pt-2 flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Dana Dihimpun</span>
                <span className="text-lg font-black text-emerald-600">Rp {stats.totalEarnings.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                <span>Jumlah Donatur</span>
                <span>{stats.donationCount} Transaksi Sukses</span>
              </div>
            </div>

            {/* Riwayat Singkat */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Riwayat Dukungan Transaksi</h3>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {stats.history.length > 0 ? (
                  stats.history.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-white border border-gray-100 text-xs shadow-xs">
                      <span className="font-bold text-gray-700 line-clamp-1">{item.donorName}</span>
                      <span className="font-black text-emerald-600 font-mono">+Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-400 italic py-2">Belum ada donasi masuk dari link Anda.</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}