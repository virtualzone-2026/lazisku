// app/api/fundraiser/stats/route.ts
import { NextResponse } from 'next/server';
// 🚀 OPTIMASI: Menggunakan clientPublik yang memanfaatkan Edge CDN gratis
import { clientPublik as client } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Nomor WhatsApp wajib disertakan.' }, { status: 400 });
    }

    // Bersihkan format nomor seperti biasa untuk pencarian database
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    // 🚀 QUERY GROQ: Mencari fundraiser berdasarkan nomor WA, lalu mengambil 
    // semua data donasi sukses di program terkait yang mencantumkan nama/slug mereka sebagai referal
    const query = `{
      "profile": *[_type == "fundraiser" && phone == $phone][0] {
        name,
        status,
        "programTitle": program->title,
        "programSlug": program->slug.current
      },
      "donations": *[_type == "donationTransaction" && status == "success" && (referral == $phone || lower(referral) == lower(*[_type == "fundraiser" && phone == $phone][0].name))] {
        amount,
        donorName,
        _createdAt
      }
    }`;

    const data = await client.fetch(query, { phone: formattedPhone });

    if (!data.profile) {
      return NextResponse.json({ success: false, message: 'Data fundraiser tidak ditemukan.' }, { status: 404 });
    }

    // Hitung akumulasi pendapatan bersih dari link afiliasi
    const totalEarnings = data.donations.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

    return NextResponse.json(
      { 
        success: true, 
        profile: data.profile,
        totalEarnings,
        donationCount: data.donations.length,
        history: data.donations
      },
      {
        status: 200,
        headers: {
          // 🚀 DOUBLE-LOCK CACHE: Data statistik ini dicache 60 detik agar tidak membebani serverless
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );

  } catch (error: any) {
    console.error('🔥 API Fundraiser Stats Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}