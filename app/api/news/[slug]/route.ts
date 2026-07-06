// app/api/news/[slug]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// 🚀 JURUS SAKTI ANTI-CACHE NEXT.JS APP ROUTER
// Memaksa API Route ini agar selalu bersifat dinamis & melarang keras server menyimpan cache statis
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jmgc1ejr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20',
  useCdn: false, // Wajib false agar data berita & update nominal donasi sidebar langsung real-time
});

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> } // Valid untuk Next.js 15+
) {
  try {
    // 🚀 FIXED: Menunggu Promise params diselesaikan dengan aman sesuai standar Next.js terbaru
    const { slug } = await context.params;
    
    console.log("=== MEMPROSES API UNTUK SLUG ===", slug);

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      return NextResponse.json({ 
        success: true, 
        buildTime: true, 
        data: { article: null, allNews: [], sidebarCampaigns: [] } 
      });
    }

    // 🚀 FIXED GROQ DEEP DEREFERENCE: Mengamankan content block agar kebal dari eror objek {_ref, _type}
    const query = `{
      "article": *[_type == "news" && lower(slug.current) == lower($slug)][0] {
        "id": _id,
        title,
        "slug": slug.current,
        "imageUrl": image.asset->url,
        "caption": image.caption,
        "alt": image.alt,
        publishedAt,
        category,
        // 🎯 Membedah block content dan memaksa aset gambar internal untuk ter-dereference ke url
        content[] {
          ...,
          asset-> {
            ...,
            url
          },
          markDefs[] {
            ...,
            _type == "reference" => {
              "slug": @->slug.current
            }
          }
        }
      },
      "allNews": *[_type == "news"] | order(publishedAt desc) {
        "id": _id,
        title,
        "slug": slug.current,
        "imageUrl": image.asset->url,
        publishedAt,
        category
      },
      "sidebarCampaigns": *[_type == "program"] | order(_createdAt desc)[0..2] {
        "id": _id,
        "slug": slug.current,
        title,
        collectedRaw,
        targetAmount
      }
    }`;

    // 🚀 FIXED CACHING AT FETCH LEVEL: Menambahkan header benci cache pada penarikan data Sanity Client
    const data = await sanityClient.fetch(query, { slug }, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!data.article) {
      return new NextResponse(
        JSON.stringify({ success: false, error: `Artikel dengan slug '${slug}' tidak ditemukan di Sanity.` }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 🚀 FIXED HEADERS: Menyuntikkan instruksi anti-cache pada response JSON untuk browser & hosting CDN
    return new NextResponse(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('🔥 API Detail News Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}