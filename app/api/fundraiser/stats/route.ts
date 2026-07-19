import { NextResponse } from 'next/server';
// 🚀 OPTIMASI: Pastikan useCdn: false digunakan untuk halaman data statistik yang sensitif & real-time
import { clientPublik as client } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Nomor WhatsApp wajib disertakan.' }, { status: 400 });
    }

    // Bersihkan format nomor untuk pencarian database (Samakan dengan format inputan webhook)
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    // 🚀 QUERY GROQ LENGKAP: 
    // 1. Mengambil profil fundraiser
    // 2. Mengambil donasi sukses berdasarkan field 'fundraiserPhone' yang sinkron dengan webhook & skema
    // 3. Mengambil seluruh program aktif agar muncul di daftar multi-link afiliasi dashboard
    const query = `{
      "profile": *[_type == "fundraiser" && (phone == $phone || phone == $rawPhone)][0] {
        name,
        status,
        feePaid, // Ambil nominal fee yang sudah dibayarkan yayasan dari profil
        "programTitle": program->title,
        "programSlug": program->slug.current
      },
      "donations": *[_type == "donationTransaction" && status == "success" && (fundraiserPhone == $phone || fundraiserPhone == $rawPhone)] | order(_createdAt desc) {
        amount,
        donorName,
        _createdAt
      },
      "programs": *[_type == "program" && !(_id in path('drafts.**'))] {
        title,
        "slug": slug.current
      }
    }`;

    const data = await client.fetch(query, { 
      phone: formattedPhone,
      rawPhone: phone.trim() // Jaga-jaga jika di DB tersimpan format lokal '08...'
    });

    if (!data.profile) {
      return NextResponse.json({ success: false, message: 'Data fundraiser tidak ditemukan atau belum aktif.' }, { status: 404 });
    }

    // Hitung akumulasi pendapatan bersih dari link afiliasi relawan
    const totalEarnings = data.donations.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

    return NextResponse.json(
      { 
        success: true, 
        profile: data.profile,
        totalEarnings,
        donationCount: data.donations.length,
        history: data.donations,
        programs: data.programs // 🚀 SUPLAI DATA INI AGAR MAPPING MULTI-LINK DI FRONTEND BEKERJA
      },
      {
        status: 200,
        headers: {
          // 🚀 FIXED: Jangan gunakan cache berdurasi (s-maxage) untuk halaman statistik keuangan!
          // Gunakan no-store agar donasi QRIS sukses langsung menambah angka di layar saat itu juga.
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );

  } catch (error: any) {
    console.error('🔥 API Fundraiser Stats Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}