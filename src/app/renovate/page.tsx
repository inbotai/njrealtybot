import type { Metadata } from "next";
import RenovateSimulator from "@/components/RenovateSimulator";
import JsonLd, { breadcrumbList, faqPageSchema, webApplicationSchema } from "@/components/JsonLd";

const renovateFaqs = [
  { question: "Which renovations add the most value in New Jersey?", answer: "The calculator compares typical New Jersey cost and resale recovery for kitchens, baths, flooring, and other projects so you can see which ones return more of the spend." },
  { question: "Does a bigger renovation budget always return more?", answer: "No. Spending above the typical budget for a project recovers at a declining rate, so an oversized refinish can show a weak return." },
];

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
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", path: "/" }, { name: "Renovation ROI", path: "/renovate" }])} />
      <JsonLd data={webApplicationSchema({ name: "NJ Renovation ROI Calculator", path: "/renovate", description: "See which New Jersey home improvements return the most value." })} />
      <JsonLd data={faqPageSchema(renovateFaqs)} />
      <RenovateSimulator />
    </>
  );
}
