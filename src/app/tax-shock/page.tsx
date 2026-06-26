import type { Metadata } from "next";
import { Suspense } from "react";
import TaxShockClient from "@/components/TaxShockClient";

export const metadata: Metadata = {
  title: { absolute: "NJ Property Tax Too High? Free Tax Shock Analysis | Garden State AI" },
  description:
    "Find out in seconds if you're overpaying property taxes in New Jersey. AI compares your assessment to real sales, detects Chapter 123 cases, and estimates your potential savings.",
  keywords: [
    "NJ property tax too high",
    "am I overpaying property tax NJ",
    "Chapter 123 NJ tax",
    "NJ tax assessment vs market value",
    "property tax overassessment NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/tax-shock",
  },
  openGraph: {
    type: "website",
    title: "NJ Property Tax Too High? Free Tax Shock Analysis | Garden State AI",
    description:
      "Find out in seconds if you're overpaying property taxes in New Jersey. AI compares your assessment to real sales, detects Chapter 123 cases, and estimates your potential savings.",
    url: "https://gardenstate.ai/tax-shock",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Property Tax Too High? Free Tax Shock Analysis | Garden State AI",
    description:
      "Find out in seconds if you're overpaying property taxes in New Jersey. AI compares your assessment to real sales, detects Chapter 123 cases, and estimates your potential savings.",
  },
};

export default function TaxShockPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I know if I'm overpaying property taxes in NJ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Enter your address in Garden State AI's Tax Shock tool. It compares your NJ assessment to actual recent sales. If your assessed ratio exceeds the Chapter 123 corridor (15% above county average ratio), you likely have grounds to appeal."
            }
          },
          {
            "@type": "Question",
            "name": "What is Chapter 123 in New Jersey property taxes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Chapter 123 is an NJ law that allows the county tax board to use a 'common level ratio' to determine if your assessment is unfair. If your ratio is outside a 15% corridor of the county average, you may win your appeal automatically."
            }
          },
          {
            "@type": "Question",
            "name": "How much can I save by appealing my NJ property taxes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Savings depend on how overassessed your property is. NJ homeowners who successfully appeal often save $1,000-$5,000+ per year. Garden State AI's Tax Shock tool estimates your specific potential savings."
            }
          }
        ]
      }) }} />
      <Suspense><TaxShockClient /></Suspense>
    </>
  );
}
