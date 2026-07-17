'use client';

import React, { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';

// ===================================================================
// IN-LINE WIDGET KALKULATOR ZAKAT (SUDUT SIKU / ROUNDED-NONE)
// ===================================================================
function EmbeddedZakatCalculator({ onApplyAmount }: { onApplyAmount: (val: string) => void }) {
  const [activeTab, setActiveTab] = useState<'penghasilan' | 'maal' | 'emas'>('penghasilan');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const HARGA_EMAS = 1400000;
  const NISHAB_TAHUNAN = 85 * HARGA_EMAS;
  const NISHAB_BULANAN = Math.round(NISHAB_TAHUNAN / 12);

  const formatRupiah = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    return raw ? Number(raw).toLocaleString('id-ID') : '';
  };
  const getNum = (val: string) => Number(val.replace(/\./g, '')) || 0;

  let totalZakat = 0;
  let isWajib = false;

  if (activeTab === 'penghasilan') {
    const total = getNum(input1) + getNum(input2);
    isWajib = total >= NISHAB_BULANAN;
    totalZakat = isWajib ? Math.round(total * 0.025) : 0;
  } else if (activeTab === 'maal') {
    const total = getNum(input1) + getNum(input2);
    isWajib = total >= NISHAB_TAHUNAN;
    totalZakat = isWajib ? Math.round(total * 0.025) : 0;
  } else if (activeTab === 'emas') {
    const berat = Number(input1) || 0;
    isWajib = berat >= 85;
    totalZakat = isWajib ? Math.round((berat * HARGA_EMAS) * 0.025) : 0;
  }

  return (
    <div className="border border-gray-200 rounded-none bg-white overflow-hidden mt-6">
      <div className="flex border-b border-gray-200 text-[10px] font-black bg-gray-50/50">
        <button onClick={() => { setActiveTab('penghasilan'); setInput1(''); setInput2(''); }} className={`flex-1 py-3 text-center rounded-none border-b-2 ${activeTab === 'penghasilan' ? 'text-emerald-600 border-emerald-600 bg-white' : 'text-gray-400 border-transparent'}`}>PENGHASILAN</button>
        <button onClick={() => { setActiveTab('maal'); setInput1(''); setInput2(''); }} className={`flex-1 py-3 text-center rounded-none border-b-2 ${activeTab === 'maal' ? 'text-emerald-600 border-emerald-600 bg-white' : 'text-gray-400 border-transparent'}`}>MAAL / TABUNGAN</button>
        <button onClick={() => { setActiveTab('emas'); setInput1(''); setInput2(''); }} className={`flex-1 py-3 text-center rounded-none border-b-2 ${activeTab === 'emas' ? 'text-emerald-600 border-emerald-600 bg-white' : 'text-gray-400 border-transparent'}`}>EMAS SIMPANAN</button>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="space-y-3 text-left">
          {activeTab !== 'emas' ? (
            <>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Pendapatan Utama / Tabungan (Rp)</label>
                <input type="text" className="w-full border border-gray-200 rounded-none px-3 py-2 text-xs font-bold" placeholder="0" value={input1} onChange={(e) => setInput1(formatRupiah(e.target.value))} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Bonus / Aset Lainnya (Rp)</label>
                <input type="text" className="w-full border border-gray-200 rounded-none px-3 py-2 text-xs font-bold" placeholder="0" value={input2} onChange={(e) => setInput2(formatRupiah(e.target.value))} />
              </div>
            </>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Total Berat Emas (Gram)</label>
              <input type="number" className="w-full border border-gray-200 rounded-none px-3 py-2 text-xs font-bold" placeholder="Contoh: 90" value={input1} onChange={(e) => setInput1(e.target.value)} />
            </div>
          )}
        </div>
        <div className="bg-gray-50 border border-gray-100 p-4 text-center rounded-none space-y-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Wajib Zakat Anda</span>
          <span className="text-xl font-black text-emerald-600 block">Rp {totalZakat.toLocaleString('id-ID')}</span>
          <button 
            disabled={totalZakat <= 0} 
            onClick={() => onApplyAmount(totalZakat.toLocaleString('id-ID'))}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 rounded-none uppercase tracking-wider disabled:bg-gray-300"
          >
            Masukkan ke Form 📥
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// MAIN DETAIL COMPONENT
// ===================================================================
interface FormProps {
  donorName: string;
  setDonorName: (v: string) => void;
  donorPhone: string;
  setDonorPhone: (v: string) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDonate: () => Promise<void>;
  submitting: boolean;
}

const DonationFormFields = ({
  donorName,
  setDonorName,
  donorPhone,
  setDonorPhone,
  paymentMethod,
  setPaymentMethod,
  amount,
  handleAmountChange,
  handleDonate,
  submitting,
}: FormProps) => (
  <div className="space-y-4 text-left">
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Donatur</label>
      <input type="text" placeholder="Hamba Allah (Boleh Kosong)" className="w-full border border-gray-200 rounded-none px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
    </div>
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nomor WhatsApp</label>
      <input type="tel" placeholder="Contoh: 081234567890" className="w-full border border-gray-200 rounded-none px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-medium" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
    </div>
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Metode Pembayaran</label>
      <select className="w-full border border-gray-200 rounded-none px-3.5 py-2.5 text-xs text-gray-700 focus:outline-emerald-500 font-bold bg-white cursor-pointer" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="qris">🟢 QRIS (E-Wallet & M-Banking Instant)</option>
        <option value="bri_va">🏦 BRI Virtual Account</option>
        <option value="bni_va">🏦 BNI Virtual Account</option>
        <option value="cimb_niaga_va">🏦 CIMB Niaga Virtual Account</option>
        <option value="permata_va">🏦 Permata Bank Virtual Account</option>
        <option value="maybank_va">🏦 Maybank Virtual Account</option>
        <option value="atm_bersama_va">🌐 ATM Bersama (Mandiri, BCA & Bank Lainnya)</option>
      </select>
    </div>
    <div>
      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nominal Dana (Rp)</label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-xs font-bold text-gray-400">Rp</span>
        <input type="text" placeholder="Minimal 10.000" className="w-full border border-gray-200 rounded-none pl-9 pr-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-emerald-500" value={amount} onChange={handleAmountChange} />
      </div>
    </div>
    <button onClick={handleDonate} disabled={submitting} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-none transition text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:bg-gray-300 shadow-md shadow-emerald-100">
      {submitting ? 'Memproses...' : 'Tunaikan Sekarang 🚀'}
    </button>
  </div>
);

export default function CampaignDetailClient({ slug }: { slug: string }) {
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState(''); 
  const [submitting, setSubmitting] = useState(false);
  
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [activeTab, setActiveTab] = useState<'cerita' | 'donatur' | 'laporan'>('cerita');

  useEffect(() => {
    fetch('/api/programs?v=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
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
    setAmount(rawValue ? Number(rawValue).toLocaleString('id-ID') : '');
  };

  const handleDonate = async () => {
    const cleanAmount = amount.replace(/\./g, '');
    if (!cleanAmount || Number(cleanAmount) < 10000) {
      alert('Masukkan nominal minimal Rp 10.000 gaes!');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-16 pb-24 lg:pb-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-5 flex flex-col">
          <div className="text-left">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-none uppercase tracking-wider">
              {program.category || 'Kebaikan'}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] mt-3 leading-tight tracking-tight">
              {program.title}
            </h1>
          </div>
          
          <div className="rounded-none overflow-hidden bg-gray-100 aspect-[16/9] w-full shadow-sm border border-gray-200/60">
            <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex border-b border-gray-200 text-xs font-bold text-gray-400 space-x-6 pt-2">
            <button onClick={() => setActiveTab('cerita')} className={`pb-3 focus:outline-none ${activeTab === 'cerita' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'border-b-2 border-transparent'}`}>
              DETAIL CERITA & KALKULATOR
            </button>
            <button onClick={() => setActiveTab('donatur')} className={`pb-3 focus:outline-none ${activeTab === 'donatur' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'border-b-2 border-transparent'}`}>
              DONATUR ({(program.donors || []).length})
            </button>
            <button onClick={() => setActiveTab('laporan')} className={`pb-3 focus:outline-none ${activeTab === 'laporan' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'border-b-2 border-transparent'}`}>
              LAPORAN PENYALURAN ({(program.reports || []).length})
            </button>
          </div>

          <div className="bg-transparent py-2 w-full text-left">
            {activeTab === 'cerita' && (
              <div className="space-y-6">
                {/* 🚀 JURUS SAKTI VISUAL: Kalkulator otomatis muncul tertanam jika ini program zakat */}
                {program.category?.toUpperCase() === 'ZAKAT' && (
                  <div className="bg-emerald-50/40 p-1 border border-dashed border-emerald-600/30">
                    <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest px-4 pt-3">🧮 Simulasi Kalkulator Zakat Digital</p>
                    <EmbeddedZakatCalculator onApplyAmount={(val) => setAmount(val)} />
                  </div>
                )}

                <div className="text-gray-700 text-base leading-relaxed space-y-4 font-normal tracking-wide dynamic-portable-text">
                  {program.description ? (typeof program.description === 'string' ? <p>{program.description}</p> : <PortableText value={program.description} />) : <p className="text-gray-400 italic text-xs">Belum ada cerita detail.</p>}
                </div>
              </div>
            )}

            {activeTab === 'donatur' && (
              <div className="space-y-3 py-2">
                {(program.donors || []).length > 0 ? [...program.donors].reverse().map((donor: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-none p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">{(donor.name || 'H').toUpperCase().slice(0, 1)}</div>
                      <div>
                        <p className="text-xs font-black text-gray-700">{donor.name || 'Hamba Allah'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{donor.date || 'Baru Saja'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600">{`+Rp ${Number(donor.amount || 0).toLocaleString('id-ID')}`}</p>
                    </div>
                  </div>
                )) : <p className="text-center py-10 text-xs text-gray-400">Belum ada donatur.</p>}
              </div>
            )}

            {activeTab === 'laporan' && (
              <div className="space-y-4 py-2">
                {(program.reports || []).length > 0 ? [...program.reports].reverse().map((report: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-none p-5 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{report.title || 'Laporan Penyaluran'}</h4>
                      <span className="text-[10px] text-gray-400 font-bold">{report.date}</span>
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                      {typeof report.content === 'string' ? <p>{report.content}</p> : <PortableText value={report.content} />}
                    </div>
                  </div>
                )) : <div className="border border-dashed border-gray-200 p-8 text-center rounded-none bg-white"><p className="text-xs text-gray-400 font-medium">Belum ada pembaruan laporan.</p></div>}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR FORM (DESKTOP) */}
        <div className="hidden lg:block bg-white rounded-none p-6 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Dana Terkumpul</p>
          <p className="text-3xl font-black text-emerald-600 mt-1 text-left">{`Rp ${Number(program.collectedRaw || 0).toLocaleString('id-ID')}`}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium text-left">Target Rp {rawTarget.toLocaleString('id-ID')}</p>
          <div className="w-full bg-gray-100 h-2 rounded-none mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <DonationFormFields 
              donorName={donorName} setDonorName={setDonorName}
              donorPhone={donorPhone} setDonorPhone={setDonorPhone}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              amount={amount} handleAmountChange={handleAmountChange}
              handleDonate={handleDonate} submitting={submitting}
            />
          </div>
        </div>

      </div>

      {/* MOBILE TRIGGER */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-none">
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Terkumpul</span>
          <span className="text-base font-black text-emerald-600">{`Rp ${Number(program.collectedRaw || 0).toLocaleString('id-ID')}`}</span>
        </div>
        <button onClick={() => setIsMobileFormOpen(true)} className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-none">Donasi Sekarang 🚀</button>
      </div>

      {/* MOBILE POPUP FORM */}
      {isMobileFormOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="absolute inset-0" onClick={() => setIsMobileFormOpen(false)} />
          <div className="relative w-full bg-white rounded-t-none p-6 space-y-4 max-h-[85vh] overflow-y-auto z-10">
            <div className="w-12 h-1 bg-gray-200 rounded-none mx-auto mb-2" onClick={() => setIsMobileFormOpen(false)} />
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-wide">Isi Data Infak</h3>
              <button onClick={() => setIsMobileFormOpen(false)} className="w-7 h-7 bg-gray-50 rounded-none text-gray-400 text-xs font-bold flex items-center justify-center border border-gray-100">✕</button>
            </div>
            <DonationFormFields 
              donorName={donorName} setDonorName={setDonorName}
              donorPhone={donorPhone} setDonorPhone={setDonorPhone}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              amount={amount} handleAmountChange={handleAmountChange}
              handleDonate={handleDonate} submitting={submitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}