// app/api/webhook/pakasir/route.ts
import { NextResponse } from 'next/server';
// 🚀 FIXED: Mengimpor client internal anti-boncos yang ditujukan khusus untuk manipulasi database (write)
import { clientInternal as client } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

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
    const status = payload.status; // Berupa string "completed" jika sukses

    // 1. Validasi Status Pembayaran Sukses dari Pakasir secara ketat
    if (status !== 'completed') {
      return NextResponse.json({
        success: true,
        message: `Status transaksi (${status}) belum selesai, mutasi diabaikan.`
      });
    }

    const cleanOrderId = order_id ? String(order_id).trim() : '';
    if (!cleanOrderId) {
      return NextResponse.json({ success: false, message: "Order ID tidak ditemukan dalam payload." }, { status: 400 });
    }

    // ===================================================================
    // 2. AMBIL DATA NAMA & NO WA ASLI LANGSUNG DARI INPUT FORM FRONTEND (SANITY)
    // ===================================================================
    const transactionQuery = `*[_type == "donationTransaction" && orderId == $orderId][0]`;
    const pendingTransaction = await client.fetch(transactionQuery, { orderId: cleanOrderId });

    let donorNameFromForm = "Hamba Allah";
    let donorPhoneFromForm = "";
    let programSlug = "sedekah-subuh"; // Default fallback aman
    let paymentMethodUsed = "QRIS";

    if (pendingTransaction) {
      // Jika transaksi di Sanity sudah berstatus 'success', hentikan proses agar tidak duplikat perhitungan/spam WA
      if (pendingTransaction.status === 'success') {
        console.log(`♻️ Transaksi ${cleanOrderId} sudah pernah diproses sebelumnya (Status Sanity: success).`);
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
      
      // Update status data transaksi penampung sementara di Sanity agar tidak terproses ganda
      await client.patch(pendingTransaction._id).set({ status: 'success' }).commit();
    } else {
      console.log(`⚠️ Data transaksi pending untuk ID ${cleanOrderId} tidak ditemukan di Sanity. Menggunakan fallback kata kunci.`);
      const upperOrderId = cleanOrderId.toUpperCase();
      if (upperOrderId.includes('MUALAF')) {
        programSlug = "bantu-mualaf-dan-dhuafa";
      } else if (upperOrderId.includes('BERAS') || upperOrderId.includes('SANTRI')) {
        programSlug = "sedekah-beras-untuk-santri-penghafal-al-qur-an";
      }
    }

    // 3. AMBIL DOKUMEN PROGRAM UTAMA
    const findQuery = `*[_type == "program" && slug.current == $slug][0] { _id, title, collectedRaw, donors }`;
    const finalProgram = await client.fetch(findQuery, { slug: programSlug });

    if (!finalProgram) {
      return NextResponse.json({ success: false, message: `Program dengan slug '${programSlug}' tidak ditemukan.` }, { status: 404 });
    }

    // Pastikan nominal diambil dengan benar (prioritas dari callback Pakasir, fallback dari record transaksi)
    const donationAmount = Number(amount) || Number(pendingTransaction?.amount) || 0;
    
    // Format tanggal Indonesia
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // ===================================================================
    // 4. PENGECEKAN DUPLIKASI DATA & MENAMPILKAN NAMA DONATUR DI DASHBOARD
    // ===================================================================
    const existingDonors = finalProgram.donors || [];
    const duplicateIndex = existingDonors.findIndex((d: any) => d.orderId === cleanOrderId);

    if (duplicateIndex === -1) {
      console.log(`💰 DANA MASUK & VALID: Memunculkan nama ${donorNameFromForm} senilai Rp ${donationAmount} di program ${finalProgram.title}`);
      
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
      // 🚀 5. OTOMATISASI KIRIM PESAN TERIMA KASIH WA VIA FONNTE API
      // ===================================================================
      if (donorPhoneFromForm !== '') {
        // Pembersihan format nomor telepon untuk Fonnte (menghapus spasi, strip, dan leading zero)
        let formattedPhone = donorPhoneFromForm.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '62' + formattedPhone.slice(1);
        }

        // DINAMISASI LABEL: Ubah kata "Infak" menjadi "Zakat" jika programnya bermuatan Zakat
        const isZakatProgram = programSlug.includes('zakat');
        const labelNominal = isZakatProgram ? 'Nominal Zakat' : 'Nominal Infak';
        const kataSapaan = isZakatProgram ? 'Muzakki' : 'Bapak/Ibu/Sdr';

        const messageText = 
          `*Terima Kasih Atas Kebaikan Anda* 🙏🌟\n\n` +
          `Assalamualaikum wr. wb.,\n` +
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

    } else {
      console.log(`♻️ Transaksi ${cleanOrderId} terdeteksi di dalam array donors program utama.`);
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