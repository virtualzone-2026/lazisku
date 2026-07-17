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
  let articleExcerpt = ''; // Mulai dengan string kosong agar logika dinamis berjalan

  try {
    const res = await fetch(`https://lazisku.com/api/news/${slug}`, {
      cache: 'no-store'
    });
    const json = await res.json();
    const article = json?.data?.article;

    if (article) {
      if (article.title) articleTitle = article.title;

      // ===================================================================
      // 🚀 MASTER LOGIC: GENERATE CUPLIKAN DINAMIS DARI ISI ARTIKEL ASLI
      // ===================================================================
      if (article.excerpt && typeof article.excerpt === 'string') {
        articleExcerpt = article.excerpt;
      } else if (article.content) {
        // Kasus A: Jika content dikembalikan sebagai text/string biasa
        if (typeof article.content === 'string') {
          articleExcerpt = article.content.slice(0, 150) + '...';
        } 
        // Kasus B: Jika content dikembalikan sebagai array block PortableText dari Sanity
        else if (Array.isArray(article.content)) {
          const plainText = article.content
            .filter((block: any) => block._type === 'block' && block.children)
            .map((block: any) => block.children.map((child: any) => child.text).join(''))
            .join(' ');
          
          articleExcerpt = plainText ? plainText.slice(0, 150) + '...' : '';
        }
      }

      // Fallback cadangan yang aman jika artikel benar-benar tidak memiliki tulisan/konten
      if (!articleExcerpt) {
        articleExcerpt = `Baca kabar berita lengkap mengenai "${articleTitle}" secara resmi di platform LAZIS Khoiro Ummah.`;
      }

      // 🚀 DETEKSI AKURAT GAMBAR: Antisipasi perbedaan nama properti dari API
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
    articleExcerpt = 'Salurkan sedekah dan zakat Anda secara amanah melalui LAZIS Khoiro Ummah.';
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
          url: imageUrl, 
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