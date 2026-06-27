import type { Metadata } from "next";
import AdminLoginGate from "@/components/AdminLoginGate";
import BlogManager from "@/components/BlogManager";

export const metadata: Metadata = {
  title: "Blog Manager | Admin",
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return (
    <AdminLoginGate>
      <BlogManager />
    </AdminLoginGate>
  );
}
