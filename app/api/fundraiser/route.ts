// app/api/fundraiser/route.ts
import { NextResponse } from 'next/server';
// Menggunakan clientInternal untuk mutasi data tulis ke Sanity
import { clientInternal as client } from '@/lib/sanity';

export async function POST(request: Request) {
  try {
    // 1. Ambil body JSON dengan aman
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Format body kiriman JSON tidak valid.' }, 
        { status: 400 }
      );
    }

    const { name, phone, programId } = body;

    // 2. Validasi kelengkapan data formulir beserta pesan detailnya
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Nama Lengkap wajib diisi.' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, message: 'Nomor WhatsApp wajib diisi.' }, { status: 400 });
    }
    if (!programId) {
      return NextResponse.json({ success: false, message: 'ID Program tidak terdeteksi di sistem.' }, { status: 400 });
    }

    // 3. Normalisasi nomor WhatsApp ke format standar internasional
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    // 4. Operasi pembuatan dokumen baru di Sanity Studio
    const newFundraiser = await client.create({
      _type: 'fundraiser',
      name: name.trim(),
      phone: formattedPhone,
      program: {
        _type: 'reference',
        _ref: programId, // Mengaitkan relasi dokumen ke program target
      },
      status: 'pending', // Status awal saat mendaftar
    });

    // 5. Integrasi Pengiriman Pesan WhatsApp via Fonnte (Opsional)
    if (process.env.FONNTE_TOKEN) {
      const messageText = 
        `*Pendaftaran Fundraiser Lazisku* 📢\n\n` +
        `Halo *${name.trim()}*,\n` +
        `Terima kasih telah mengajukan diri sebagai fundraiser.\n\n` +
        `Data pendaftaran Anda telah kami terima dan saat ini sedang ditinjau oleh tim admin LAZIS Khoiro Ummah. Kami akan mengirimkan notifikasi lanjutan jika tautan performa afiliasi Anda telah diaktifkan.\n\n` +
        `Jazakumullah Khairan Katsiran.`;

      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': process.env.FONNTE_TOKEN },
        body: new URLSearchParams({ target: formattedPhone, message: messageText }),
      }).catch(err => console.error('🔥 Fonnte Kirim Error:', err));
    }

    return NextResponse.json({ success: true, data: newFundraiser }, { status: 200 });

  } catch (error: any) {
    console.error('🔥 Gagal mendaftarkan fundraiser di backend:', error);
    
    // 🚀 FIXED: Menjamin respons balik selalu menyertakan teks string string pada properti message
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message || 'Terjadi gangguan internal pada server database Sanity.' 
      }, 
      { status: 500 }
    );
  }
}