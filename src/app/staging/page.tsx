import type { Metadata } from "next";
import StagingShowcase from "@/components/StagingShowcase";

export const metadata: Metadata = {
  title: "Virtual Staging | See Your Home Transformed | Garden State AI",
  description: "AI-powered virtual staging — see how your home would look professionally staged for sale. $20/photo, or free when you list with us.",
};

export default function StagingPage() {
  return <StagingShowcase />;
}
