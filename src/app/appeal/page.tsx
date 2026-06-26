import type { Metadata } from "next";
import AppealWizard from "@/components/AppealWizard";

export const metadata: Metadata = {
  title: { absolute: "NJ Property Tax Appeal \u2014 Generate Form A-1 Automatically | Garden State AI" },
  description:
    "Prepare your New Jersey property tax appeal petition automatically. AI fills Form A-1 with your block/lot, assessment data, and calculates estimated savings.",
  keywords: [
    "NJ property tax appeal Form A-1",
    "how to appeal property tax New Jersey",
    "NJ county tax board petition",
    "file property tax appeal NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/appeal",
  },
  openGraph: {
    type: "website",
    title: "NJ Property Tax Appeal \u2014 Generate Form A-1 Automatically | Garden State AI",
    description:
      "Prepare your New Jersey property tax appeal petition automatically. AI fills Form A-1 with your block/lot, assessment data, and calculates estimated savings.",
    url: "https://gardenstate.ai/appeal",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Property Tax Appeal \u2014 Generate Form A-1 Automatically | Garden State AI",
    description:
      "Prepare your New Jersey property tax appeal petition automatically. AI fills Form A-1 with your block/lot, assessment data, and calculates estimated savings.",
  },
};

export default function AppealPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Form A-1 for NJ property tax appeals?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Form A-1 is the NJ County Tax Board petition form required to file a property tax appeal. Garden State AI's Tax Appeal Assistant automatically fills it out with your property's block, lot, assessment data, and comparable sales."
            }
          },
          {
            "@type": "Question",
            "name": "What is the deadline to appeal property taxes in New Jersey?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The standard NJ property tax appeal deadline is April 1st (or 45 days from the date of the Assessment Notice, whichever is later)."
            }
          }
        ]
      }) }} />
      <AppealWizard />
    </>
  );
}
