"use client";

import Link from "next/link";

interface SmsConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Use dark text on light backgrounds (default), or light text on dark backgrounds */
  dark?: boolean;
}

/**
 * A2P 10DLC / TCPA compliant SMS consent checkbox.
 *
 * Required elements per CTIA guidelines:
 * - Unchecked by default (never pre-check)
 * - Business name
 * - Message type description
 * - Frequency disclosure
 * - Data rates disclosure
 * - STOP / HELP instructions
 * - Consent not required for purchase
 * - Clickable, visible links to Terms & Privacy Policy
 */
export default function SmsConsent({ checked, onChange, dark = false }: SmsConsentProps) {
  const textColor = dark ? "text-gray-400" : "text-gray-500";
  const linkColor = dark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-800";

  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className={`text-[11px] ${textColor} leading-relaxed`}>
        I agree to receive SMS/WhatsApp messages from{" "}
        <strong>Garden State AI (BHG Real Estate | Green Team)</strong> about
        property valuations, market updates, and real estate services.
        Msg frequency varies. Msg &amp; data rates may apply.
        Reply STOP to cancel, HELP for help.
        Consent is not required to make a purchase.{" "}
        <Link href="/terms" target="_blank" className={`font-semibold underline ${linkColor}`}>
          Terms of Service
        </Link>
        {" & "}
        <Link href="/privacy" target="_blank" className={`font-semibold underline ${linkColor}`}>
          Privacy Policy
        </Link>.
      </span>
    </label>
  );
}
