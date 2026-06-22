// app/api/news/[slug]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20',
  useCdn: false,
});

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
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

    const data = await sanityClient.fetch(query, { slug });

    if (!data.article) {
      return NextResponse.json(
        { success: false, error: `Artikel dengan slug '${slug}' tidak ditemukan di Sanity.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Detail News Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}