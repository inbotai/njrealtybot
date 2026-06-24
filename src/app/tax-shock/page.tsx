import type { Metadata } from "next";
import { Suspense } from "react";
import TaxShockClient from "@/components/TaxShockClient";

export const metadata: Metadata = {
  title: "Are You Overpaying Property Taxes? | Free NJ Tax Analysis",
  description:
    "NJ property taxes are the highest in the US. 68% of homes are over-assessed. Find out if you're overpaying in 30 seconds — free, no obligation.",
  keywords: [
    "NJ property tax appeal", "property tax overpayment", "Jersey City tax increase",
    "reduce property taxes NJ", "property tax calculator NJ", "am I overpaying taxes",
    "NJ tax appeal 2026", "Chapter 123 appeal", "County Board of Taxation",
  ],
  openGraph: {
    title: "Are You Overpaying Property Taxes? | Garden State AI",
    description: "Free instant analysis: see if you're overpaying NJ property taxes and how much you could save.",
    type: "website",
    url: "https://gardenstate.ai/tax-shock",
  },
};

export default function TaxShockPage() {
  return <Suspense><TaxShockClient /></Suspense>;
}
