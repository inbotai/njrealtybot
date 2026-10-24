import type { Metadata } from "next";
import { Suspense } from "react";
import ValuePageClient from "@/components/ValuePageClient";
import JsonLd, { breadcrumbList, faqPageSchema, webApplicationSchema } from "@/components/JsonLd";
import { pageCanonical } from "@/lib/seo";

const valueFaqs = [
  { question: "How fast is a Garden State AI home valuation?", answer: "Enter an address and the valuation report loads from comparable sales and public records, usually within a minute." },
  { question: "Is the home valuation free?", answer: "Yes. The instant home valuation and Sell Score are free for New Jersey properties." },
];

export const metadata: Metadata = {
  alternates: pageCanonical("/value"),
  title: "What's My Home Worth? | Free Instant Home Valuation",
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
    <>
    <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Home Valuation", path: "/value" }])} />
    <JsonLd data={webApplicationSchema({ name: "NJ Home Valuation", path: "/value", description: "Free instant home valuation and Sell Score for New Jersey properties." })} />
    <JsonLd data={faqPageSchema(valueFaqs)} />
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    }>
      <ValuePageClient />
    </Suspense>
    </>
  );
}
