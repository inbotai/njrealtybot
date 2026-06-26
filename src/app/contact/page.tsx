import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: { absolute: "Contact Garden State AI | NJ Real Estate" },
  description:
    "Get in touch with Garden State AI. Reach us via WhatsApp, email, or our contact form for any NJ real estate questions.",
  keywords: [
    "contact Garden State AI",
    "NJ real estate contact",
    "Vale AI contact",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/contact",
  },
  openGraph: {
    type: "website",
    title: "Contact Garden State AI | NJ Real Estate",
    description:
      "Get in touch with Garden State AI. Reach us via WhatsApp, email, or our contact form for any NJ real estate questions.",
    url: "https://gardenstate.ai/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Garden State AI | NJ Real Estate",
    description:
      "Get in touch with Garden State AI. Reach us via WhatsApp, email, or our contact form for any NJ real estate questions.",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Contact Us</h1>
      <p className="mt-3 text-gray-600">
        Have a question or ready to get started? Reach out and we&apos;ll get
        back to you within 24 hours.
      </p>

      {/* WhatsApp hero CTA */}
      <div className="mt-8 rounded-xl border border-[#25D366]/30 bg-gradient-to-r from-[#25D366]/10 to-[#25D366]/5 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex-1">
            <h3 className="font-bold text-navy">The fastest way to reach us? WhatsApp.</h3>
            <p className="mt-1 text-sm text-gray-600">
              Vale, our AI partner, responds instantly. Get valuations, search properties, schedule showings, and receive market alerts — all from your phone.
            </p>
          </div>
          <a
            href="https://wa.me/12015281095?text=Hi%20Vale!%20I%27m%20interested%20in%20NJ%20real%20estate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:bg-[#20bd5a] hover:shadow-lg"
          >
            <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
              <path d="M16.004 0C7.165 0 .003 7.16.003 15.997c0 2.818.737 5.574 2.138 7.998L.012 32l8.207-2.1a15.94 15.94 0 007.785 1.988h.007C24.843 31.888 32 24.728 32 15.997 32 7.16 24.843 0 16.004 0zm7.33 22.269c-.4-.2-2.373-1.17-2.74-1.303-.37-.134-.64-.2-.91.2-.27.4-1.043 1.303-1.28 1.573-.236.267-.473.3-.873.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.23-2.77-.233-.4-.024-.617.177-.817.183-.183.4-.473.6-.71.2-.237.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.91-2.193-1.247-3.003-.33-.787-.663-.68-.91-.693l-.777-.013c-.267 0-.7.1-1.067.5-.367.4-1.4 1.37-1.4 3.34 0 1.97 1.434 3.873 1.634 4.14.2.267 2.82 4.307 6.834 6.037.955.413 1.7.66 2.28.843.958.304 1.83.26 2.52.158.77-.114 2.373-.97 2.71-1.907.333-.934.333-1.737.233-1.904-.1-.167-.367-.267-.767-.467z" />
            </svg>
            Message Vale on WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <LeadForm leadType="info_request" title="Send Us a Message" />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="font-bold text-navy">Phone</h3>
            <a href="tel:+12015281095" className="mt-1 block text-sm text-gold hover:underline">
              (201) 528-1095
            </a>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="font-bold text-navy">Email</h3>
            <a href="mailto:julio@inbot.ai" className="mt-1 block text-sm text-gray-600 hover:text-gold">
              julio@inbot.ai
            </a>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="font-bold text-navy">Vale AI — Available 24/7</h3>
            <p className="mt-1 text-sm text-gray-600">
              Vale is always online on WhatsApp. Search properties, get instant valuations, schedule showings — anytime, day or night.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
