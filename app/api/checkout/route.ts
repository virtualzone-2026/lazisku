import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { slug, amount } = await request.json();

    // 1. Validasi nominal minimal donasi Rp 10.000 sesuai aturan dasar merchant
    if (!amount || Number(amount) < 10000) {
      return NextResponse.json(
        { success: false, message: 'Minimal donasi Rp 10.000' }, 
        { status: 400 }
      );
    }

    // 🚀 FIXED SLUG: Mengunci langsung ke ID proyek Yayasan Anda di Pakasir
    const PAKASIR_PROJECT_SLUG = 'yayasan-generasi-indonesia-mengaji'; 

    // 2. Membuat ID Transaksi/Invoice unik berbasis timestamp agar tidak bentrok di dashboard
    const orderId = `INV-${slug.toUpperCase().slice(0, 15)}-${Date.now()}`;

    // 3. Menentukan URL pengalihan setelah donatur sukses melakukan scan QRIS
    // 🚀 FIXED FALLBACK: Mengubah fallback default dari localhost:3000 ke domain asli production indonesiamengaji.net
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indonesiamengaji.net';
    const redirectUrl = `${siteUrl}/thank-you`;

    // 4. Menyusun URL Endpoint Generator Pembayaran otomatis sesuai dokumentasi Seksi B
    // qris_only=1 memaksa tampilan langsung memunculkan QR Code tanpa opsi pembayaran lain
    const paymentUrl = `https://app.pakasir.com/pay/${PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&qris_only=1&redirect=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.json({ success: true, paymentUrl });

  } catch (error: any) {
    console.error('Pakasir URL Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}