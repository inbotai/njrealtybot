import type { Metadata } from "next";
import HomePageClient from "@/components/HomePage";
import { pageCanonical } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: pageCanonical("/"),
};

export default function HomePage() {
  return <HomePageClient />;
}
