// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import BlogDetailClient from '@/components/BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // 1. Definisikan fallback gambar utama yang PASTI VALID & RINGAN
  const fallbackImage = 'https://lazisku.com/images/banner-utama.png';
  let imageUrl = fallbackImage;
  let articleTitle = 'Kabar Berita | LAZIS Khoiro Ummah';
  let articleExcerpt = 'Laporan transparansi penyaluran donasi terverifikasi di lazisku.com.';

  try {
    const res = await fetch(`https://lazisku.com/api/news/${slug}`, {
      cache: 'no-store'
    });
    const json = await res.json();
    const article = json?.data?.article;

    if (article) {
      if (article.title) articleTitle = article.title;
      if (article.excerpt) articleExcerpt = article.excerpt;

      // 🚀 DETEKSI AKURAT: Antisipasi jika di API Anda nama propertinya berbeda (imageUrl / image)
      const rawImage = article.imageUrl || article.image;

      if (rawImage && typeof rawImage === 'string') {
        // Jika dari API sudah berupa link absolut CDN Sanity (dimulai http)
        if (rawImage.startsWith('http')) {
          imageUrl = rawImage;
        } else {
          // Jika jalurnya masih relatif, gabungkan dengan domain utama
          imageUrl = `https://lazisku.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
        }
      }
    }
  } catch (error) {
    console.error('Metadata patch error:', error);
  }

  return {
    title: articleTitle,
    description: articleExcerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: articleTitle,
      description: articleExcerpt,
      url: `https://lazisku.com/blog/${slug}`,
      siteName: 'LAZIS Khoiro Ummah',
      locale: 'id_ID',
      type: 'article',
      images: [
        {
          url: imageUrl, // 🟢 Menggunakan URL terverifikasi
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: articleTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: articleTitle,
      description: articleExcerpt,
      images: [imageUrl],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}