import type { Metadata } from "next";
import SellerDashboard from "@/components/SellerDashboard";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: { absolute: "My Listing Dashboard | Garden State AI" },
  description:
    "Track your home sale progress, review offers, and get AI-powered negotiation strategies — all in one dashboard.",
  alternates: {
    canonical: "https://gardenstate.ai/my-listing",
  },
  openGraph: {
    type: "website",
    title: "My Listing Dashboard | Garden State AI",
    description:
      "Track your home sale progress, review offers, and get AI-powered negotiation strategies — all in one dashboard.",
    url: "https://gardenstate.ai/my-listing",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Listing Dashboard | Garden State AI",
    description:
      "Track your home sale progress, review offers, and get AI-powered negotiation strategies — all in one dashboard.",
  },
};

export default function MyListingPage() {
  return (
    <RequireAuth alwaysRequire>
      <SellerDashboard />
    </RequireAuth>
  );
}
