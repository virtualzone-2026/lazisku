// app/api/news/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// 🚀 JURUS SAKTI ANTI-CACHE NEXT.JS APP ROUTER
// Memaksa API Route ini agar selalu bersifat dinamis & melarang keras serverless menyimpan cache statis
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20',
  useCdn: false, // Wajib false agar artikel baru langsung muncul real-time tanpa delay CDN
});

function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  
  // Amankan jika ada ketidaksesuaian waktu server/lokal yang menghasilkan angka minus
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return `${diffDays} hari lalu`;
}

export async function GET() {
  try {
    // 🚀 FIXED QUERY GROQ: Menarik category murni sebagai string text cadangan jika referensi kosong
    const query = `*[_type == "news"] | order(publishedAt desc)[0..11] {
      "id": _id,
      "slug": slug.current,
      title,
      "image": image.asset->url,
      "category": coalesce(category->title, category, "Kabar Terbaru"),
      publishedAt
    }`;

    // 🚀 FIXED CACHING AT FETCH LEVEL: Menambahkan header anti-cache pada penarikan data Sanity Cloud
    const sanityNews = await sanityClient.fetch(query, {}, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    const formattedNews = sanityNews.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      image: item.image || '/images/placeholder.jpg',
      category: item.category,
      publishedAt: item.publishedAt,
      timeAgo: timeAgo(item.publishedAt),
    }));

    // 🚀 FIXED HEADERS: Menyuntikkan instruksi anti-cache pada response JSON untuk browser & hosting serverless
    return new NextResponse(JSON.stringify({ success: true, data: formattedNews }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('🔥 Fetch News API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}