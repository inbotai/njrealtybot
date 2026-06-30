import type { Metadata } from "next";
import AdminLoginGate from "@/components/AdminLoginGate";
import LeadPipeline from "@/components/LeadPipeline";

export const metadata: Metadata = {
  title: "Lead Pipeline",
  robots: { index: false, follow: false },
};

export default function LeadPipelinePage() {
  return (
    <AdminLoginGate>
      <LeadPipeline />
    </AdminLoginGate>
  );
}
