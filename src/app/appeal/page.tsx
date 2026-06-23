import type { Metadata } from "next";
import AppealWizard from "@/components/AppealWizard";

export const metadata: Metadata = {
  title: "Prepare Your Property Tax Appeal | NJ Form A-1 Assistant",
  description:
    "Free tool to help NJ homeowners prepare their Form A-1 property tax appeal. Generate a professional petition with comparable sales. Not legal advice.",
  keywords: [
    "NJ property tax appeal form", "Form A-1 petition", "NJ tax appeal assistant",
    "prepare tax appeal NJ", "property tax appeal form generator",
    "County Board of Taxation appeal", "Chapter 123 appeal NJ",
  ],
  openGraph: {
    title: "Prepare Your Property Tax Appeal | Garden State AI",
    description: "Free tool to help NJ homeowners prepare Form A-1 with comparable sales data.",
  },
};

export default function AppealPage() {
  return <AppealWizard />;
}
