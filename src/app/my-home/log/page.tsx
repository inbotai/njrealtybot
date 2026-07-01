import type { Metadata } from "next";
import MyHomeLog from "@/components/MyHomeLog";

export const metadata: Metadata = {
  title: "MyHome Log | Track Home Improvements",
  description:
    "Track every home improvement, repair, and upgrade. See your total investment, value added, and maintenance schedule.",
  robots: { index: true, follow: true },
};

export default function MyHomeLogPage() {
  return <MyHomeLog />;
}
