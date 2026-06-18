import type { Metadata } from "next";
import CompAlertsClient from "@/components/CompAlertsClient";
import RequireAuth from "@/components/RequireAuth";

export const metadata: Metadata = {
  title: "Neighborhood Comp Alerts | Garden State AI",
  description: "Get notified when homes near you sell. Track your neighborhood's market value in real-time.",
};

export default function CompAlertsPage() {
  return <RequireAuth><CompAlertsClient /></RequireAuth>;
}
