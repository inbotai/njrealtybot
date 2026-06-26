import type { Metadata } from "next";
import ListingOnboardingWizard from "@/components/ListingOnboardingWizard";

export const metadata: Metadata = {
  title: { absolute: "List Your NJ Home — Digital Onboarding | Garden State AI" },
  description:
    "List your New Jersey home 100% digitally. AI-powered pricing, digital document signing, and licensed agent oversight. Start in 5 minutes.",
  keywords: [
    "list home NJ",
    "sell house New Jersey",
    "NJ listing agent",
    "digital home listing",
    "Garden State AI listing",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/list",
  },
  openGraph: {
    type: "website",
    title: "List Your NJ Home — Digital Onboarding | Garden State AI",
    description:
      "List your New Jersey home 100% digitally. AI-powered pricing, digital document signing, and licensed agent oversight.",
    url: "https://gardenstate.ai/list",
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your NJ Home — Digital Onboarding | Garden State AI",
    description:
      "List your New Jersey home 100% digitally. AI-powered pricing, digital document signing, and licensed agent oversight.",
  },
};

export default function ListPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ListingOnboardingWizard />
    </div>
  );
}
