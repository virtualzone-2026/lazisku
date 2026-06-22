// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

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

    // 3. Kunci data Nama & WhatsApp dari form frontend langsung ke Sanity (Status: Pending)
    await client.create({
      _type: 'donationTransaction',
      orderId: generatedOrderId,
      donorName: donorName || 'Hamba Allah',
      donorPhone: donorPhone || '', 
      amount: Number(amount),
      status: 'pending',
      slug: slug,
    });

    console.log(`🔒 TRANSAKSI PENDING DIKUNCI: ${generatedOrderId} - ${donorName}`);

    // 4. STRATEGI UTAMA: Bikin URL Pembayaran Sesuai Panduan Resmi Pakasir (Bagian B)
    // Format: https://app.pakasir.com/pay/{slugProyekPakasir}/{amount}?order_id={order_id}&qris_only=1
    const proyekSlugPakasir = "yayasan-generasi-indonesia-mengaji"; 
    const cleanAmount = Math.floor(Number(amount)); // Pastikan berupa angka bulat tanpa titik/spasi

    // Kita tambahkan opsi &qris_only=1 supaya donatur langsung melihat QR code QRIS tanpa ribet pilih metode lain
    const officialPakasirUrl = `https://app.pakasir.com/pay/${proyekSlugPakasir}/${cleanAmount}?order_id=${generatedOrderId}&qris_only=1`;

    // 5. Kembalikan URL yang valid ke frontend Next.js agar user langsung dialihkan
    return NextResponse.json({
      success: true,
      paymentUrl: officialPakasirUrl
    });

  } catch (error: any) {
    console.error('🔥 CHECKOUT RUNTIME ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}