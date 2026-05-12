"use client";

import { useVale } from "./ValeProvider";

export default function NavValeButton() {
  const { togglePanel, panelOpen } = useVale();
  return (
    <button
      onClick={togglePanel}
      className={`text-sm font-medium transition ${panelOpen ? "text-gold" : "text-gray-200 hover:text-gold"}`}
    >
      Vale AI
    </button>
  );
}
