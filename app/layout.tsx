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

// 🚀 MASTER SEO METADATA (Google & Medsos Ready 2026)
export const metadata: Metadata = {
  title: {
    default: "Indonesia Mengaji - Budayakan Mengaji Wujudkan Generasi Qur'ani",
    template: "%s | Indonesia Mengaji"
  },
  description: "Platform galang donasi Al-Quran, wakaf Quran, sedekah penghafal Quran, infak santri, serta aksi peduli yatim dhuafa amanah bersama Indonesia Mengaji Foundation.",
  keywords: [
    "galang donasi quran", 
    "wakaf quran indonesia", 
    "sedekah penghafal quran", 
    "sedekah santri mengaji", 
    "peduli yatim dhuafa", 
    "indonesia mengaji", 
    "banyumas mengaji"
  ],
  authors: [{ name: "Indonesia Mengaji Foundation" }],
  metadataBase: new URL("https://indonesiamengaji.net"),
  alternates: {
    canonical: "/",
  },
  // Open Graph / Facebook / WhatsApp / Telegram Card
  openGraph: {
    title: "Indonesia Mengaji - Budayakan Mengaji Wujudkan Generasi Qur'ani",
    description: "Salurkan wakaf Quran, sedekah penghafal Quran, dan infak yatim dhuafa secara praktis dan otomatis via QRIS bersama Indonesia Mengaji.",
    url: "https://indonesiamengaji.net",
    siteName: "Indonesia Mengaji",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/indonesiamengaji.jpeg",
        width: 1200,
        height: 630,
        alt: "Indonesia Mengaji Foundation - Budayakan Mengaji Wujudkan Generasi Qur'ani",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Indonesia Mengaji - Budayakan Mengaji Wujudkan Generasi Qur'ani",
    description: "Platform galang donasi Al-Quran, wakaf Quran, dan sedekah penghafal Quran amanah.",
    images: ["/images/mengaji.jpeg"],
  },
  // Kebijakan Bot Google Indexing
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