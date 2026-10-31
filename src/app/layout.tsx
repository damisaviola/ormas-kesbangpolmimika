import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SI-ORMAS | Badan Kesatuan Bangsa dan Politik Kabupaten Mimika",
  description: "Sistem Informasi & Layanan Registrasi Organisasi Kemasyarakatan (SI-ORMAS) Badan Kesatuan Bangsa dan Politik Kabupaten Mimika - MENO SODAK KANDA",
  keywords: ["Kesbangpol", "Mimika", "ORMAS", "Registrasi Ormas", "Papua Tengah", "Kesbangpol Mimika"],
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: "/assets/pic/meno_adapted.png",
    shortcut: "/assets/pic/meno_adapted.png",
    apple: "/assets/pic/meno_adapted.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${outfit.variable} font-sans h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">{children}</body>
    </html>
  );
}
