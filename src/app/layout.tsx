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
import { Suspense } from "react";
import ActivityTracker from "@/components/ActivityTracker";
import ExitIntent from "@/components/ExitIntent";
import ProactiveVale from "@/components/ProactiveVale";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "Garden State AI \u2014 NJ Real Estate, Property Taxes & AI Tools",
    template: "%s | Garden State AI",
  },
  description:
    "New Jersey's AI real estate platform. Value your home, check if you're overpaying property taxes, generate your appeal, find homes, and ask Vale anything \u2014 free.",
  keywords: [
    "New Jersey real estate AI",
    "NJ property tax appeal",
    "home valuation NJ",
    "buy sell homes NJ",
    "Garden State real estate",
    "Vale AI assistant NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Garden State AI",
    title: "Garden State AI \u2014 NJ Real Estate, Property Taxes & AI Tools",
    description:
      "New Jersey's AI real estate platform. Value your home, check if you're overpaying property taxes, generate your appeal, find homes, and ask Vale anything \u2014 free.",
    url: "https://gardenstate.ai/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garden State AI \u2014 NJ Real Estate, Property Taxes & AI Tools",
    description:
      "New Jersey's AI real estate platform. Value your home, check if you're overpaying property taxes, generate your appeal, find homes, and ask Vale anything \u2014 free.",
  },
  icons: {
    icon: "/icon.svg",
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
            <Suspense><ActivityTracker /></Suspense>
          </ValeProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
