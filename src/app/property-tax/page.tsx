import type { Metadata } from "next";
import PropertyTaxAppeal from "@/components/PropertyTaxAppeal";

export const metadata: Metadata = {
  title: "Property Tax Appeal | Are You Overpaying?",
  description:
    "Free NJ property tax overpayment analysis. Find out if you're overpaying, see the comps, and get everything you need to file a Chapter 123 appeal.",
  keywords: [
    "NJ property tax appeal",
    "property tax overpayment NJ",
    "Chapter 123 appeal",
    "New Jersey tax appeal",
    "reduce property taxes NJ",
    "County Board of Taxation appeal",
  ],
  openGraph: {
    title: "Are You Overpaying in Property Taxes? | Garden State AI",
    description:
      "Free NJ Chapter 123 analysis with real comparable sales. See your estimated overpayment instantly.",
  },
  robots: { index: true, follow: true },
};

export default function PropertyTaxPage() {
  return <PropertyTaxAppeal />;
}
