import type { Metadata } from "next";
import AlertsPageClient from "@/components/AlertsPageClient";

export const metadata: Metadata = {
  title: "Neighborhood Price Alerts | Know When Homes Sell Near You",
  description:
    "Get instant WhatsApp alerts when a home near you sells. See what your neighbors' homes are selling for and track your home's value. Free for NJ homeowners.",
  keywords: [
    "home price alerts NJ", "neighborhood sales alerts", "homes sold near me",
    "property value tracker NJ", "real estate alerts New Jersey",
  ],
  openGraph: {
    title: "Neighborhood Price Alerts | Garden State AI",
    description: "Get instant alerts when homes sell near you. Free for NJ homeowners.",
  },
};

export default function AlertsPage() {
  return <AlertsPageClient />;
}
