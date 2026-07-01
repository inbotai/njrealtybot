import type { Metadata } from "next";
import AdminLoginGate from "@/components/AdminLoginGate";
import MyHomeAdmin from "@/components/MyHomeAdmin";

export const metadata: Metadata = {
  title: "MyHome Admin",
  robots: { index: false, follow: false },
};

export default function MyHomeAdminPage() {
  return (
    <AdminLoginGate>
      <MyHomeAdmin />
    </AdminLoginGate>
  );
}
