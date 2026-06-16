import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Garden State AI",
  description: "Terms and conditions for using Garden State AI real estate services.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 16, 2026</p>

      <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy">Overview</h2>
          <p className="mt-2">
            These Terms govern your use of gardenstate.ai, our AI-powered real estate services (including Vale, our AI
            real estate assistant), and our SMS/WhatsApp messaging features. By accessing or using our services, you
            agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">1. Services</h2>
          <p className="mt-2">
            Garden State AI provides AI-driven real estate tools including property search, home valuations, market
            reports, virtual staging, property tax analysis, and Vale — a 24/7 AI real estate assistant available via
            web chat, WhatsApp, and SMS. Our services are designed to connect home buyers and sellers with licensed
            real estate professionals.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">2. Eligibility</h2>
          <p className="mt-2">
            You must be at least 18 years old and able to form a binding contract to use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">3. User Conduct</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>No illegal use or unsolicited messaging.</li>
            <li>No interference with service functionality.</li>
            <li>No false or misleading information during registration or opt-in.</li>
            <li>No scraping, automated collection, or redistribution of MLS listing data.</li>
            <li>Property listing data is for personal, non-commercial use only, in accordance with MLS/IDX rules.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">4. Messaging Services</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>Opt-In:</strong> You consent to receive messages by providing your phone number through our
              website, Vale chat, or by messaging our WhatsApp number. You may opt out at any time by replying STOP.
            </li>
            <li>
              <strong>Message Frequency:</strong> Message frequency varies based on your preferences and activity.
              You may receive property alerts, market updates, showing confirmations, and follow-up communications.
            </li>
            <li>
              <strong>Message &amp; Data Rates:</strong> Standard carrier message and data rates may apply.
            </li>
            <li>
              <strong>Opt-Out:</strong> Reply STOP to any message or contact support@gardenstate.ai. You will receive
              a confirmation and no further messages will be sent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">5. Real Estate Services Disclaimer</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              Garden State AI is a technology platform, not a licensed real estate brokerage. We connect users with
              licensed real estate professionals.
            </li>
            <li>
              Property valuations, market reports, and tax analyses provided by our AI tools are estimates for
              informational purposes only and should not be considered appraisals or professional advice.
            </li>
            <li>
              Listing data is sourced from NJMLS and GSMLS. Information is deemed reliable but not guaranteed.
              Always verify with the listing agent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">6. Intellectual Property</h2>
          <p className="mt-2">
            All content, trademarks, AI models, and software on gardenstate.ai are owned by us or our licensors.
            MLS listing data is provided under IDX license agreements and may not be copied, redistributed, or used
            for any purpose other than personal, non-commercial property searches.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">7. Disclaimer of Warranties</h2>
          <p className="mt-2">
            Services are provided &quot;as is.&quot; We do not guarantee uninterrupted or error-free operation. AI
            valuations, market predictions, and property tax analyses are estimates and may not reflect actual market
            conditions or outcomes. We recommend consulting licensed professionals for important financial decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">8. Limitation of Liability</h2>
          <p className="mt-2">
            Garden State AI is not liable for indirect, incidental, or consequential damages arising from your use
            of our services, including but not limited to reliance on AI-generated valuations, market reports, or
            property tax analyses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">9. Termination</h2>
          <p className="mt-2">
            We may suspend or terminate your access if you violate these Terms. You may stop using our services
            at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">10. Governing Law</h2>
          <p className="mt-2">
            These Terms are governed by the laws of the State of New Jersey, USA. Any disputes shall be resolved
            in the courts of Bergen County, New Jersey.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">11. Changes to Terms</h2>
          <p className="mt-2">
            We may update these Terms periodically. Changes will be posted with an updated date.
            Continued use constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">12. Contact Us</h2>
          <p className="mt-2">
            Email <a href="mailto:support@gardenstate.ai" className="text-indigo-600 hover:underline">support@gardenstate.ai</a> or
            write to: Garden State AI, P.O. Box 492, Elmwood Park, NJ 07407.
          </p>
        </section>
      </div>
    </div>
  );
}
