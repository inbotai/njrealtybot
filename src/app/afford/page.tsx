import type { Metadata } from "next";
import AffordabilityCalc from "@/components/AffordabilityCalc";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: { absolute: "NJ Home Affordability Calculator \u2014 What Can I Afford? | Garden State AI" },
  description:
    "Calculate how much home you can afford in New Jersey. Includes mortgage payment, NJ property taxes, HOA, and insurance \u2014 the real monthly cost.",
  keywords: [
    "NJ home affordability calculator",
    "how much house can I afford New Jersey",
    "NJ mortgage calculator with taxes",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/afford",
  },
  openGraph: {
    type: "website",
    title: "NJ Home Affordability Calculator \u2014 What Can I Afford? | Garden State AI",
    description:
      "Calculate how much home you can afford in New Jersey. Includes mortgage payment, NJ property taxes, HOA, and insurance \u2014 the real monthly cost.",
    url: "https://gardenstate.ai/afford",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Home Affordability Calculator \u2014 What Can I Afford? | Garden State AI",
    description:
      "Calculate how much home you can afford in New Jersey. Includes mortgage payment, NJ property taxes, HOA, and insurance \u2014 the real monthly cost.",
  },
};

export default function AffordPage() {
  return <RequireAuth><AffordabilityCalc /></RequireAuth>;
}
