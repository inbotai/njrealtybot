import type { Metadata } from "next";
import CompAlertsClient from "@/components/CompAlertsClient";


export const metadata: Metadata = {
  title: { absolute: "NJ Comp Alerts \u2014 Real-Time Comparable Sales Notifications | Garden State AI" },
  description:
    "Get notified when a comparable property sells near your home. Track real-time comps to know your home's true value in the NJ market.",
  keywords: [
    "NJ comparable sales alerts",
    "comp alerts New Jersey",
    "real-time comps NJ",
    "property sold near me NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/comp-alerts",
  },
  openGraph: {
    type: "website",
    title: "NJ Comp Alerts \u2014 Real-Time Comparable Sales Notifications | Garden State AI",
    description:
      "Get notified when a comparable property sells near your home. Track real-time comps to know your home's true value in the NJ market.",
    url: "https://gardenstate.ai/comp-alerts",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Comp Alerts \u2014 Real-Time Comparable Sales Notifications | Garden State AI",
    description:
      "Get notified when a comparable property sells near your home. Track real-time comps to know your home's true value in the NJ market.",
  },
};

export default function CompAlertsPage() {
  return <CompAlertsClient />;
}
