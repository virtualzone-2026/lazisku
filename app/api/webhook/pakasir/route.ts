// app/api/webhook/pakasir/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

// ===================================================================
// SANITY CLIENT WRITE (Menggunakan Token Hardcode Editor Anda)
// ===================================================================
const client = createClient({
  projectId: '19a8r8sr', 
  dataset: 'production',
  useCdn: false, 
  apiVersion: '2024-01-01',
  token: 'skG4ics36bFQorNtT6FkLP5F9o8JXwb5uc4Hf4qaMNT7RMZbRvbWb4oti8wtFcGzoQM4DL3Fgo06PRnacLU4FGkzKi0Z0TQM1JQGS5Cqbj5KTXjQXYSrA7sdy6oPhkVJX3Co2ZcncmHaFRzSlqsbbRmFNC0T2vrqJe2iCx89Uerby8ezsl08', 
});

// ===================================================================
// WEBHOOK PAKASIR AUTOMATION (BERDASARKAN DATA ARSITEKTUR FRONTEND)
// ===================================================================
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("======================================");
    console.log("🚀 WEBHOOK PAKASIR: MEMPROSES VERIFIKASI DANA MASUK");
    console.log(JSON.stringify(payload, null, 2));
    console.log("======================================");

    // Pakasir biasanya mengirimkan data utama langsung di root body atau di dalam objek 'data'
    const order_id = payload.order_id || payload.data?.order_id;
    const status = payload.status || payload.data?.status;
    const amount = payload.amount || payload.data?.amount;

    // 1. Validasi Status Pembayaran Sukses dari Pakasir
    // Pakasir mengembalikan string status seperti "PAID" atau "SUCCESS" saat dana berhasil masuk
    const cleanStatus = status ? String(status).toUpperCase().trim() : '';
    const successStatus = ["COMPLETED", "SUCCESS", "PAID", "200"];
    
    if (!successStatus.includes(cleanStatus)) {
      return NextResponse.json({
        success: true,
        message: `Status transaksi (${status}) belum berhasil, mutasi diabaikan.`
      });
    }

    const cleanOrderId = order_id ? String(order_id).trim() : '';
    if (!cleanOrderId) {
      return NextResponse.json({ success: false, message: "Order ID tidak ditemukan dalam payload." }, { status: 400 });
    }

    // ===================================================================
    // 2. AMBIL DATA NAMA ASLI LANGSUNG DARI INPUT FORM FRONTEND (SANITY)
    // ===================================================================
    // Menghindari kehilangan nama akibat filter gateway Pakasir dengan menarik langsung
    // dari skema 'donationTransaction' pending yang dibuat saat user klik bayar di frontend.
    const transactionQuery = `*[_type == "donationTransaction" && orderId == $orderId][0]`;
    const pendingTransaction = await client.fetch(transactionQuery, { orderId: cleanOrderId });

    let donorNameFromForm = "Hamba Allah";
    let programSlug = "sedekah-subuh"; // Default fallback aman

    if (pendingTransaction) {
      // Jika transaksi di Sanity sudah berstatus 'success', hentikan proses agar tidak duplikat limit/perhitungan
      if (pendingTransaction.status === 'success') {
        console.log(`♻️ Transaksi ${cleanOrderId} sudah pernah diproses sebelumnya (Status Sanity: success).`);
        return NextResponse.json({ success: true, message: "Transaksi sudah sukses diproses sebelumnya." });
      }

      if (pendingTransaction.donorName && String(pendingTransaction.donorName).trim() !== "") {
        donorNameFromForm = String(pendingTransaction.donorName).trim();
      }
      if (pendingTransaction.slug) {
        programSlug = String(pendingTransaction.slug).toLowerCase().trim();
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
    
    // Format tanggal Indonesia (contoh: 6 Juli 2026)
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
            name: donorNameFromForm, // Nama asli dari form pengisian frontend sukses disuntikkan
            amount: donationAmount,
            date: currentDate
          }
        ])
        .commit();
    } else {
      console.log(`♻️ Transaksi ${cleanOrderId} terdeteksi di dalam array donors program utama.`);
    }

    // Selalu kembalikan response JSON 200 OK dengan format sukses ke Pakasir agar server mereka berhenti mengirim hit ulang webhook
    return NextResponse.json({
      success: true,
      message: `Sukses otomatis! Dana terverifikasi dan nama ${donorNameFromForm} berhasil ditampilkan.`
    });

  } catch (error: any) {
    console.error("🔥 WEBHOOK AUTOMATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}