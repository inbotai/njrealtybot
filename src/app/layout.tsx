import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ValeChatWidget from "@/components/ValeChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "NJ Realty Bot | Find Homes for Sale in New Jersey",
    template: "%s | NJ Realty Bot",
  },
  description:
    "Search 50,000+ homes for sale in New Jersey. AI-powered real estate search with instant alerts. Brokered by Realty One Group Legend.",
  keywords: [
    "New Jersey homes for sale",
    "NJ real estate",
    "houses for sale NJ",
    "NJ Realty Bot",
    "Realty One Group Legend",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NJ Realty Bot",
    title: "NJ Realty Bot | Find Homes for Sale in New Jersey",
    description:
      "Search 50,000+ homes for sale in New Jersey. AI-powered real estate search.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Realty Bot | Find Homes for Sale in New Jersey",
    description:
      "Search 50,000+ homes for sale in New Jersey. AI-powered real estate search.",
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ValeChatWidget />
      </body>
    </html>
  );
}
