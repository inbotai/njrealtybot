import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavbarIdx from "@/components/NavbarIdx";
import Footer from "@/components/Footer";
import FooterIdx from "@/components/FooterIdx";
import ValeProvider from "@/components/ValeProvider";
import ValeSidePanel from "@/components/ValeSidePanel";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { AdminProvider } from "@/components/AdminAuth";
import TrackingPixels from "@/components/TrackingPixels";
import ExitIntent from "@/components/ExitIntent";
import ProactiveVale from "@/components/ProactiveVale";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "Garden State AI | The Most Advanced Real Estate AI in NJ",
    template: "%s | Garden State AI",
  },
  description:
    "Search 50,000+ homes for sale in New Jersey. AI-powered real estate search with instant market analysis, price predictions, and Vale — your 24/7 AI real estate partner.",
  keywords: [
    "New Jersey homes for sale",
    "NJ real estate",
    "AI real estate",
    "Garden State AI",
    "AI property search NJ",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Garden State AI",
    title: "Garden State AI | The Most Advanced Real Estate AI in NJ",
    description:
      "Search 50,000+ homes for sale in New Jersey. AI-powered search with Vale, your 24/7 real estate AI partner.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garden State AI | The Most Advanced Real Estate AI in NJ",
    description:
      "Search 50,000+ homes for sale in New Jersey with Vale AI.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const isIdx = hdrs.get("x-idx-subdomain") === "true";

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <AdminProvider>
          <ValeProvider>
            {isIdx ? <NavbarIdx /> : <Navbar />}
            <main className="flex-1">{children}</main>
            {isIdx ? <FooterIdx /> : <Footer />}
            <ValeSidePanel />
            {!isIdx && <WhatsAppWidget />}
            <ExitIntent />
            <ProactiveVale />
            <TrackingPixels />
          </ValeProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
