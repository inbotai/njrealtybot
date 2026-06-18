import type { Metadata } from "next";
import SellTimingSimulator from "@/components/SellTimingSimulator";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Sell Now vs Wait | Garden State AI",
  description: "Should you sell now or wait? See projected home values for 3, 6, and 12 months based on NJ market trends.",
};

export default function SellTimingPage() {
  return <RequireAuth><SellTimingSimulator /></RequireAuth>;
}
