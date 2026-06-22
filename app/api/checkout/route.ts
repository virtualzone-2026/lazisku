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

    // 1. Validasi Input
    if (!slug || !amount || Number(amount) < 10000) {
      return NextResponse.json({ success: false, error: 'Data transaksi tidak valid atau kurang dari Rp 10.000' }, { status: 400 });
    }

    // 2. Generate Order ID
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

    // 4. EMBED LANGSUNG KE API PROSES TRANSAKSI PAKASIR ASLI
    // Menembak langsung ke API core gateway Pakasir untuk membuat dynamic link pembayaran QRIS
    const responsePakasir = await fetch('https://pakasir.com/api/v1/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Jika Anda memiliki API Key/Secret Token dari Pakasir, masukkan di bawah ini. 
        // Jika tidak ada, Anda bisa hapus baris Authorization ini atau biarkan default.
        'Authorization': 'Bearer YOUR_PAKASIR_API_KEY_HERE' 
      },
      body: JSON.stringify({
        order_id: generatedOrderId,
        amount: Number(amount),
        project: 'yayasan-generasi-indonesia-mengaji',
        // Menyimpan data metadata tambahan di dalam objek transaksi Pakasir
        reference: {
          slug: slug,
          donorName: donorName || 'Hamba Allah',
          donorPhone: donorPhone || ''
        }
      })
    });

    const dataPakasir = await responsePakasir.json();

    // 5. REDIRECT OTOMATIS KE HALAMAN PEMBAYARAN / QRIS PAKASIR YANG SUKSES DIBUAT
    if (dataPakasir.success && (dataPakasir.paymentUrl || dataPakasir.payment_url || dataPakasir.data?.payment_url)) {
      const livePaymentUrl = dataPakasir.paymentUrl || dataPakasir.payment_url || dataPakasir.data?.payment_url;
      return NextResponse.json({
        success: true,
        paymentUrl: livePaymentUrl
      });
    }

    // Fallback dinamis jika property response API strukturnya sedikit berbeda
    if (dataPakasir.data?.url) {
      return NextResponse.json({ success: true, paymentUrl: dataPakasir.data.url });
    }

    // Jika API Pakasir merespons namun tidak memuat URL transaksi baru, kembalikan objek error
    return NextResponse.json({ 
      success: false, 
      error: dataPakasir.message || 'Gagal generate invoice dari sistem Pakasir.' 
    });

  } catch (error: any) {
    console.error('🔥 CHECKOUT RUNTIME ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}