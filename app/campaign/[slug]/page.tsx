import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';
import { createClient } from '@sanity/client';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>; // Tetap dipertahankan untuk kebutuhan Server Component Entry
}

// 🚀 PROTEKSI SERVER: Mengunci mode dynamic rendering untuk menangkap data secara instan
export const dynamic = 'force-dynamic';

// Inisialisasi client minimal khusus baca metadata (Gunakan CDN agar super cepat & hemat kuota)
const metadataClient = createClient({
  projectId: '61d8vnuq',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

// ===================================================================
// 🚀 DYNAMIC METADATA: Disamakan Persis dengan Model Struktur Blog (Super Stabil)
// ===================================================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Hanya mengekstrak slug secara asinkronus agar sinkronisasi bot media sosial tidak terganggu
  const { slug } = await params;
  
  // Pastikan domain utama mendukung format WWW agar sinkron dengan metadata share medsos
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lazisku.com';
  if (!siteUrl.includes('www.')) {
    siteUrl = siteUrl.replace('https://', 'https://www.');
  }
  
  const fallbackImage = `${siteUrl}/images/banner-utama.png`;
  
  let campaignTitle = 'Program Donasi Amanah | LAZIS Khoiro Ummah';
  let campaignDesc = 'Salurkan infak, sedekah, dan zakat Anda secara instan dan amanah melalui lazisku.com.'; 
  let imageUrl = fallbackImage;

  try {
    const query = `*[_type == "program" && slug.current == $slug][0] {
      title,
      description,
      "imageUrl": mainImage.asset->url
    }`;
    
    const found = await metadataClient.fetch(query, { slug });
    
    if (found) {
      if (found.title) campaignTitle = found.title;
      
      // LOGIC PARSING DESKRIPSI
      if (found.description) {
        if (typeof found.description === 'string') {
          campaignDesc = found.description.slice(0, 140) + '...';
        } else if (Array.isArray(found.description)) {
          const plainText = found.description
            .filter((block: any) => block._type === 'block' && block.children)
            .map((block: any) => block.children.map((child: any) => child.text).join(''))
            .join(' ');
          if (plainText) campaignDesc = plainText.slice(0, 140) + '...';
        }
      }

      // 🚀 PROXY IMAGE: Mengirimkan gambar lewat domain internal agar diloloskan WhatsApp secara mutlak
      if (found.imageUrl) {
        const cleanSanityUrl = `${found.imageUrl}?format=jpg&w=1200&h=630&fit=crop`;
        imageUrl = `${siteUrl}/api/og-image?url=${encodeURIComponent(cleanSanityUrl)}`;
      }
    }
  } catch (error) {
    console.error('🔥 Fetch campaign metadata failed:', error);
  }

  return {
    title: campaignTitle,
    description: campaignDesc,
    alternates: {
      // 🚀 FIXED: Bersihkan canonical dari query string (?ref=) agar identik dengan alur halaman blog
      canonical: `${siteUrl}/campaign/${slug}`,
    },
    openGraph: {
      title: campaignTitle,
      description: campaignDesc,
      url: `${siteUrl}/campaign/${slug}`,
      siteName: 'LAZIS Khoiro Ummah',
      locale: 'id_ID',
      type: 'website', // Menggunakan website tipe agar penanganan cache gambar di WhatsApp lebih fleksibel
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
  const { ref } = await searchParams; // Tetap menangkap ref di sini secara runtime untuk dialirkan ke client side

  // 🚀 AKSI UTAMA: Mengalirkan slug dan nomor WA fundraiser (ref) ke Client Component untuk pelacakan transaksi
  return <CampaignDetailClient slug={slug} referral={ref || null} />;
}