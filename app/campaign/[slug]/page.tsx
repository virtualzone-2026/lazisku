// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// ===================================================================
// 🚀 DYNAMIC METADATA: Menembak Thumbnail Unik Program ke WhatsApp/Medsos
// ===================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fallbackImage = 'https://lazisku.com/images/banner-utama.png';
  
  let campaignTitle = 'Program Donasi Amanah | LAZIS Khoiro Ummah';
  let campaignDesc = 'Salurkan infak, sedekah, dan zakat Anda secara instan dan amanah melalui lazisku.com.';
  let imageUrl = fallbackImage;

  try {
    // Memanggil API internal program donasi Anda
    const res = await fetch(`https://lazisku.com/api/programs?v=${Date.now()}`, {
      cache: 'no-store',
    });
    const json = await res.json();
    
    if (json.success && json.data) {
      const found = json.data.find((p: any) => p.slug === slug);
      if (found) {
        if (found.title) campaignTitle = found.title;
        
        // Buat deskripsi ringkas dari text murni atau fallback
        if (found.description && typeof found.description === 'string') {
          campaignDesc = found.description.slice(0, 160);
        } else {
          campaignDesc = `Mari bantu program "${found.title}" bersama LAZIS Khoiro Ummah. Salurkan kepedulian Anda secara transparan via QRIS & VA.`;
        }

        // Ambil properti gambar utama program dari backend/Sanity Anda
        const rawImage = found.image;
        if (rawImage && typeof rawImage === 'string') {
          imageUrl = rawImage.startsWith('http') ? rawImage : `https://lazisku.com${rawImage}`;
        }
      }
    }
  } catch (error) {
    console.error('Fetch campaign metadata failed:', error);
  }

  return {
    title: campaignTitle,
    description: campaignDesc,
    alternates: {
      canonical: `/campaign/${slug}`,
    },
    openGraph: {
      title: campaignTitle,
      description: campaignDesc,
      url: `https://lazisku.com/campaign/${slug}`,
      siteName: 'LAZIS Khoiro Ummah',
      locale: 'id_ID',
      type: 'website',
      images: [
        {
          url: imageUrl, // 🟢 THUMBNAIL DINAMIS DARI PROGRAM, BUKAN HOMEPAGE
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: campaignTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaignTitle,
      description: campaignDesc,
      images: [imageUrl],
    },
  };
}

// ===================================================================
// 🖥️ SERVER COMPONENT ENTRY
// ===================================================================
export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  
  // Melempar slug ke antarmuka client untuk rendering form & interaksi tab
  return <CampaignDetailClient slug={slug} />;
}