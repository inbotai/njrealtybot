import type { Metadata } from "next";
import { Suspense } from "react";
import PropertyTaxAppeal from "@/components/PropertyTaxAppeal";
import TownTaxDirectory from "@/components/TownTaxDirectory";
import JsonLd, { breadcrumbList, faqPageSchema, webApplicationSchema } from "@/components/JsonLd";
import { pageCanonical } from "@/lib/seo";

const faqs = [
  {
    question: "How do I know if I'm overpaying property taxes in New Jersey?",
    answer: "Enter your address. Garden State AI compares your assessment with recent comparable sales and the county common level range under Chapter 123.",
  },
  {
    question: "What is a Chapter 123 tax appeal?",
    answer: "Chapter 123 is the New Jersey rule that compares your property's assessment ratio with the county common level range. If your ratio is above that range, you may have grounds to appeal.",
  },
  {
    question: "Where are the official town tax rates?",
    answer: "Each of the 564 New Jersey municipalities has a page with the 2025 general tax rate, effective tax rate, and example bills from the NJ Division of Taxation.",
  },
];

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
  alternates: pageCanonical("/property-tax"),
  openGraph: {
    title: "Are You Overpaying in Property Taxes?",
    description:
      "Free NJ Chapter 123 analysis with real comparable sales. See your estimated overpayment instantly.",
    url: "https://gardenstate.ai/property-tax",
  },
  robots: { index: true, follow: true },
};

export default function PropertyTaxPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Property Tax", path: "/property-tax" },
      ])} />
      <JsonLd data={webApplicationSchema({
        name: "NJ Property Tax Appeal Check",
        path: "/property-tax",
        description: "Free Chapter 123 property tax overpayment analysis for New Jersey homeowners.",
      })} />
      <JsonLd data={faqPageSchema(faqs)} />
      <Suspense fallback={null}>
        <PropertyTaxAppeal />
      </Suspense>
      <TownTaxDirectory />
    </>
  );
}
