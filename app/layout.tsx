// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 MASTER SEO METADATA (Google, Bing, & Social Media Ready 2026)
// Dioptimalkan penuh untuk LAZIS Khoiro Ummah - Lazisku.com
export const metadata: Metadata = {
  title: {
    default: "LAZIS Khoiro Ummah | Platform Sedekah, Infaq & Zakat Online Amanah",
    template: "%s | LAZIS Khoiro Ummah"
  },
  description: "Salurkan sedekah, infaq, zakat, dan wakaf Anda secara instan dan amanah melalui LAZIS Khoiro Ummah (lazisku.com). Mengalirkan keberkahan dan kepedulian untuk pemberdayaan ummat, yatim, dhuafa, dan program sosial kemanusiaan.",
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
    "donasi qris instant"
  ],
  authors: [{ name: "LAZIS Khoiro Ummah", url: "https://lazisku.com" }],
  creator: "LAZIS Khoiro Ummah",
  publisher: "LAZIS Khoiro Ummah",
  metadataBase: new URL("https://lazisku.com"),
  alternates: {
    canonical: "/",
  },
  // Open Graph / Facebook / WhatsApp / Telegram Card Preview
  openGraph: {
    title: "LAZIS Khoiro Ummah | Platform Sedekah, Infaq & Zakat Online Amanah",
    description: "Tunaikan kepedulian Anda dengan mudah. Salurkan sedekah subuh, infaq produktif, dan zakat mal/fitrah secara transparan dan otomatis via QRIS & VA bersama lazisku.com.",
    url: "https://lazisku.com",
    siteName: "LAZIS Khoiro Ummah",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo-lazisku.png", // Mengarah langsung ke file logo LAZISKU utama Anda
        width: 1200,
        height: 630,
        alt: "LAZIS Khoiro Ummah - Mengalirkan Keberkahan Melalui Sedekah dan Infaq",
      },
    ],
  },
  // Twitter / X Card Preview
  twitter: {
    card: "summary_large_image",
    title: "LAZIS Khoiro Ummah | Sedekah & Infaq Online Mudah",
    description: "Platform resmi galang donasi, sedekah, infaq, dan zakat amanah bersama LAZIS Khoiro Ummah.",
    images: ["/logo-lazisku.png"],
  },
  // Kebijakan Ketat Bot Google Indexing (Memaksa Google Merayapi Semua Halaman Secara Maksimal)
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-50 flex flex-col text-gray-800" suppressHydrationWarning>
        
        {/* 🚀 JURUS SAKTI: Memindahkan semua logika 'use client' ke Wrapper Komponen */}
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>

      </body>
    </html>
  );
}