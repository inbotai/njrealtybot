import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Garden State AI",
  description: "How Garden State AI collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 16, 2026</p>

      <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy">Overview</h2>
          <p className="mt-2">
            At Garden State AI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            use our website (gardenstate.ai), our AI-powered real estate services (including Vale, our AI real estate
            assistant), and our SMS/WhatsApp messaging features. By accessing or using our services, you agree to this
            policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">1. Information We Collect</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone number, and other contact details
              provided through our website forms, Vale chat, or during opt-in for SMS/WhatsApp messages.
            </li>
            <li>
              <strong>Property Search Data:</strong> Search criteria, saved properties, alerts, and preferences you
              provide while using our real estate search tools.
            </li>
            <li>
              <strong>Usage Data:</strong> IP address, browser type, and pages visited, collected via cookies or similar
              technologies.
            </li>
            <li>
              <strong>Message Data:</strong> Content of messages sent or received via Vale (web chat, WhatsApp, or SMS)
              to provide and improve our services.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">2. How We Use Your Information</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain our AI-powered real estate services, including property search,
              home valuations, market reports, and Vale AI assistant.</li>
            <li>Process opt-ins for SMS/WhatsApp messages and manage user consent.</li>
            <li>Send property alerts, market updates, and relevant real estate communications you have opted into.</li>
            <li>Improve our services, including training and development of AI features.</li>
            <li>Communicate with you, including responding to inquiries and scheduling property showings.</li>
            <li>Facilitate referrals to licensed real estate agents when requested.</li>
            <li>Ensure compliance with legal and regulatory requirements (e.g., A2P 10DLC, MLS/IDX rules).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">3. How We Share Your Information</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>Licensed Real Estate Agents:</strong> When you request a showing, valuation, or agent referral,
              we share your contact information with a licensed agent to fulfill your request.
            </li>
            <li>
              <strong>Service Providers:</strong> Third-party providers (e.g., Twilio for messaging, Supabase for data
              storage) bound by confidentiality agreements.
            </li>
            <li>
              <strong>MLS Data Providers:</strong> We comply with NJMLS and GSMLS rules regarding the display and use
              of listing data. Your personal information is never shared with MLS providers.
            </li>
            <li>
              <strong>Legal Requirements:</strong> To comply with law or protect rights/safety.
            </li>
            <li>
              <strong>Business Transfers:</strong> In a merger, acquisition, or asset sale.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">4. SMS/WhatsApp Messaging</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>Opt-In:</strong> You consent to receive messages by providing your phone number through our
              website, Vale chat, or by messaging our WhatsApp number. Message frequency varies.
            </li>
            <li>
              <strong>Opt-Out:</strong> Reply STOP to any message or contact support@gardenstate.ai at any time.
            </li>
            <li>
              <strong>Message &amp; Data Rates:</strong> Standard carrier message and data rates may apply.
            </li>
            <li>
              <strong>No Sharing for Marketing:</strong> We do not sell or share your phone number with third parties
              for their marketing purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">5. Your Choices and Rights</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li><strong>Opt-Out:</strong> Reply STOP to any message or email support@gardenstate.ai.</li>
            <li><strong>Access &amp; Deletion:</strong> Email support@gardenstate.ai to request access to or deletion
              of your personal data.</li>
            <li><strong>Cookies:</strong> Manage cookie preferences in your browser settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">6. Data Security</h2>
          <p className="mt-2">
            We implement reasonable security measures to protect your information, including encryption in transit and
            at rest, secure server infrastructure, and restricted access controls. However, no method of transmission
            over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">7. Data Retention</h2>
          <p className="mt-2">
            We retain your personal information for as long as necessary to provide our services and fulfill the
            purposes described in this policy, or as required by law. You may request deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">8. International Data Transfers</h2>
          <p className="mt-2">
            Your information may be processed in the United States and other countries where our service providers
            operate. We follow applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">9. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy periodically. Changes will be posted here with an updated date.
            Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">10. Contact Us</h2>
          <p className="mt-2">
            Email <a href="mailto:support@gardenstate.ai" className="text-indigo-600 hover:underline">support@gardenstate.ai</a> or
            write to: Garden State AI, P.O. Box 492, Elmwood Park, NJ 07407.
          </p>
        </section>
      </div>
    </div>
  );
}
