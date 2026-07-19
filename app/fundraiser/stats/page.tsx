'use client';

import React, { useState } from 'react';

export default function FundraiserStatsPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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

              {/* Rincian Alokasi Perolehan */}
              <div className="border-t border-dashed border-gray-200 pt-2 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Total Ujrah Hak Anda (10%)</span>
                  <span className="text-xs font-bold text-gray-600">Rp {Math.round(stats.totalEarnings * 0.1).toLocaleString('id-ID')}</span>
                </div>
                
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Fee Sudah Dibayarkan Yayasan</span>
                  <span className="text-xs font-bold text-amber-700">-Rp {(stats.profile.feePaid || 0).toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between items-baseline border-b border-gray-200/60 pb-2 mb-2">
                  <span className="text-[10px] font-black text-purple-600 uppercase">Sisa Saldo Fee Tersedia</span>
                  <span className="text-sm font-black text-purple-700">
                    Rp {Math.max(0, Math.round(stats.totalEarnings * 0.1) - (stats.profile.feePaid || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                <span>Jumlah Donatur</span>
                <span>{stats.donationCount} Transaksi Sukses</span>
              </div>
            </div>

            {/* ===================================================================
                🚀 AKSI DAFTAR TAUTAN MULTI-PROGRAM: Mapping Semua Link Aktif
               =================================================================== */}
            <div className="mt-4 pt-2 text-left space-y-3">
              <label className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">🔗 Daftar Tautan Afiliasi Program Anda</label>
              
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {stats.programs && stats.programs.length > 0 ? (
                  stats.programs.map((prog: any, index: number) => {
                    const cleanPhone = phone.replace(/[^0-9]/g, '');
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    const affiliateUrl = `${baseUrl}/campaign/${prog.slug}?ref=${cleanPhone}`;
                    
                    return (
                      <div key={index} className="border border-gray-200 bg-gray-50/50 p-2.5 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold text-gray-700 line-clamp-2 leading-tight flex-1">
                            {prog.title}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(affiliateUrl, index)}
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 transition-all text-white ${copiedIndex === index ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                          >
                            {copiedIndex === index ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                        <div className="bg-white border border-gray-200 px-2 py-1.5 text-[9px] font-mono text-gray-500 truncate select-all">
                          {affiliateUrl}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Fallback jika API backend belum mengembalikan array program dinamis
                  <div className="border border-gray-200 bg-gray-50/50 p-2.5 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-gray-700 line-clamp-2 leading-tight flex-1">
                        Program Utama Aktif
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                          handleCopy(`${baseUrl}/campaign/${stats.profile.programSlug}?ref=${phone.replace(/[^0-9]/g, '')}`, 999);
                        }}
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 transition-all text-white ${copiedIndex === 999 ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        {copiedIndex === 999 ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 px-2 py-1.5 text-[9px] font-mono text-gray-500 truncate">
                      {`${typeof window !== 'undefined' ? window.location.origin : ''}/campaign/${stats.profile.programSlug}?ref=${phone.replace(/[^0-9]/g, '')}`}
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                *Klik salin pada program donasi pilihan Anda, kemudian sebarkan ke jaringan sosial media. Setiap donasi sukses otomatis terikat pada akun Anda.
              </p>
            </div>

            {/* Riwayat Dukungan Transaksi */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Riwayat Dukungan Transaksi</h3>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {stats.history && stats.history.length > 0 ? (
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