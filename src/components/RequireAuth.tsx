"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/AdminAuth";
import { IDX_PUBLIC_ENABLED } from "@/lib/config";

/**
 * Gates IDX/buyer-side routes behind admin auth during Phase 1.
 * When IDX_PUBLIC_ENABLED flips to true, this wrapper becomes a no-op.
 *
 * Usage:  wrap any page content with <RequireAuth>...</RequireAuth>
 * For admin-only routes (like /admin), pass alwaysRequire to ignore the flag.
 */
export default function RequireAuth({
  children,
  alwaysRequire = false,
}: {
  children: React.ReactNode;
  alwaysRequire?: boolean;
}) {
  const { isAdmin, authLoaded } = useAdmin();
  const router = useRouter();

  const needsAuth = alwaysRequire || !IDX_PUBLIC_ENABLED;

  useEffect(() => {
    // Wait for auth to hydrate from sessionStorage before redirecting
    if (authLoaded && needsAuth && !isAdmin) {
      router.replace("/");
    }
  }, [authLoaded, needsAuth, isAdmin, router]);

  // Phase 2 or admin → render children
  if (!needsAuth || isAdmin) return <>{children}</>;

  // Still loading auth or redirecting — show spinner
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}
