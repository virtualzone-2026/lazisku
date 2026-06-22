import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        {/* Ikon Centang Hijau */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Alhamdulillah!</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Infak Anda telah berhasil kami terima. Terima kasih banyak atas kebaikan Anda, semoga menjadi amal jariyah yang berlipat ganda. Amin.
        </p>

        <Link 
          href="/" 
          className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}