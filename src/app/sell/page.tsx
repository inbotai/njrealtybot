import type { Metadata } from "next";
import SellPageClient from "@/components/SellPageClient";

export const metadata: Metadata = {
  title: "What's My Home Worth? | Free Home Valuation in NJ",
  description:
    "Find out what your home is worth in 30 seconds. Free AI-powered home valuation for any property in New Jersey. No obligation.",
  keywords: [
    "home value NJ", "what is my house worth", "sell my house New Jersey",
    "free home valuation", "CMA report NJ", "home appraisal NJ",
    "sell house Bloomfield NJ", "sell house Paramus NJ", "sell house Hoboken NJ",
  ],
  openGraph: {
    title: "What's My Home Worth? | Free NJ Home Valuation",
    description: "Get an instant AI-powered home valuation for any property in New Jersey. Free, no obligation.",
  },
};

export default function SellPage() {
  return <SellPageClient />;
}
