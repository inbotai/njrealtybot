import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ValeProvider from "@/components/ValeProvider";
import ValeSidePanel from "@/components/ValeSidePanel";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "NJ Realty Bot | The First AI-Powered Real Estate Platform in New Jersey",
    template: "%s | NJ Realty Bot",
  },
  description:
    "Search 50,000+ homes for sale in New Jersey. AI-powered real estate search with instant market analysis, price predictions, and Vale — your 24/7 AI real estate partner.",
  keywords: [
    "New Jersey homes for sale",
    "NJ real estate",
    "AI real estate",
    "NJ Realty Bot",
    "Realty One Group Legend",
    "Julio Reynoso",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NJ Realty Bot",
    title: "NJ Realty Bot | The First AI-Powered Real Estate Platform in New Jersey",
    description:
      "Search 50,000+ homes for sale in New Jersey. AI-powered search with Vale, your 24/7 real estate AI partner.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Realty Bot | AI-Powered Real Estate in NJ",
    description:
      "Search 50,000+ homes for sale in New Jersey with Vale AI.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <ValeProvider>
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto">{children}</main>
            <ValeSidePanel />
          </div>
          <Footer />
        </ValeProvider>
      </body>
    </html>
  );
}
