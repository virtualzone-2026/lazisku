// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

// 🚀 MEMBACA KREDENSIAL LANGSUNG DARI FILE .ENV.LOCAL ANDA SECARA VALID
const client = createClient({
  // FIXED: Fallback disesuaikan dengan ID asli di file .env.local kamu ("61d8vnuq")
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '61d8vnuq', 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN, // Menggunakan Token Editor dari env Anda
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

    // 🚀 FIXED: Validasi dasar transaksi diturunkan menjadi Rp 1.000 agar sinkron dengan Pakasir QRIS
    if (!slug || !cleanAmountNumber || cleanAmountNumber < 1000) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid. Minimal donasi adalah Rp 1.000' },
        { status: 400 }
      );
    }

    // Kustomisasi invoice prefix berdasarkan slug program donasi
    const cleanSlug = String(slug).toUpperCase();
    const prefix = cleanSlug.includes('BERAS') ? 'BERAS' : cleanSlug.includes('MUALAF') ? 'MUALAF' : 'SUBUH';
    const generatedOrderId = `INV-${prefix}-${Date.now()}`;

    // Menggunakan slug 'lazis-khoiro-ummah' sesuai berkas image_eba182.png
    const pakasirProjectSlug = process.env.PAKASIR_PROJECT || process.env.PAKASIR_SLUG || 'lazis-khoiro-ummah';
    const pakasirApiKey = process.env.PAKASIR_API_KEY || '';

    // Validasi internal sebelum fetch dilakukan agar parameter tidak kosong ke API Pakasir
    if (!pakasirProjectSlug || !pakasirProjectSlug.trim()) {
      return NextResponse.json(
        { success: false, error: 'Internal Server Error: Identitas nama project gateway kosong.' },
        { status: 500 }
      );
    }

    if (!pakasirApiKey || !pakasirApiKey.trim()) {
      console.error('⚠️ Kredensial PAKASIR_API_KEY belum dikonfigurasi di file environment variables server!');
    }

    // Endpoint dinamis sesuai pilihan (qris, bri_va, bni_va, dll.)
    const targetPakasirUrl = `https://app.pakasir.com/api/transactioncreate/${cleanMethod}`;

    const pakasirResponse = await fetch(targetPakasirUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: pakasirProjectSlug.trim(),
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

    // Properti ini berisi raw QR string jika memilih qris, atau nomor VA jika memilih bank transfer
    const paymentNumber = pakasirData.payment.payment_number || '';
    
    // Penyusunan Link web-checkout alternatif
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazisku.com';
    const isQrisOnly = cleanMethod === 'qris' ? '&qris_only=1' : '';
    
    const fallbackUrlWeb = `https://app.pakasir.com/pay/${pakasirProjectSlug}/${cleanAmountNumber}?order_id=${generatedOrderId}${isQrisOnly}&redirect=${encodeURIComponent(`${siteUrl}/thank-you?order_id=${generatedOrderId}`)}`;
    
    // Gunakan payment_url bawaan dari objek gateway jika tersedia, atau arahkan ke fallback link web checkout
    const paymentUrl = pakasirData.payment.payment_url || fallbackUrlWeb;

    // 🚀 MENULIS DATA TRANSAKSI LENGKAP KE SANITY (Menggunakan Client Internal Ber-token Write)
    await client.create({
      _type: 'donationTransaction',
      orderId: String(generatedOrderId),
      donorName: String(donorName),
      donorPhone: String(donorPhone),
      amount: Number(cleanAmountNumber),         
      totalAmount: Number(pakasirData.payment.total_payment || cleanAmountNumber), 
      status: 'pending',
      slug: String(slug),
      paymentMethod: String(cleanMethod), 
      paymentUrl: String(paymentUrl), 
      paymentNumber: String(paymentNumber), 
    });

    console.log(`🔒 TRANSAKSI MULTI-METHOD BERHASIL DICATAT: ${generatedOrderId} | Metode: ${cleanMethod} | Total: Rp ${cleanAmountNumber}`);

    // Mengembalikan response sukses ke komponen frontend
    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      amount: cleanAmountNumber,
      paymentMethod: cleanMethod,
      paymentUrl: paymentUrl,       
      paymentNumber: paymentNumber, 
    });

  } catch (error: any) {
    console.error('🔥 BACKEND CHECKOUT ERROR VIA API PAKASIR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}