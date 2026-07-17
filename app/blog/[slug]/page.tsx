// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import BlogDetailClient from '@/components/BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// ===================================================================
// 🚀 SERVER-SIDE SEO: Menembak Data Thumbnail Dinamis ke WhatsApp/Medsos
// ===================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Mengambil data spesifik berita langsung dari endpoint internal
    const res = await fetch(`https://lazisku.com/api/news/${slug}`, {
      cache: 'no-store' // Wajib no-store agar data real-time dari Sanity
    });
    const json = await res.json();
    const article = json?.data?.article;

    if (!article) {
      return { title: 'Artikel Tidak Ditemukan | LAZIS Khoiro Ummah' };
    }

    // Menggunakan URL gambar artikel dari Sanity, jika kosong fallback ke banner utama
    const imageUrl = article.imageUrl || 'https://lazisku.com/images/banner-utama.png';

    return {
      title: article.title,
      description: article.excerpt || `Baca kabar berita terbaru dari LAZIS Khoiro Ummah mengenai ${article.title}.`,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: article.title,
        description: article.excerpt || 'Laporan transparansi penyaluran donasi terverifikasi di lazisku.com.',
        url: `https://lazisku.com/blog/${slug}`,
        siteName: 'LAZIS Khoiro Ummah',
        locale: 'id_ID',
        type: 'article',
        images: [
          {
            url: imageUrl, // 🔗 URL Gambar Absolut yang dibaca oleh bot WhatsApp
            width: 1200,
            height: 630,
            type: 'image/png',
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return { title: 'Kabar Berita | LAZIS Khoiro Ummah' };
  }
}

// ===================================================================
// 🖥️ SERVER COMPONENT UTAMA
// ===================================================================
export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  
  // Mengirim slug ke komponen Client untuk memproses UI rounded-none
  return <BlogDetailClient slug={slug} />;
}