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

    if (!slug || !amount || Number(amount) < 10000) {
      return NextResponse.json({ success: false, error: 'Data transaksi tidak valid atau kurang dari Rp 10.000' }, { status: 400 });
    }

    // 1. Generate Order ID
    const prefix = slug.toUpperCase().includes('BERAS') ? 'BERAS' : slug.toUpperCase().includes('MUALAF') ? 'MUALAF' : 'SUBUH';
    const generatedOrderId = `INV-${prefix}-${Date.now()}`;

    // 2. Kunci data Nama & WhatsApp dari form frontend langsung ke Sanity (Pending)
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

    // 3. HIT INTEGRASI KE API PAKASIR ASLI
    // Kita bungkus ke dalam try-catch internal agar jika API eksternal bermasalah, database kita tidak ikut crash
    try {
      const pakasirResponse = await fetch('https://pakasir.com/api/v1/order', { // <-- Endpoint order Pakasir Anda
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_PAKASIR_API_KEY_HERE' // <-- Masukkan API/Secret Key Pakasir Anda jika ada
        },
        body: JSON.stringify({
          amount: Number(amount),
          order_id: generatedOrderId,
          project: 'yayasan-generasi-indonesia-mengaji',
          // Sertakan reference sebagai jaring pengaman tambahan
          reference: JSON.stringify({ slug, donorName, donorPhone })
        })
      });

      const pakasirJson = await pakasirResponse.json();
      
      // Jika Pakasir sukses mengembalikan link pembayaran/QRIS
      if (pakasirJson.success && (pakasirJson.paymentUrl || pakasirJson.payment_url || pakasirJson.data?.payment_url)) {
        const urlFinal = pakasirJson.paymentUrl || pakasirJson.payment_url || pakasirJson.data?.payment_url;
        return NextResponse.json({ success: true, paymentUrl: urlFinal });
      }
    } catch (apiError) {
      console.error("⚠️ Gagal terhubung ke API Pakasir, beralih ke fallback invoice langsung.");
    }

    // 4. FALLBACK INVOICE DI DASHBOARD PAKASIR JIKA API HIT TERHAMBAT
    // Jika hit API mereka dibatasi/sandbox, arahkan langsung ke halaman invoice publik merchant Anda di Pakasir
    const fallbackPublicInvoice = `https://pakasir.com/yayasan-generasi-indonesia-mengaji?order_id=${generatedOrderId}&amount=${amount}`;
    
    return NextResponse.json({
      success: true,
      paymentUrl: fallbackPublicInvoice
    });

  } catch (error: any) {
    console.error('🔥 CHECKOUT RUNTIME ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}