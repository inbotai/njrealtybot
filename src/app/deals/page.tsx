import type { Metadata } from "next";
import DealsPageClient from "@/components/DealsPageClient";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: { absolute: "NJ Investment Properties & Rental ROI Deals | Garden State AI" },
  description:
    "AI-identified investment opportunities in New Jersey. Properties likely to drop in price, rentals with strong ROI, and undervalued listings.",
  keywords: [
    "NJ investment properties",
    "New Jersey rental property ROI",
    "undervalued homes NJ",
    "real estate investment New Jersey",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/deals",
  },
  openGraph: {
    type: "website",
    title: "NJ Investment Properties & Rental ROI Deals | Garden State AI",
    description:
      "AI-identified investment opportunities in New Jersey. Properties likely to drop in price, rentals with strong ROI, and undervalued listings.",
    url: "https://gardenstate.ai/deals",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Investment Properties & Rental ROI Deals | Garden State AI",
    description:
      "AI-identified investment opportunities in New Jersey. Properties likely to drop in price, rentals with strong ROI, and undervalued listings.",
  },
};

export default function DealsPage() {
  return <RequireAuth><DealsPageClient /></RequireAuth>;
}
