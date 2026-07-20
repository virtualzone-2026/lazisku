// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@sanity/client";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import LiveDonationNotification, { Donation } from "@/components/LiveDonationNotification";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 INITIALIZE SANITY CLIENT (Server-Side Direct Bypass)
const serverClient = createClient({
  projectId: "61d8vnuq",
  dataset: "production",
  useCdn: false, // Wajib false agar data donasi terbaru real-time langsung tertangkap
  apiVersion: "2024-01-01",
  token: "sk44JM4AlD6urcLa9Ak9vvnRpLGlsRai9aftW1wPA4w9zxwhrCpKREk2ArKU25K4kENIPxVXenu4kZhm2cOSaxGP69kz8az2qM2BZDIVzqyAGLjIvVTGKMu39CExUrKwbw2wCb2bfxKPgZ4lqEt2nwLZT4HEc4XT1qfrZ0i6KYupIlT6IOlP",
});

// 🚀 MASTER SEO & PWA METADATA READY
export const metadata: Metadata = {
  title: {
    default: "LAZIS Khoiro Ummah | Platform Sedekah, Infaq & Zakat Online Amanah",
    template: "%s | LAZIS Khoiro Ummah"
  },
  description: "Salurkan sedekah, infaq, zakat, dan wakaf Anda secara instan and amanah melalui LAZIS Khoiro Ummah (lazisku.com). Mengalirkan keberkahan dan kepedulian untuk pemberdayaan ummat, yatim, dhuafa, dan program sosial kemanusiaan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LAZISku",
  },
  keywords: [
    "lazis khoiro ummah",
    "lazisku",
    "lazisku com",
    "sedekah online",
    "infaq online",
    "bayar zakat online",
    "wakaf quran",
    "sedekah subuh",
    "donasi yatim dhuafa",
    "lembaga amil zakat amanah",
    "donasi qris instant",
    "lazis banyumas",
    "khoiro ummah bina umat"
  ],
  authors: [{ name: "LAZIS Khoiro Ummah", url: "https://lazisku.com" }],
  creator: "LAZIS Khoiro Ummah",
  publisher: "LAZIS Khoiro Ummah",
  metadataBase: new URL("https://lazisku.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LAZIS Khoiro Ummah | Platform Sedekah, Infaq & Zakat Online Amanah",
    description: "Tunaikan kepedulian Anda dengan mudah. Salurkan sedekah subuh, infaq produktif, dan zakat mal/fitrah secara transparan dan otomatis via QRIS & Virtual Account bersama lazisku.com.",
    url: "https://lazisku.com",
    siteName: "LAZIS Khoiro Ummah",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://lazisku.com/images/banner.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "LAZIS Khoiro Ummah - Mengalirkan Keberkahan Melalui Sedekah dan Infaq",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LAZIS Khoiro Ummah | Sedekah & Infaq Online Mudah",
    description: "Platform resmi galang donasi, sedekah, infaq, dan zakat amanah bersama LAZIS Khoiro Ummah.",
    images: ["https://lazisku.com/images/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-token-anda",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  let dynamicDonations: Donation[] = [];

  try {
    // 🔥 GROQ QUERY JUJUR: Tarik nama program dari relasi, atau tangkap slug transaksi
    const rawData = await serverClient.fetch(
      `*[_type == "donationTransaction" && status == "success"] | order(_createdAt desc)[0...10] {
        "id": _id,
        "name": donorName,
        "amount": amount,
        "program": coalesce(program->title, campaign->title, programName),
        "slug": slug,
        _createdAt
      }`
    );

    if (rawData && rawData.length > 0) {
      dynamicDonations = rawData.map((item: any) => {
        // Hitung selisih waktu dinamis
        const diffMs = Math.abs(new Date().getTime() - new Date(item._createdAt).getTime());
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        let timeLabel = "baru saja";
        if (diffMins > 0 && diffMins < 60) {
          timeLabel = `${diffMins} menit yang lalu`;
        } else if (diffMins >= 60) {
          timeLabel = `${Math.floor(diffMins / 60)} jam yang lalu`;
        }

        // 🚀 LOGIKA AMBIL PROGRAM ASLI:
        // 1. Pakai judul dari relasi Sanity jika ada.
        // 2. Jika relasi kosong, format dari field slug transaksi (misal: "sedekah-subuh" -> "Sedekah Subuh").
        // 3. Fallback terakhir ke "Sedekah".
        let displayProgram = item.program;

        if (!displayProgram && item.slug) {
          displayProgram = String(item.slug)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char: string) => char.toUpperCase());
        }

        if (!displayProgram) {
          displayProgram = "Sedekah";
        }

        return {
          id: item.id,
          name: item.name || "Hamba Allah",
          amount: new Intl.NumberFormat("id-ID", { 
            style: "currency", 
            currency: "IDR", 
            minimumFractionDigits: 0 
          }).format(item.amount),
          program: displayProgram,
          timeLabel: timeLabel
        };
      });
    }
  } catch (err) {
    console.error("🔥 Gagal mengambil data donasi asli di layout:", err);
  }

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-50 flex flex-col text-gray-800" suppressHydrationWarning>
        
        {/* 🚀 POP-UP NOTIFICATION: Mengoper data asli yang diambil langsung dari server */}
        <LiveDonationNotification donations={dynamicDonations} />

        {/* 🚀 LAYOUT CLIENT WRAPPER */}
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>

      </body>
    </html>
  );
}