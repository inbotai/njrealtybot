import type { Metadata } from "next";
import { Suspense } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLoginGate from "@/components/AdminLoginGate";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminLoginGate>
      <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>}>
        <AdminDashboard />
      </Suspense>
    </AdminLoginGate>
  );
}
