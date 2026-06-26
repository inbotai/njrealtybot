import type { Metadata } from "next";
import RenovateSimulator from "@/components/RenovateSimulator";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: { absolute: "NJ Home Renovation ROI Calculator \u2014 What Adds the Most Value? | Garden State AI" },
  description:
    "Find out which home improvements give the best return in New Jersey. AI calculates renovation ROI based on your local market.",
  keywords: [
    "home renovation ROI NJ",
    "what renovations add value NJ",
    "kitchen remodel ROI New Jersey",
    "NJ home improvement return on investment",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/renovate",
  },
  openGraph: {
    type: "website",
    title: "NJ Home Renovation ROI Calculator \u2014 What Adds the Most Value? | Garden State AI",
    description:
      "Find out which home improvements give the best return in New Jersey. AI calculates renovation ROI based on your local market.",
    url: "https://gardenstate.ai/renovate",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Home Renovation ROI Calculator \u2014 What Adds the Most Value? | Garden State AI",
    description:
      "Find out which home improvements give the best return in New Jersey. AI calculates renovation ROI based on your local market.",
  },
};

export default function RenovatePage() {
  return <RequireAuth><RenovateSimulator /></RequireAuth>;
}
