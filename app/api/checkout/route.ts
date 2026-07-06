// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

// 🚀 MEMBACA KREDENSIAL LANGSUNG DARI FILE .ENV.LOCAL ANDA SECARA VALID
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jmgc1ejr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN, // ➔ Menggunakan Token Editor dari env Anda
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const slug = body.slug || '';
    const donorName = body.donorName || body.name || 'Hamba Allah';
    const donorPhone = body.donorPhone || body.phone || body.whatsapp || ''; 
    
    const rawAmount = body.amount || body.nominal || 0;
    const cleanAmountNumber = Number(String(rawAmount).replace(/\D/g, ''));

    // Validasi dasar minimal transaksi QRIS Pakasir
    if (!slug || !cleanAmountNumber || cleanAmountNumber < 10000) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid. Minimal donasi adalah Rp 10.000' },
        { status: 400 }
      );
    }

    // Kustomisasi invoice prefix berdasarkan slug program donasi
    const cleanSlug = String(slug).toUpperCase();
    const prefix = cleanSlug.includes('BERAS') ? 'BERAS' : cleanSlug.includes('MUALAF') ? 'MUALAF' : 'SUBUH';
    const generatedOrderId = `INV-${prefix}-${Date.now()}`;

    // 🚀 INTEGRASI API PAKASIR.COM
    // Menggunakan variabel lingkungan yang wajib didefinisikan di .env.local Anda
    const pakasirProjectSlug = process.env.PAKASIR_PROJECT || process.env.PAKASIR_SLUG || '';
    const pakasirApiKey = process.env.PAKASIR_API_KEY || '';

    if (!pakasirProjectSlug || !pakasirApiKey) {
      console.error('⚠️ Kredensial Pakasir (PAKASIR_PROJECT / PAKASIR_API_KEY) belum dikonfigurasi di .env!');
    }

    // Mengirim permintaan pembuatan transaksi QRIS ke REST API resmi Pakasir
    const pakasirResponse = await fetch('https://app.pakasir.com/api/transaction/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: pakasirProjectSlug,
        api_key: pakasirApiKey,
        order_id: generatedOrderId,
        payment_method: 'QRIS', // Memaksa metode pembayaran langsung menggunakan QRIS
        amount: cleanAmountNumber,
      }),
    });

    const pakasirData = await pakasirResponse.json();

    // Memeriksa respon sukses dari Pakasir (Disesuaikan dengan payload respon API Pakasir)
    if (!pakasirResponse.ok || (pakasirData.success === false)) {
      throw new Error(pakasirData.message || 'Gagal membuat transaksi ke gateway Pakasir.');
    }

    // Mengambil payment link atau nomor pembayaran dari objek response Pakasir
    const paymentUrl = pakasirData.payment?.payment_url || pakasirData.data?.payment_url || '';
    const paymentNumber = pakasirData.payment?.payment_number || pakasirData.data?.payment_number || '';

    // 🚀 MENULIS DATA TRANSAKSI LENGKAP KE SANITY
    await client.create({
      _type: 'donationTransaction',
      orderId: String(generatedOrderId),
      donorName: String(donorName),
      donorPhone: String(donorPhone),
      amount: Number(cleanAmountNumber),         
      totalAmount: Number(cleanAmountNumber), // Tidak perlu kode unik lagi karena ID sudah di-handle server gateway   
      status: 'pending',
      slug: String(slug),
      paymentUrl: String(paymentUrl), // Menyimpan tautan bayar ke Sanity untuk arsip log
    });

    console.log(`🔒 TRANSAKSI BERHASIL DICATAT & DIKUNCI: ${generatedOrderId} | Total: Rp ${cleanAmountNumber}`);

    // Mengembalikan response sukses ke frontend lengkap dengan data pembayaran dari Pakasir
    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      amount: cleanAmountNumber,
      paymentUrl: paymentUrl,       // Link halaman pembayaran QRIS Pakasir
      paymentNumber: paymentNumber, // Alternatif jika berupa teks kode string QRIS/VA
    });

  } catch (error: any) {
    console.error('🔥 BACKEND CHECKOUT ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}