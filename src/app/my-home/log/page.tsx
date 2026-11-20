import type { Metadata } from "next";
import MyHomeLog from "@/components/MyHomeLog";

// Static shell. Entries load in the browser after sign-in, so a CDN hit does
// not call the listing API and does not drop a saved log. Global nav links
// set prefetch={false} so an ordinary page view does not request this route.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "MyHome Log | Track Home Improvements",
  description:
    "Track every home improvement, repair, and upgrade. See your total investment, value added, and maintenance schedule.",
  robots: { index: true, follow: true },
};

export default function MyHomeLogPage() {
  return <MyHomeLog />;
}
