"use client";

import { useAdmin } from "@/components/AdminAuth";
import { IDX_PUBLIC_ENABLED } from "@/lib/config";

/**
 * Hides children unless IDX is public or user is admin.
 * Used to conditionally hide individual listing sections within public pages
 * (e.g., "Recent Sales" cards on /market/[city]) during Phase 1.
 */
export default function IdxGate({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();
  if (IDX_PUBLIC_ENABLED || isAdmin) return <>{children}</>;
  return null;
}
