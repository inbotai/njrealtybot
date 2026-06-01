import type { Metadata } from "next";
import DealsPageClient from "@/components/DealsPageClient";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Hidden Deals | Properties Likely to Drop in Price",
  description: "Find NJ properties that are overpriced or have been on the market too long. Our AI predicts which homes are likely to drop in price soon.",
};

export default function DealsPage() {
  return <RequireAuth><DealsPageClient /></RequireAuth>;
}
