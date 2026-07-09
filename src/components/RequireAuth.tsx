"use client";

import { useAdmin } from "@/components/AdminAuth";
import { IDX_PUBLIC_ENABLED } from "@/lib/config";
import AdminLoginGate from "@/components/AdminLoginGate";

/**
 * Gates IDX/buyer-side routes behind admin auth during Phase 1.
 * When IDX_PUBLIC_ENABLED flips to true, this wrapper becomes a no-op.
 *
 * Shows a login form instead of redirecting so shared links work —
 * user enters password, then sees the page they originally requested.
 */
export default function RequireAuth({
  children,
  alwaysRequire = false,
}: {
  children: React.ReactNode;
  alwaysRequire?: boolean;
}) {
  const { isAdmin, authLoaded } = useAdmin();

  const needsAuth = alwaysRequire || !IDX_PUBLIC_ENABLED;

  // Phase 2 or admin → render children
  if (!needsAuth || isAdmin) return <>{children}</>;

  // Still loading auth from sessionStorage — show spinner
  if (!authLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  // Not authenticated — show login form (stays on same URL)
  return <AdminLoginGate>{children}</AdminLoginGate>;
}
