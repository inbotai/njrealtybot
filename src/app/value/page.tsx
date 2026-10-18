import type { Metadata } from "next";
import { Suspense } from "react";
import ValuePageClient from "@/components/ValuePageClient";

export const metadata: Metadata = {
  title: "What's My Home Worth? | Free Instant Home Valuation | Garden State AI",
  description:
    "Find out what your home is worth in 30 seconds. Get your free Sell Score and AI-powered home valuation for any property in New Jersey.",
  keywords: [
    "what is my house worth", "home value NJ", "free home valuation",
    "sell score", "should I sell my house", "home value calculator NJ",
    "CMA report free", "home appraisal NJ", "property value NJ",
  ],
  openGraph: {
    title: "What's My Home Worth? | Garden State AI",
    description: "Free instant home valuation + Sell Score for any property in New Jersey. Find out in 30 seconds.",
    type: "website",
    url: "https://gardenstate.ai/value",
  },
};

export default function ValuePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    }>
      <ValuePageClient />
    </Suspense>
  );
}
