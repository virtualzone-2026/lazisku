// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';
import { createClient } from '@sanity/client';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>; // 🚀 Menangkap parameter ?ref= dari tautan penyebaran fundraiser
}

// 🚀 PROTEKSI SERVER: Mengunci mode dynamic rendering untuk menangkap query string secara instan
export const dynamic = 'force-dynamic';

// Inisialisasi client minimal khusus baca metadata (Gunakan CDN agar super cepat & hemat kuota)
const metadataClient = createClient({
  projectId: '61d8vnuq',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

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
    // 🚀 EFISIENSI TINGGI: Langsung tembak spesifik 1 program berdasarkan slug via Sanity CDN
    const query = `*[_type == "program" && slug.current == $slug][0] {
      title,
      description,
      "imageUrl": mainImage.asset->url
    }`;
    
    const found = await metadataClient.fetch(query, { slug });
    
    if (found) {
      if (found.title) campaignTitle = found.title;
      
      // ===================================================================
      // 🚀 LOGIC PARSING: EKSTRAKSI DESKRIPSI AMAN (Mendukung Plain Text & Block Content)
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

      // Pastikan URL gambar menggunakan CDN Sanity langsung agar ter-render sempurna di medsos
      if (found.imageUrl) {
        imageUrl = found.imageUrl;
      }
    }
  } catch (error) {
    console.error('🔥 Fetch campaign metadata failed:', error);
    campaignDesc = 'Salurkan infak, sedekah, dan zakat Anda secara instan dan amanah melalui lazisku.com.';
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
      type: 'article', // Menggunakan tipe article agar lebih kaya info di WhatsApp/FB
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
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
// 🖥️ SERVER COMPONENT ENTRY (Next.js 15+ App Router)
// ===================================================================
export default async function CampaignPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ref } = await searchParams; // Menyelesaikan pembacaan query secara asinkronus

  // 🚀 AKSI: Mengalirkan slug dan tracking kode referral relawan ke sisi client
  return <CampaignDetailClient slug={slug} referral={ref || null} />;
}