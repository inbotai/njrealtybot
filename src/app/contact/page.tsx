import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with NJ Realty Bot. Ask about homes for sale, schedule a showing, or get a free home valuation.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Contact Us</h1>
      <p className="mt-3 text-gray-600">
        Have a question or ready to get started? Reach out and we&apos;ll get
        back to you within 24 hours.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <LeadForm leadType="info_request" title="Send Us a Message" />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="font-bold text-navy">WhatsApp</h3>
            <a
              href="https://wa.me/1XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-gold hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="font-bold text-navy">Phone</h3>
            <a href="tel:+1XXXXXXXXXX" className="mt-1 block text-sm text-gray-600 hover:text-gold">
              (XXX) XXX-XXXX
            </a>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="font-bold text-navy">Email</h3>
            <a href="mailto:info@njrealtybot.com" className="mt-1 block text-sm text-gray-600 hover:text-gold">
              info@njrealtybot.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
