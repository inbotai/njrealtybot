import type { Metadata } from "next";
import RenovateSimulator from "@/components/RenovateSimulator";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Renovation Simulator | See How Upgrades Affect Your Home Value",
  description: "Upload photos of your kitchen or bathroom. Our AI shows what a renovation would look like and calculates the ROI — instantly.",
  robots: { index: false, follow: false },
};

export default function RenovatePage() {
  return <RequireAuth><RenovateSimulator /></RequireAuth>;
}
