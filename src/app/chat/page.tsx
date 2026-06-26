import type { Metadata } from "next";
import { Suspense } from "react";
import ValeChatPage from "@/components/ValeChatPage";

export const metadata: Metadata = {
  title: { absolute: "Vale \u2014 NJ Real Estate AI Assistant | Garden State AI" },
  description:
    "Ask Vale anything about NJ homes, property taxes, or the market. Vale searches 60K+ MLS listings, generates CMAs, analyzes your tax case, and is available 24/7 on web and WhatsApp.",
  keywords: [
    "NJ real estate AI assistant",
    "ask AI about NJ home",
    "property tax AI chat",
    "real estate chatbot New Jersey",
    "CMA generator NJ",
    "Vale AI",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/chat",
  },
  openGraph: {
    type: "website",
    title: "Vale \u2014 NJ Real Estate AI Assistant | Garden State AI",
    description:
      "Ask Vale anything about NJ homes, property taxes, or the market. Vale searches 60K+ MLS listings, generates CMAs, analyzes your tax case, and is available 24/7 on web and WhatsApp.",
    url: "https://gardenstate.ai/chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vale \u2014 NJ Real Estate AI Assistant | Garden State AI",
    description:
      "Ask Vale anything about NJ homes, property taxes, or the market. Vale searches 60K+ MLS listings, generates CMAs, analyzes your tax case, and is available 24/7 on web and WhatsApp.",
  },
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>}>
      <ValeChatPage />
    </Suspense>
  );
}
