// app/campaign/[slug]/page.tsx
import { Metadata } from 'next';
import CampaignDetailClient from '@/components/CampaignDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// ===================================================================
// 🚀 DYNAMIC METADATA: Menembak Thumbnail & Deskripsi Unik Program ke Medsos
// ===================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fallbackImage = 'https://lazisku.com/images/banner-utama.png';
  
  let campaignTitle = 'Program Donasi Amanah | LAZIS Khoiro Ummah';
  let campaignDesc = ''; // Mulai dengan string kosong agar logika ekstraksi berjalan
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
        
        // ===================================================================
        // 🚀 FIXED LOGIC: PARSING CUPLIKAN DONASI DARI STRING ATAU PORTABLETEXT
        // ===================================================================
        if (found.description) {
          // Kasus A: Jika description berupa text / string murni
          if (typeof found.description === 'string') {
            campaignDesc = found.description.slice(0, 150) + '...';
          } 
          // Kasus B: Jika description berupa array block PortableText dari Sanity
          else if (Array.isArray(found.description)) {
            const plainText = found.description
              .filter((block: any) => block._type === 'block' && block.children)
              .map((block: any) => block.children.map((child: any) => child.text).join(''))
              .join(' ');
            
            campaignDesc = plainText ? plainText.slice(0, 150) + '...' : '';
          }
        }

        // Fallback cadangan jika deskripsi program kosong dari CMS Studio
        if (!campaignDesc) {
          campaignDesc = `Mari bantu program "${campaignTitle}" bersama LAZIS Khoiro Ummah. Salurkan kepedulian Anda secara transparan via QRIS & VA.`;
        }

        // Ambil properti gambar utama program dari backend/Sanity Anda
        const rawImage = found.image;
        if (rawImage && typeof rawImage === 'string') {
          imageUrl = rawImage.startsWith('http') ? rawImage : `https://lazisku.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
        }
      }
    }
  } catch (error) {
    console.error('Fetch campaign metadata failed:', error);
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
      url: `https://lazisku.com/campaign/${slug}`,
      siteName: 'LAZIS Khoiro Ummah',
      locale: 'id_ID',
      type: 'website',
      images: [
        {
          url: imageUrl, // 🟢 THUMBNAIL DINAMIS DARI PROGRAM
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