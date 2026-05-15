import type { Metadata } from "next";
import { Suspense } from "react";
import ValeChatPage from "@/components/ValeChatPage";

export const metadata: Metadata = {
  title: "Chat with Vale",
  description:
    "Talk to Vale, your AI real estate assistant. Search homes, get market insights, and schedule showings — all in one conversation.",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>}>
      <ValeChatPage />
    </Suspense>
  );
}
