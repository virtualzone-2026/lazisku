// app/api/campaign/[slug]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

const client = createClient({
  projectId: '61d8vnuq',
  dataset: 'production',
  useCdn: false, // Wajib false agar data langsung ditarik real-time
  apiVersion: '2024-01-01',
  token: 'sk44JM4AlD6urcLa9Ak9vvnRpLGlsRai9aftW1wPA4w9zxwhrCpKREk2ArKU25K4kENIPxVXenu4kZhm2cOSaxGP69kz8az2qM2BZDIVzqyAGLjIvVTGKMu39CExUrKwbw2wCb2bfxKPgZ4lqEt2nwLZT4HEc4XT1qfrZ0i6KYupIlT6IOlP',
});

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // 🚀 FIXED: Menarik semua kemungkinan nama field gambar di Sanity Studio kamu
    const query = `*[(_type == "program" || _type == "campaign") && slug.current == $slug][0] {
      title,
      description,
      "mainImageUrl": mainImage.asset->url,
      "imageUrl": image.asset->url,
      "thumbnailUrl": thumbnail.asset->url,
      "bannerUrl": banner.asset->url
    }`;

    const data = await client.fetch(query, { slug });

    if (!data) {
      return NextResponse.json({ success: false, message: 'Campaign tidak ditemukan' }, { status: 404 });
    }

    // 🚀 MASTER LOGIC: Pilih gambar mana pun yang tersedia dari database Sanity kamu
    const finalImageUrl = data.mainImageUrl || data.imageUrl || data.thumbnailUrl || data.bannerUrl || null;

    return NextResponse.json({ 
      success: true, 
      data: {
        title: data.title,
        description: data.description,
        imageUrl: finalImageUrl // Mengembalikan string URL gambar murni yang valid
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}