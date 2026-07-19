// app/api/webhook/pakasir/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

// 🚀 BYPASS TESTED: Menggunakan client internal langsung agar terbebas dari masalah permission token di server hosting
const client = createClient({
  projectId: '61d8vnuq',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'sk44JM4AlD6urcLa9Ak9vvnRpLGlsRai9aftW1wPA4w9zxwhrCpKREk2ArKU25K4kENIPxVXenu4kZhm2cOSaxGP69kz8az2qM2BZDIVzqyAGLjIvVTGKMu39CExUrKwbw2wCb2bfxKPgZ4lqEt2nwLZT4HEc4XT1qfrZ0i6KYupIlT6IOlP',
});

// ===================================================================
// WEBHOOK PAKASIR AUTOMATION + FONNTE NOTIFICATION
// ===================================================================
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("======================================");
    console.log("🚀 WEBHOOK PAKASIR: MEMPROSES VERIFIKASI DANA MASUK");
    console.log(JSON.stringify(payload, null, 2));
    console.log("======================================");

    const amount = payload.amount;
    const order_id = payload.order_id;
    // 💡 Pakasir mengirimkan string "completed" atau "success" saat transaksi lunas
    const status = payload.status; 

    const cleanOrderId = order_id ? String(order_id).trim() : '';
    if (!cleanOrderId) {
      return NextResponse.json({ success: false, message: "Order ID tidak ditemukan dalam payload." }, { status: 400 });
    }

    // 1. Validasi Status Pembayaran Sukses dari Pakasir (Mendukung 'completed', 'success', maupun 'paid')
    const cleanStatus = status ? String(status).toLowerCase().trim() : '';
    if (cleanStatus !== 'completed' && cleanStatus !== 'success' && cleanStatus !== 'paid') {
      return NextResponse.json({
        success: true,
        message: `Status transaksi (${status}) belum selesai, mutasi diabaikan.`
      });
    }

    // ===================================================================
    // 2. AMBIL DATA DARI PENDING BOX UNTUK CHECK DUPLIKASI DAN MENDAPATKAN SLUG
    // ===================================================================
    const transactionQuery = `*[_type == "donationTransaction" && orderId == $orderId][0]`;
    const pendingTransaction = await client.fetch(transactionQuery, { orderId: cleanOrderId });

    let donorNameFromForm = "Hamba Allah";
    let donorPhoneFromForm = "";
    let programSlug = "sedekah-subuh"; // Default fallback
    let paymentMethodUsed = "QRIS";

    if (pendingTransaction) {
      // ➔ ANTI-BONCOS UTAMA: Jika status transaksi di database penampung sudah sukses, hentikan operasi seketika!
      if (pendingTransaction.status === 'success') {
        console.log(`♻️ Transaksi ${cleanOrderId} dihentikan awal demi menghemat kuota Sanity (Sudut Siku).`);
        return NextResponse.json({ success: true, message: "Transaksi sudah sukses diproses sebelumnya." });
      }

      if (pendingTransaction.donorName && String(pendingTransaction.donorName).trim() !== "") {
        donorNameFromForm = String(pendingTransaction.donorName).trim();
      }
      if (pendingTransaction.donorPhone && String(pendingTransaction.donorPhone).trim() !== "") {
        donorPhoneFromForm = String(pendingTransaction.donorPhone).trim();
      }
      if (pendingTransaction.slug) {
        programSlug = String(pendingTransaction.slug).toLowerCase().trim();
      }
      if (pendingTransaction.paymentMethod) {
        paymentMethodUsed = String(pendingTransaction.paymentMethod).toUpperCase();
      }
    } else {
      console.log(`⚠️ Data transaksi pending untuk ID ${cleanOrderId} tidak ditemukan. Membaca fallback ID.`);
      const upperOrderId = cleanOrderId.toUpperCase();
      if (upperOrderId.includes('MUALAF')) {
        programSlug = "bantu-mualaf-dan-dhuafa";
      } else if (upperOrderId.includes('BERAS') || upperOrderId.includes('SANTRI')) {
        programSlug = "sedekah-beras-untuk-santri-penghafal-al-qur-an";
      }
    }

    // 3. AMBIL DOKUMEN PROGRAM UTAMA UNTUK VERIFIKASI ARRAY DONATUR
    const findQuery = `*[_type == "program" && slug.current == $slug][0] { _id, title, collectedRaw, donors }`;
    const finalProgram = await client.fetch(findQuery, { slug: programSlug });

    if (!finalProgram) {
      return NextResponse.json({ success: false, message: `Program dengan slug '${programSlug}' tidak ditemukan.` }, { status: 404 });
    }

    const existingDonors = finalProgram.donors || [];
    const isAlreadyExist = existingDonors.some((d: any) => d.orderId === cleanOrderId);

    // ➔ ANTI-BONCOS KEDUA: Jika orderId ternyata sudah disuntikkan ke dokumen program utama, batalkan total!
    if (isAlreadyExist) {
      console.log(`♻️ Transaksi ${cleanOrderId} sudah terdaftar di list donatur program utama. Eksekusi dibatalkan.`);
      return NextResponse.json({ success: true, message: "Transaksi sudah tersinkronisasi sebelumnya." });
    }

    // Pastikan nominal diambil secara akurat
    const donationAmount = Number(amount) || Number(pendingTransaction?.amount) || 0;
    
    // Format tanggal Indonesia
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    console.log(`💰 DANA MASUK & VALID: Memunculkan nama ${donorNameFromForm} senilai Rp ${donationAmount} di program ${finalProgram.title}`);
    
    // ===================================================================
    // 4. MENJALANKAN DUA MUTASI SECARA BERBURUTAN (TRANSAKSI + PROGRAM UTAMA)
    // ===================================================================
    if (pendingTransaction) {
      await client.patch(pendingTransaction._id).set({ status: 'success' }).commit();
    }

    await client
      .patch(finalProgram._id)
      .setIfMissing({ collectedRaw: 0, donors: [] })
      .inc({ collectedRaw: donationAmount }) 
      .append('donors', [
        {
          _key: `donor-${cleanOrderId}-${Math.random().toString(36).substring(2, 5)}`,
          orderId: cleanOrderId,
          name: donorNameFromForm,
          amount: donationAmount,
          date: currentDate
        }
      ])
      .commit();

    // ===================================================================
    // 🚀 5. OUTBOUND NOTIFIKASI WA VIA FONNTE API
    // ===================================================================
    if (donorPhoneFromForm !== '') {
      let formattedPhone = donorPhoneFromForm.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      }

      const isZakatProgram = programSlug.includes('zakat');
      const labelNominal = isZakatProgram ? 'Nominal Zakat' : 'Nominal Infak';
      const kataSapaan = isZakatProgram ? 'Muzakki' : 'Bapak/Ibu/Sdr';

      const messageText = 
        `*Terima Kasih Atas Kebaikan Anda* 🙏🌟\n\n` +
        `` + (isZakatProgram ? 'Semoga Allah menerima amal zakat Anda.' : 'Assalamualaikum wr. wb.,\n') +
        `Jazakumullah Khairan Katsiran kepada ${kataSapaan} *${donorNameFromForm}*.\n\n` +
        `Alhamdulillah, pembayaran dana amanah Anda telah kami terima dengan rincian berikut:\n` +
        `• *ID Transaksi:* ${cleanOrderId}\n` +
        `• *${labelNominal}:* Rp ${donationAmount.toLocaleString('id-ID')}\n` +
        `• *Metode:* ${paymentMethodUsed}\n` +
        `• *Program:* ${finalProgram.title}\n\n` +
        `Semoga dana yang Anda tunaikan menjadi pembersih harta, pelipat ganda pahala, serta mengalirkan keberkahan yang tiada putus untuk Anda sekeluarga. Aamiin Yaa Rabbal 'Aalamiin.\n\n` +
        `Salam hangat,\n` +
        `*LAZIS Khoiro Ummah* (lazisku.com)`;

      try {
        const fonnteResponse = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': process.env.FONNTE_TOKEN || '', 
          },
          body: new URLSearchParams({
            target: formattedPhone,
            message: messageText,
          }),
        });

        const fonnteData = await fonnteResponse.json();
        if (fonnteData.status) {
          console.log(`📱 Notifikasi WA sukses terkirim lewat Fonnte ke: ${formattedPhone}`);
        } else {
          console.error(`❌ Fonnte API merespons gagal:`, fonnteData.reason || 'Penyebab tidak diketahui');
        }
      } catch (fonnteErr) {
        console.error(`🔥 Gagal menghubungi endpoint API Fonnte:`, fonnteErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sukses otomatis! Dana terverifikasi, nama ${donorNameFromForm} tampil, dan notifikasi WA diproses.`
    });

  } catch (error: any) {
    console.error("🔥 WEBHOOK AUTOMATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}