"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import NavbarIdx from "@/components/NavbarIdx";
import Footer from "@/components/Footer";
import FooterIdx from "@/components/FooterIdx";
import ValeSidePanel from "@/components/ValeSidePanel";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import TrackingPixels from "@/components/TrackingPixels";
import ActivityTracker from "@/components/ActivityTracker";
import ExitIntent from "@/components/ExitIntent";
import AppSidebar from "@/components/AppSidebar";
import MyHomeLogCTA from "@/components/MyHomeLogCTA";

function isIdxHost(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((part) => part.startsWith("gsai_idx=1"));
}

/**
 * Chrome that used to read request headers in the root layout.
 * Pathname and the IDX cookie are read on the client so public pages
 * can stay statically generated.
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const [isIdx, setIsIdx] = useState(false);

  useEffect(() => {
    setIsIdx(isIdxHost());
  }, []);

  const isV2 = pathname === "/v2";
  const isPropertyPage = pathname.startsWith("/property/");

  return (
    <>
      {!isV2 && (isIdx ? <NavbarIdx /> : <Navbar />)}
      {!isV2 && !isIdx && <AppSidebar />}
      {!isV2 && <MyHomeLogCTA />}
      <main className="flex-1">{children}</main>
      {!isV2 && (isIdx ? <FooterIdx /> : <Footer />)}
      {!isV2 && !isPropertyPage && <ValeSidePanel />}
      {!isIdx && !isV2 && <WhatsAppWidget />}
      {!isV2 && <ExitIntent />}
      <TrackingPixels />
      <Suspense><ActivityTracker /></Suspense>
    </>
  );
}
