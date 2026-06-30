"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
    >
      Print QR Flyer
    </button>
  );
}
