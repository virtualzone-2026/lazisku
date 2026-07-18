// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>; // 🚀 TERPASANG: Menangkap parameter ?ref= dari tautan penyebaran fundraiser
}

// 🚀 PROTEKSI 1: Mengunci batas revalidasi halaman detail selama 60 detik di level server Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 60;

// ===================================================================
// 🚀 DYNAMIC METADATA: Menembak Thumbnail & Deskripsi Unik Program ke Medsos
// ===================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazisku.com';
  const fallbackImage = `${siteUrl}/images/banner-utama.png`;
  
  let campaignTitle = 'Program Donasi Amanah | LAZIS Khoiro Ummah';
  let campaignDesc = ''; 
  let imageUrl = fallbackImage;

  try {
    // 🚀 PROTEKSI 2: Menghapus query string dinamis Date.now() & menyematkan cache-revalidate 60 detik
    const res = await fetch(`${siteUrl}/api/programs`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    
    if (json.success && json.data) {
      const found = json.data.find((p: any) => p.slug === slug);
      if (found) {
        if (found.title) campaignTitle = found.title;
        
        // ===================================================================
        // 🚀 LOGIC PARSING: EKSTRAKSI DESKRIPSI AMAN
        // ===================================================================
        if (found.description) {
          if (typeof found.description === 'string') {
            campaignDesc = found.description.slice(0, 150) + '...';
          } 
          else if (Array.isArray(found.description)) {
            const plainText = found.description
              .filter((block: any) => block._type === 'block' && block.children)
              .map((block: any) => block.children.map((child: any) => child.text).join(''))
              .join(' ');
            
            campaignDesc = plainText ? plainText.slice(0, 150) + '...' : '';
          }
        }

        if (!campaignDesc) {
          campaignDesc = `Mari bantu program "${campaignTitle}" bersama LAZIS Khoiro Ummah. Salurkan kepedulian Anda secara transparan via QRIS & VA.`;
        }

        const rawImage = found.image;
        if (rawImage && typeof rawImage === 'string') {
          imageUrl = rawImage.startsWith('http') ? rawImage : `${siteUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
        }
      }
    }
  } catch (error) {
    console.error('🔥 Fetch campaign metadata failed:', error);
    campaignDesc = 'Salurkan infak, sedekah, dan zakat Anda secara instan and amanah melalui lazisku.com.';
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
      url: `${siteUrl}/campaign/${slug}`,
      siteName: 'LAZIS Khoiro Ummah',
      locale: 'id_ID',
      type: 'website',
      images: [
        {
          url: imageUrl,
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
export default async function CampaignPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ref } = await searchParams; // Menyelesaikan pembacaan query secara asinkronus (Next.js 15+)

  // 🚀 AKSI: Melempar slug dan tracking referral kode WhatsApp relawan ke antarmuka client untuk form donasi
  return <CampaignDetailClient slug={slug} referral={ref || null} />;
}