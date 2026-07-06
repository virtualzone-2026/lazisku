// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

// 🚀 MEMBACA KREDENSIAL LANGSUNG DARI FILE .ENV.LOCAL ANDA SECARA VALID
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '19a8r8sr', // ID Sanity disesuaikan dengan skema LAZISKU
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
    
    // 🚀 DUKUNGAN MULTI-PAYMENT: Mengambil pilihan dari frontend. Fallback otomatis ke 'qris'
    const paymentMethod = body.paymentMethod || 'qris';
    const cleanMethod = String(paymentMethod).toLowerCase().trim();
    
    const rawAmount = body.amount || body.nominal || 0;
    const cleanAmountNumber = Number(String(rawAmount).replace(/\D/g, ''));

    // Validasi dasar transaksi minimal sesuai pedoman Pakasir
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

    // 🚀 KREDENSIAL PROYEK PAKASIR.COM
    const pakasirProjectSlug = process.env.PAKASIR_PROJECT || process.env.PAKASIR_SLUG || '';
    const pakasirApiKey = process.env.PAKASIR_API_KEY || '';

    if (!pakasirProjectSlug || !pakasirApiKey) {
      console.error('⚠️ Kredensial Pakasir (PAKASIR_PROJECT / PAKASIR_API_KEY) belum dikonfigurasi di .env!');
    }

    // 🚀 FIXED LENGKAP (BAGIAN C.2 & C.3): Endpoint dinamis sesuai pilihan (qris, bri_va, bni_va, dll.)
    const targetPakasirUrl = `https://app.pakasir.com/api/transactioncreate/${cleanMethod}`;

    const pakasirResponse = await fetch(targetPakasirUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: pakasirProjectSlug,
        order_id: generatedOrderId,
        amount: cleanAmountNumber,
        api_key: pakasirApiKey,
      }),
    });

    const pakasirData = await pakasirResponse.json();

    // Memeriksa kegagalan respon atau ketiadaan data objek payment dari Pakasir
    if (!pakasirResponse.ok || !pakasirData.payment) {
      throw new Error(pakasirData.message || `Gagal membuat transaksi ${cleanMethod} ke gateway API Pakasir.`);
    }

    // 🚀 FIXED DATA EXTRACTION (BAGIAN C.2 RESPONS):
    // Properti ini berisi raw QR string jika memilih qris, atau nomor VA jika memilih bank transfer
    const paymentNumber = pakasirData.payment.payment_number || '';
    
    // Penyusunan Link web-checkout alternatif (Bagian B)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazisku.com';
    const isQrisOnly = cleanMethod === 'qris' ? '&qris_only=1' : '';
    
    const fallbackUrlWeb = `https://app.pakasir.com/pay/${pakasirProjectSlug}/${cleanAmountNumber}?order_id=${generatedOrderId}${isQrisOnly}&redirect=${encodeURIComponent(`${siteUrl}/thank-you?order_id=${generatedOrderId}`)}`;
    
    // Gunakan payment_url bawaan dari objek gateway jika tersedia, atau arahkan ke fallback link web checkout
    const paymentUrl = pakasirData.payment.payment_url || fallbackUrlWeb;

    // 🚀 MENULIS DATA TRANSAKSI LENGKAP KE SANITY
    await client.create({
      _type: 'donationTransaction',
      orderId: String(generatedOrderId),
      donorName: String(donorName),
      donorPhone: String(donorPhone),
      amount: Number(cleanAmountNumber),         
      totalAmount: Number(pakasirData.payment.total_payment || cleanAmountNumber), // Menyimpan akumulasi total pasca biaya admin gateway
      status: 'pending',
      slug: String(slug),
      paymentMethod: String(cleanMethod), // Menyimpan jejak pilihan metode pembayaran asli di CMS
      paymentUrl: String(paymentUrl), 
      paymentNumber: String(paymentNumber), // Menyimpan raw string QR atau Nomor VA untuk cadangan render/log
    });

    console.log(`🔒 TRANSAKSI MULTI-METHOD BERHASIL DICATAT: ${generatedOrderId} | Metode: ${cleanMethod} | Total: Rp ${cleanAmountNumber}`);

    // Mengembalikan response sukses ke komponen frontend
    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      amount: cleanAmountNumber,
      paymentMethod: cleanMethod,
      paymentUrl: paymentUrl,       // Link pengalihan halaman resmi Pakasir
      paymentNumber: paymentNumber, // Nomor VA atau string QR data mentah
    });

  } catch (error: any) {
    console.error('🔥 BACKEND CHECKOUT ERROR VIA API PAKASIR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}