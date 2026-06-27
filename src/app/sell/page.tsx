import type { Metadata } from "next";
import SellPageClient from "@/components/SellPageClient";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: { absolute: "Free NJ Home Valuation \u2014 What's My House Worth? | Garden State AI" },
  description:
    "Get an instant AI home valuation for your New Jersey property. Uses live MLS data, NJ MOD-IV records, and Zestimate to give you the most accurate estimate in 30 seconds.",
  keywords: [
    "home valuation NJ",
    "what is my home worth New Jersey",
    "NJ AVM tool",
    "free home value estimate NJ",
    "sell my house New Jersey",
    "NJ property value",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/sell",
  },
  openGraph: {
    type: "website",
    title: "Free NJ Home Valuation \u2014 What's My House Worth? | Garden State AI",
    description:
      "Get an instant AI home valuation for your New Jersey property. Uses live MLS data, NJ MOD-IV records, and Zestimate to give you the most accurate estimate in 30 seconds.",
    url: "https://gardenstate.ai/sell",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free NJ Home Valuation \u2014 What's My House Worth? | Garden State AI",
    description:
      "Get an instant AI home valuation for your New Jersey property. Uses live MLS data, NJ MOD-IV records, and Zestimate to give you the most accurate estimate in 30 seconds.",
  },
};

export default function SellPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "NJ Home Valuation Tool",
        "description": "Free AI-powered instant home valuation for NJ properties using MLS, MOD-IV, and Zestimate data.",
        "url": "https://gardenstate.ai/sell",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      }) }} />
      <SellPageClient />
      <div className="mx-auto max-w-2xl px-4 pb-8">
        <NewsletterSignup />
      </div>
    </>
  );
}
