import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ValeProvider from "@/components/ValeProvider";
import { AdminProvider } from "@/components/AdminAuth";
import SiteShell from "@/components/SiteShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://gardenstate.ai"),
  title: {
    default: "Garden State AI \u2014 Home Value, Property Tax & Selling Intelligence for NJ Homeowners",
    template: "%s | Garden State AI",
  },
  description:
    "Enter your address \u2014 get your home's value, your property-tax verdict, and your best time to sell. Free, in 30 seconds. Powered by real MLS, tax, and municipal data.",
  keywords: [
    "New Jersey real estate AI",
    "NJ property tax appeal",
    "home valuation NJ",
    "buy sell homes NJ",
    "Garden State real estate",
    "Vale AI assistant NJ",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Garden State AI",
    title: "Garden State AI \u2014 Home Value, Property Tax & Selling Intelligence for NJ Homeowners",
    description:
      "Enter your address \u2014 get your home's value, your property-tax verdict, and your best time to sell. Free, in 30 seconds. Powered by real MLS, tax, and municipal data.",
    url: "https://gardenstate.ai",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Garden State AI — NJ Real Estate, Property Tax Appeal, Home Valuation and AI Search" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garden State AI \u2014 Home Value, Property Tax & Selling Intelligence for NJ Homeowners",
    description:
      "Enter your address \u2014 get your home's value, your property-tax verdict, and your best time to sell. Free, in 30 seconds. Powered by real MLS, tax, and municipal data.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
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
      <body className="flex min-h-full flex-col bg-white text-gray-900">
        <AdminProvider>
          <ValeProvider>
            <SiteShell>{children}</SiteShell>
          </ValeProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
