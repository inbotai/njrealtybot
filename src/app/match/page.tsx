import type { Metadata } from "next";
import BuyerMatchmaker from "@/components/BuyerMatchmaker";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: { absolute: "Quantum Match \u2014 AI Home Matching for NJ Buyers | Garden State AI" },
  description:
    "AI that learns your preferences and finds your perfect NJ home. Goes beyond filters \u2014 understands what matters to you.",
  keywords: [
    "AI home matching NJ",
    "find my perfect home New Jersey",
    "NJ property recommendation AI",
    "smart home search NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/match",
  },
  openGraph: {
    type: "website",
    title: "Quantum Match \u2014 AI Home Matching for NJ Buyers | Garden State AI",
    description:
      "AI that learns your preferences and finds your perfect NJ home. Goes beyond filters \u2014 understands what matters to you.",
    url: "https://gardenstate.ai/match",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Match \u2014 AI Home Matching for NJ Buyers | Garden State AI",
    description:
      "AI that learns your preferences and finds your perfect NJ home. Goes beyond filters \u2014 understands what matters to you.",
  },
};

export default function MatchPage() {
  return <RequireAuth><BuyerMatchmaker /></RequireAuth>;
}
