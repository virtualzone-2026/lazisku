// app/api/programs/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// 🚀 JURUS SAKTI ANTI-CACHE NEXT.JS APP ROUTER
// Memaksa API Route ini agar selalu bersifat dinamis & melarang keras serverless menyimpan cache statis
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Inisialisasi Sanity Client menggunakan variabel dari environment variables
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20', 
  useCdn: false, // Wajib false agar nominal donasi langsung update real-time saat webhook masuk
});

export async function GET() {
  try {
    // Query GROQ untuk menarik tipe data 'program' sekaligus me-resolve URL Gambar dari CDN Sanity
    // 🚀 FIXED: Menarik juga properti array "donors" agar halaman detail bisa menampilkan riwayat nama donatur asli
    const query = `*[_type == "program"] | order(_createdAt desc) {
      "id": _id,
      "slug": slug.current,
      title,
      category,
      "image": image.asset->url,
      collectedRaw,
      targetAmount,
      description,
      donors
    }`;

    // 🚀 FIXED CACHING AT FETCH LEVEL: Menambahkan header benci cache pada metode penarikan data Sanity
    const sanityPrograms = await sanityClient.fetch(query, {}, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    // Format data mentah dari Sanity ke format yang dibutuhkan UI Card halaman depan & detail
    const formattedData = sanityPrograms.map((program: any) => {
      const rawAmount = Number(program.collectedRaw || 0);
      const targetAmount = Number(program.targetAmount || 50000000);

      return {
        id: program.id,
        slug: program.slug,
        title: program.title,
        category: program.category || 'KEMANUSIAAN',
        image: program.image || 'https://via.placeholder.com/385x176?text=No+Image',
        collected: `Rp ${rawAmount.toLocaleString('id-ID')}`,
        collectedRaw: rawAmount,
        target: `Rp ${targetAmount.toLocaleString('id-ID')}`,
        targetAmount: targetAmount, // Menyertakan nominal angka mentah untuk kalkulasi persentase progress bar
        description: program.description || null, // Mengirimkan array object rich text block ke frontend
        donors: program.donors || [] // Menyertakan list donatur asli dari database Sanity
      };
    });

    // 🚀 FIXED HEADERS: Menyuntikkan instruksi anti-cache pada response JSON untuk browser & hosting CDN
    return new NextResponse(JSON.stringify({ success: true, data: formattedData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('Sanity Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}