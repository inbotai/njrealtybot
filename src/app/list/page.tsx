import type { Metadata } from "next";
import ListingOnboardingWizard from "@/components/ListingOnboardingWizard";
import ValeHelper from "@/components/ValeHelper";
import SocialProofSlot from "@/components/SocialProofSlot";

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
    <>
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 max-w-3xl">
          <ListingOnboardingWizard />
        </div>
        <div className="lg:w-80 shrink-0">
          <ValeHelper
            context="listing"
            title="Questions about listing?"
            placeholder="Ask Vale anything about selling..."
            initialMessage="Hi! I'm here to help you list your home. Ask me anything — pricing strategy, what documents you need, how the process works, or why listing with an agent gets you more money than FSBO."
          />
        </div>
      </div>
    </div>
    <SocialProofSlot />
  </>
  );
}
