import type { Metadata } from "next";
import AlertsPageClient from "@/components/AlertsPageClient";

export const metadata: Metadata = {
  title: { absolute: "NJ Home Price Alerts \u2014 Get Notified When Prices Drop | Garden State AI" },
  description:
    "Set price alerts for any NJ neighborhood or zip code. Get notified the moment a home drops in price or a new listing matches your criteria.",
  keywords: [
    "NJ property price alerts",
    "home price drop alert New Jersey",
    "NJ listing alerts",
    "price reduction notifications NJ",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/alerts",
  },
  openGraph: {
    type: "website",
    title: "NJ Home Price Alerts \u2014 Get Notified When Prices Drop | Garden State AI",
    description:
      "Set price alerts for any NJ neighborhood or zip code. Get notified the moment a home drops in price or a new listing matches your criteria.",
    url: "https://gardenstate.ai/alerts",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Home Price Alerts \u2014 Get Notified When Prices Drop | Garden State AI",
    description:
      "Set price alerts for any NJ neighborhood or zip code. Get notified the moment a home drops in price or a new listing matches your criteria.",
  },
};

export default function AlertsPage() {
  return <AlertsPageClient />;
}
