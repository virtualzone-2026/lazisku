// app/api/programs/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-06-20', 
  useCdn: false,
});

export async function GET() {
  try {
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

    const sanityPrograms = await sanityClient.fetch(query, {}, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

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
        targetAmount: targetAmount,
        description: program.description || null,
        donors: program.donors || []
      };
    });

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