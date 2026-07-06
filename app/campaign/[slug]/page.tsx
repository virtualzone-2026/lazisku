'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PortableText } from '@portabletext/react';

export default function CampaignDetailPage() {
  const { slug } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState(''); 
  const [submitting, setSubmitting] = useState(false);
  
  // 🚀 STATE MOBILE RESPONSE
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [activeTab, setActiveTab] = useState<'cerita' | 'donatur'>('cerita');

  useEffect(() => {
    fetch('/api/programs?v=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const found = json.data.find((p: any) => p.slug === slug);
          setProgram(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch detail campaign error:', err);
        setLoading(false);
      });
  }, [slug]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setAmount('');
      return;
    }
    const formatted = Number(rawValue).toLocaleString('id-ID');
    setAmount(formatted);
  };

  const handleDonate = async () => {
    const cleanAmount = amount.replace(/\./g, '');

    if (!cleanAmount || Number(cleanAmount) < 10000) {
      alert('Masukkan nominal donasi minimal Rp 10.000 gaes!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: program.slug,
          amount: cleanAmount,
          donorName: donorName.trim() || 'Hamba Allah',
          donorPhone: donorPhone.trim(), 
          paymentMethod: paymentMethod,
        }),
      });

      const json = await res.json();
      
      if (json.success && json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        alert(json.error || 'Gagal memproses tautan pembayaran dari Pakasir.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menghubungi server pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium">Memuat detail program...</div>;
  if (!program) return <div className="text-center py-20 text-red-500 font-medium">Program tidak ditemukan.</div>;

  const rawTarget = program.targetAmount || 50000000;
  const percentage = Math.min(Math.round((program.collectedRaw / rawTarget) * 100), 100);
  const donorList = program.donors || [];

  // 📦 SUB-COMPONENT FORMULIR (Agar tidak duplikasi kode antara desktop & mobile popup)
  const DonationFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Donatur</label>
        <input
          type="text"
          placeholder="Hamba Allah (Boleh Kosong)"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nomor WhatsApp</label>
        <input
          type="tel"
          placeholder="Contoh: 081234567890"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium"
          value={donorPhone}
          onChange={(e) => setDonorPhone(e.target.value)}
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Metode Pembayaran</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-bold bg-white cursor-pointer"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="qris">🟢 QRIS (E-Wallet & M-Banking Instant)</option>
          <option value="bri_va">🏦 BRI Virtual Account</option>
          <option value="bni_va">🏦 BNI Virtual Account</option>
          <option value="cimb_niaga_va">🏦 CIMB Niaga Virtual Account</option>
          <option value="permata_va">🏦 Permata Bank Virtual Account</option>
          <option value="maybank_va">🏦 Maybank Virtual Account</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nominal Infak (Rp)</label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-xs font-bold text-gray-400">Rp</span>
          <input
            type="text"
            placeholder="Minimal 10.000"
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-emerald-500"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
      </div>

      <button
        onClick={handleDonate}
        disabled={submitting}
        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:bg-gray-300 shadow-md shadow-emerald-100"
      >
        {submitting ? 'Memproses...' : 'Donasi Sekarang 🚀'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-16 pb-24 lg:pb-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: DETAIL CERITA & DAFTAR DONATUR */}
        <div className="lg:col-span-2 space-y-5 flex flex-col">
          <div>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              {program.category || 'Kebaikan'}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] mt-3 leading-tight tracking-tight">
              {program.title}
            </h1>
          </div>
          
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] w-full shadow-sm border border-gray-200/60">
            <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex border-b border-gray-200 text-xs font-bold text-gray-400 space-x-6 pt-2">
            <button 
              onClick={() => setActiveTab('cerita')}
              className={`pb-3 transition-all duration-200 focus:outline-none ${
                activeTab === 'cerita' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'hover:text-gray-600 border-b-2 border-transparent'
              }`}
            >
              DETAIL CERITA
            </button>
            <button 
              onClick={() => setActiveTab('donatur')}
              className={`pb-3 transition-all duration-200 focus:outline-none ${
                activeTab === 'donatur' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'hover:text-gray-600 border-b-2 border-transparent'
              }`}
            >
              DONATUR ({donorList.length})
            </button>
          </div>

          <div className="bg-transparent py-2 w-full">
            {activeTab === 'cerita' ? (
              <div className="text-gray-700 text-base leading-relaxed space-y-4 font-normal tracking-wide dynamic-portable-text">
                {program.description ? (
                  typeof program.description === 'string' ? <p>{program.description}</p> : <PortableText value={program.description} />
                ) : (
                  <p className="text-gray-400 italic text-xs">Belum ada cerita detail untuk program ini.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {donorList.length > 0 ? (
                  [...donorList].reverse().map((donor: any, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                          {(donor.name || 'H').toUpperCase().slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-700">{donor.name || 'Hamba Allah'}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{donor.date || 'Baru Saja'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-emerald-600">+{`Rp ${Number(donor.amount || 0).toLocaleString('id-ID')}`}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-xs text-gray-400">Belum ada donatur.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: FORMULIR DONASI DESKTOP (Sembunyi di Mobile via hidden lg:block) */}
        <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dana Terkumpul</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{program.collected || `Rp ${Number(program.collectedRaw).toLocaleString('id-ID')}`}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Target Rp {rawTarget.toLocaleString('id-ID')}</p>

          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <DonationFormFields />
          </div>
        </div>

      </div>

      {/* ===================================================================
          🚀 INTERFASE MOBILE LAYOUT POP-UP & TOMBOL MELAYANG STICKY BOTTOM
          =================================================================== */}
      
      {/* 1. Bar Sticky Tetap Nempel di Layar Mobile Paling Bawah */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Terkumpul</span>
          <span className="text-base font-black text-emerald-600">{program.collected || `Rp ${Number(program.collectedRaw).toLocaleString('id-ID')}`}</span>
        </div>
        <button
          onClick={() => setIsMobileFormOpen(true)}
          className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-md shadow-emerald-100 active:scale-95 transition-all duration-150"
        >
          Donasi Sekarang 🚀
        </button>
      </div>

      {/* 2. Modal Pop-up Form Inputan (Akan Sliding Up ketika Tombol diklik) */}
      {isMobileFormOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
          {/* Sisi Background Klik untuk Close */}
          <div className="absolute inset-0" onClick={() => setIsMobileFormOpen(false)} />
          
          {/* Kotak Form Konten */}
          <div className="relative w-full bg-white rounded-t-[2.5rem] p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl z-10 transition-transform duration-300 transform translate-y-0">
            {/* Handle Bar Penarik */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2" onClick={() => setIsMobileFormOpen(false)} />
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#333333] uppercase tracking-wide">Isi Data Infak</h3>
              <button 
                onClick={() => setIsMobileFormOpen(false)}
                className="w-7 h-7 bg-gray-50 rounded-full text-gray-400 text-xs font-bold flex items-center justify-center border border-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Render isi form inputan */}
            <DonationFormFields />
          </div>
        </div>
      )}

    </div>
  );
}