import type { Metadata } from "next";
import BenefitsChecker from "@/components/BenefitsChecker";
import JsonLd, { breadcrumbList, faqPageSchema, webApplicationSchema } from "@/components/JsonLd";

const benefitFaqs = [
  { question: "Which NJ property tax relief programs does this check?", answer: "The checker covers ANCHOR, Senior Freeze, StayNJ, and veteran deductions so you can see which programs you may qualify for." },
  { question: "Does the relief check file the application for me?", answer: "It tells you what you may be owed and the next step. Filing still goes through the official state program." },
];

export const metadata: Metadata = {
  title: "NJ Property Tax Relief Checker — ANCHOR, Senior Freeze, StayNJ",
  description:
    "Check all your NJ property tax relief programs in 60 seconds. ANCHOR, Senior Freeze, StayNJ, veteran deductions — see what you're owed. Free.",
  keywords: [
    "NJ property tax relief", "ANCHOR NJ", "Senior Freeze NJ", "StayNJ",
    "NJ tax relief checker", "property tax benefits NJ", "PAS-1 application",
  ],
  openGraph: {
    title: "NJ Property Tax Relief Checker | Garden State AI",
    description: "ANCHOR, Senior Freeze, StayNJ — check all your programs in 60 seconds. Free.",
    url: "https://gardenstate.ai/benefits",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Property Tax Relief Checker | Garden State AI",
  },
  alternates: { canonical: "https://gardenstate.ai/benefits" },
};

export default function BenefitsPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Tax Relief", path: "/benefits" }])} />
      <JsonLd data={webApplicationSchema({ name: "NJ Property Tax Relief Checker", path: "/benefits", description: "Check ANCHOR, Senior Freeze, StayNJ, and veteran property tax relief." })} />
      <JsonLd data={faqPageSchema(benefitFaqs)} />
      <BenefitsChecker />
    </>
  );
}
