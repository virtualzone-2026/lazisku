// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20',
  useCdn: false,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Query mencari di tipe 'news' ATAU 'program' yang judulnya mengandung kata kunci
    const query = `*[(_type == "news" || _type == "program") && title match $keyword] {
      "id": _id,
      "type": _type,
      "slug": slug.current,
      title,
      "category": category->title,
      publishedAt,
      _createdAt
    }`;

    const results = await sanityClient.fetch(query, { keyword: `*${q}*` });
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}