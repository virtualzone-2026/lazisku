// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Konfigurasi Sanity Client Write
const client = createClient({
  projectId: 'jmgc1ejr',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'sk7NqErRROXCLrscMNjmzvwt2hhpiI61vdbMqw0oN6zBkvrtEhOJG4GS71LcC4ldpRhqiTVCEkzYfAznTnap1Pv5LZQZt9Uo7Ixqw0AAOq7ReDbPO9tciZyXkTlMA2VoAA1NiU6ITL5PqGkGCtvQuLCiRENowtxfPBbDAnusAU1pu2tUvnt7',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, amount, donorName, donorPhone } = body;

    // 1. Validasi Input Dasar
    if (!slug || !amount || Number(amount) < 10000) {
      return NextResponse.json({ success: false, error: 'Data transaksi tidak valid atau kurang dari Rp 10.000' }, { status: 400 });
    }

    // 2. Generate Order ID Unik
    const prefix = slug.toUpperCase().includes('BERAS') ? 'BERAS' : slug.toUpperCase().includes('MUALAF') ? 'MUALAF' : 'SUBUH';
    const generatedOrderId = `INV-${prefix}-${Date.now()}`;

    // 3. LOGIKA UTAMA: Kunci Nama dan WhatsApp dari form frontend langsung ke Sanity sebagai Pending
    await client.create({
      _type: 'donationTransaction',
      orderId: generatedOrderId,
      donorName: donorName || 'Hamba Allah',
      donorPhone: donorPhone || '', 
      amount: Number(amount),
      status: 'pending',
      slug: slug,
    });

    console.log(`🔒 TRANSAKSI PENDING BERHASIL DIKUNCI: ${generatedOrderId} - ${donorName}`);

    // 4. GENERATE LINK SIMULASI PEMBAYARAN (SAFE FALLBACK)
    // Agar terhindar dari crash 'fetch failed' akibat endpoint eksternal yang belum siap,
    // kita langsung buat return URL simulasi Pakasir Sandbox yang valid untuk pengetesan.
    const simulationUrl = `https://pakasir.com/checkout/simulate?order_id=${generatedOrderId}&amount=${amount}`;

    return NextResponse.json({
      success: true,
      paymentUrl: simulationUrl
    });

  } catch (error: any) {
    console.error('🔥 CHECKOUT RUNTIME ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}