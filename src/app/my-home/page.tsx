import type { Metadata } from "next";
import ClaimHomeClient from "@/components/ClaimHomeClient";

export const metadata: Metadata = {
  title: "Track My Home's Value | Free Monthly Equity Report",
  description:
    "Claim your NJ home and get free monthly value reports. Track your equity, see nearby sales, and know the best time to sell.",
  keywords: [
    "home value tracker NJ", "home equity report", "what is my house worth",
    "NJ home value", "free home valuation", "monthly home report",
  ],
  openGraph: {
    title: "Track My Home's Value | Garden State AI",
    description: "Free monthly equity reports for NJ homeowners. Know your home's value, track your equity, and get notified of nearby sales.",
  },
};

export default function MyHomePage() {
  return <ClaimHomeClient />;
}
