import type { Metadata } from "next";
import SellTimingSimulator from "@/components/SellTimingSimulator";


export const metadata: Metadata = {
  title: { absolute: "Should I Sell My NJ Home Now or Wait? AI Timing Tool | Garden State AI" },
  description:
    "See your NJ home's projected value in 3, 6, and 12 months. AI analyzes market trends to tell you the optimal time to list your property in New Jersey.",
  keywords: [
    "best time to sell house NJ",
    "should I sell my home now New Jersey",
    "NJ real estate market timing",
    "when to sell NJ home 2026",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/sell-timing",
  },
  openGraph: {
    type: "website",
    title: "Should I Sell My NJ Home Now or Wait? AI Timing Tool | Garden State AI",
    description:
      "See your NJ home's projected value in 3, 6, and 12 months. AI analyzes market trends to tell you the optimal time to list your property in New Jersey.",
    url: "https://gardenstate.ai/sell-timing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Should I Sell My NJ Home Now or Wait? AI Timing Tool | Garden State AI",
    description:
      "See your NJ home's projected value in 3, 6, and 12 months. AI analyzes market trends to tell you the optimal time to list your property in New Jersey.",
  },
};

export default function SellTimingPage() {
  return <SellTimingSimulator />;
}
