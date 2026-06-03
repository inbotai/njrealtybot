import type { Metadata } from "next";
import AffordabilityCalc from "@/components/AffordabilityCalc";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "How Much House Can I Afford? | Garden State AI",
  description: "Calculate your home buying budget based on your income and debts. See matching NJ properties instantly.",
  robots: { index: false, follow: false },
};

export default function AffordPage() {
  return <RequireAuth><AffordabilityCalc /></RequireAuth>;
}
