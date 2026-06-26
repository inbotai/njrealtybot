import type { Metadata } from "next";
import OfferAnalyzer from "@/components/OfferAnalyzer";

export const metadata: Metadata = {
  title: { absolute: "AI Offer Analysis & Negotiation Strategy | Garden State AI" },
  description:
    "Compare multiple offers, get AI-scored rankings, and generate counter-strategies backed by real NJ market data. Licensed agent oversight on every deal.",
  keywords: [
    "NJ offer analysis tool",
    "compare real estate offers NJ",
    "counter offer strategy NJ",
    "AI real estate negotiation",
    "seller offer comparison",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/offers",
  },
  openGraph: {
    type: "website",
    title: "AI Offer Analysis & Negotiation Strategy | Garden State AI",
    description:
      "Compare multiple offers, get AI-scored rankings, and generate counter-strategies backed by real NJ market data. Licensed agent oversight on every deal.",
    url: "https://gardenstate.ai/offers",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Offer Analysis & Negotiation Strategy | Garden State AI",
    description:
      "Compare multiple offers, get AI-scored rankings, and generate counter-strategies backed by real NJ market data. Licensed agent oversight on every deal.",
  },
};

export default function OffersPage() {
  return <OfferAnalyzer />;
}
