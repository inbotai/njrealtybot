import type { Metadata } from "next";
import MyHomeLogLanding from "@/components/MyHomeLogLanding";

export const metadata: Metadata = {
  title: "MyHome Log — Track Your Home's Value, Taxes & Improvements | Garden State AI",
  description:
    "Free digital vault for NJ homeowners. Track every valuation, tax analysis, renovation, and market insight. Auto-saves when you use any tool. Your home's story, in one place.",
  keywords: [
    "home value tracker NJ", "home equity report", "MyHome Log",
    "NJ home value", "property improvement tracker", "seller disclosure NJ",
  ],
  openGraph: {
    title: "MyHome Log — Everything About Your Home, In One Place | Garden State AI",
    description: "Free: track valuations, tax analyses, renovations, and market data. Auto-saves. Monthly digest. Seller-ready when you need it.",
    url: "https://gardenstate.ai/my-home",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyHome Log | Garden State AI",
    description: "Free digital vault for NJ homeowners. Track every improvement, valuation, and tax analysis.",
  },
  alternates: { canonical: "https://gardenstate.ai/my-home" },
};

export default function MyHomePage() {
  return <MyHomeLogLanding />;
}
