import type { Metadata } from "next";
import BuyerMatchmaker from "@/components/BuyerMatchmaker";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Property Matchmaker | Find Your Perfect Home | Garden State AI",
  description: "Answer a few questions and our AI finds properties that match your lifestyle, budget, and preferences. Gets smarter with every visit.",
  robots: { index: false, follow: false },
};

export default function MatchPage() {
  return <RequireAuth><BuyerMatchmaker /></RequireAuth>;
}
