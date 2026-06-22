// app/api/webhook/pakasir/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// ===================================================================
// SANITY CLIENT WRITE (Menggunakan Token Hardcode Editor Anda)
// ===================================================================
const client = createClient({
  projectId: 'jmgc1ejr', 
  dataset: 'production',
  useCdn: false, 
  apiVersion: '2024-01-01',
  token: 'sk7NqErRROXCLrscMNjmzvwt2hhpiI61vdbMqw0oN6zBkvrtEhOJG4GS71LcC4ldpRhqiTVCEkzYfAznTnap1Pv5LZQZt9Uo7Ixqw0AAOq7ReDbPO9tciZyXkTlMA2VoAA1NiU6ITL5PqGkGCtvQuLCiRENowtxfPBbDAnusAU1pu2tUvnt7', 
});

// ===================================================================
// WEBHOOK PAKASIR AUTOMATION (FUTURE-PROOF & STRICT PARSING)
// ===================================================================
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("======================================");
    console.log("🚀 WEBHOOK PAKASIR MASUK (PERBAIKAN FINAL)");
    console.log(JSON.stringify(payload, null, 2));
    console.log("======================================");

    const { amount, order_id, project, status, reference, donor_name } = payload;

    // 1. Validasi Status Pembayaran Sukses dari Pakasir
    const successStatus = ["completed", "success", "paid", "200", 200];
    if (!successStatus.includes(status)) {
      console.log("⚠️ STATUS BELUM BERHASIL, DIABAIKAN:", status);
      return NextResponse.json({
        success: true,
        message: "Pembayaran belum selesai, mutasi diabaikan."
      });
    }

    let programSlug = '';

    // 🚀 PRIORITAS SLUG 1: Baca langsung data reference.slug dari Frontend (Opsi paling anti-gagal)
    if (reference?.slug) {
      programSlug = String(reference.slug).toLowerCase().trim();
    }

    // 🚀 PRIORITAS SLUG 2: Jika P1 kosong, bedah keyword order_id secara otomatis
    if (!programSlug && order_id && typeof order_id === 'string') {
      const upperOrderId = order_id.toUpperCase();
      
      // Mengunci program utama yang sudah berjalan agar kebal miskomunikasi string
      if (upperOrderId.includes('MUALAF')) {
        programSlug = "bantu-mualaf-dan-dhuafa";
      } else if (upperOrderId.includes('BERAS') || upperOrderId.includes('SANTRI')) {
        programSlug = "sedekah-beras-untuk-santri-penghafal-al-qur-an";
      } else if (upperOrderId.includes('SUBUH')) {
        programSlug = "sedekah-subuh";
      } 
      // AUTOMATION FALLBACK: Ekstraksi otomatis jika ada program baru di masa depan
      else {
        const parts = order_id.split('-');
        if (parts.length >= 2) {
          const middleParts = parts.slice(1, parts.length - 1);
          if (middleParts.length > 0) {
            programSlug = middleParts.join('-').toLowerCase().trim();
          } else {
            programSlug = parts[1].toLowerCase().trim();
          }
        }
      }
    }

    // 🚀 PRIORITAS SLUG 3: Amankan jika kosong total ke program utama
    if (!programSlug) {
      programSlug = "sedekah-subuh"; 
    }

    console.log("🎯 KEPUTUSAN TARGET SLUG SANITY:", programSlug);

    // 3. AMBIL DOKUMEN DENGAN QUERY TOLERANSI ELASTIS (Match operator GROQ)
    const findQuery = `*[_type == "program" && (slug.current == $slug || slug.current match $slug + "*" || slug.current match "*" + $slug + "*")][0] { _id, title, collectedRaw }`;
    const liveProgram = await client.fetch(findQuery, { slug: programSlug });

    if (!liveProgram) {
      console.error("❌ TARGET PROGRAM TIDAK DITEMUKAN DI SANITY:", programSlug);
      return NextResponse.json({
        success: false,
        message: `Program dengan identitas slug '${programSlug}' tidak ditemukan di Sanity.`
      }, { status: 404 });
    }

    // 4. 🚀 MUTLAK FIXED: Jalur parsing nama donatur anti-bypass "Hamba Allah"
    let donorName = "Hamba Allah";

    if (payload.donor_name && String(payload.donor_name).trim() !== "") {
      donorName = String(payload.donor_name).trim();
    } else if (donor_name && String(donor_name).trim() !== "") {
      donorName = String(donor_name).trim();
    } else if (reference?.donorName && String(reference.donorName).trim() !== "") {
      donorName = String(reference.donorName).trim();
    }

    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return NextResponse.json({ success: false, message: "Nominal donasi tidak valid" }, { status: 400 });
    }

    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    console.log(`💰 MENYUNTIKKAN MUTASI: ${liveProgram.title} | Donatur: ${donorName} | +Rp ${donationAmount}`);

    // 5. EKSEKUSI MUTASI OTOMATIS KE CLOUD SANITY CMS
    const result = await client
      .patch(liveProgram._id)
      .setIfMissing({ collectedRaw: 0, donors: [] })
      .inc({ collectedRaw: donationAmount }) 
      .append('donors', [
        {
          _key: `donor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: donorName,
          amount: donationAmount,
          date: currentDate
        }
      ])
      .commit();

    console.log("✅ LIVE DATABASE UPDATE SUCCESS -> ID:", result._id);

    return NextResponse.json({
      success: true,
      message: `Sukses otomatis! Nominal Rp ${donationAmount} dari ${donorName} masuk ke program ${liveProgram.title}`
    });

  } catch (error: any) {
    console.error("🔥 WEBHOOK AUTOMATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}