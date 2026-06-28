import type { Metadata } from "next";
import SearchEngine from "@/components/SearchEngine";

export const metadata: Metadata = {
  title: "Garden State AI",
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return <SearchEngine />;
}
