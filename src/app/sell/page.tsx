import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Sell Your Home | Free Valuation",
  description:
    "Thinking of selling your home in New Jersey? Get a free home valuation and expert marketing powered by AI.",
};

const benefits = [
  {
    title: "AI-Powered Marketing",
    desc: "Your listing reaches the right buyers through intelligent targeting and 24/7 AI assistant support.",
  },
  {
    title: "Maximum Exposure",
    desc: "Listed on NJMLS, GSMLS, Zillow, Realtor.com, Redfin, and hundreds more sites.",
  },
  {
    title: "Professional Photography",
    desc: "High-quality photos and virtual tours to showcase your home at its best.",
  },
  {
    title: "Expert Pricing Strategy",
    desc: "Data-driven pricing analysis to ensure you get the best value for your property.",
  },
  {
    title: "Dedicated Agent Support",
    desc: "Personal guidance from listing to closing, with real-time updates every step of the way.",
  },
];

export default function SellPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold md:text-5xl">
            Thinking of Selling?
          </h1>
          <p className="mt-4 text-xl text-gold">
            Get a Free Home Valuation
          </p>
          <p className="mt-3 text-gray-300">
            Find out what your home is worth in today&apos;s market. No
            obligation, no pressure.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-bold text-navy">
              Why Sell With NJ Realty Bot?
            </h2>
            <div className="mt-6 space-y-6">
              {benefits.map((b) => (
                <div key={b.title}>
                  <h3 className="font-semibold text-navy">{b.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{b.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg bg-gold/10 p-4 text-sm text-gray-700">
              Prefer to chat?{" "}
              <a
                href="https://wa.me/1XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold hover:underline"
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            <LeadForm
              leadType="listing_request"
              title="Request Your Free Valuation"
            />
          </div>
        </div>
      </div>
    </>
  );
}
