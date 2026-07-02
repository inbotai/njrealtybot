import type { Metadata } from "next";
import BenefitsChecker from "@/components/BenefitsChecker";

export const metadata: Metadata = {
  title: "NJ Property Tax Relief Checker — ANCHOR, Senior Freeze, StayNJ | Garden State AI",
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
  return <BenefitsChecker />;
}
