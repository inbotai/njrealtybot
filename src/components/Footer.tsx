import Link from "next/link";

const quickLinks = [
  { href: "/search", label: "Search Homes" },
  { href: "/deals", label: "Find Deals" },
  { href: "/sell", label: "Sell Your Home" },
  { href: "/open-houses", label: "Open Houses" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-navy text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Agent + Broker — prominent per MLS rules */}
          <div>
            <h3 className="text-lg font-bold text-white">
              <span className="text-gold">NJ</span> Realty Bot
            </h3>
            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <img src="/realty-one-group-logo.svg" alt="Realty One Group" className="h-10 w-auto mb-2" />
              <p className="text-sm font-semibold text-white">Julio Reynoso</p>
              <p className="text-sm text-gray-300">Licensed Real Estate Agent</p>
              <p className="mt-1 text-sm font-semibold text-gold">Realty One Group Legend</p>
              <p className="mt-1 text-xs text-gray-400">Phone: (201) 873-5655</p>
              <p className="text-xs text-gray-400">Email: julio@inbot.ai</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 font-semibold text-white">Contact Us</h4>
            <p className="text-sm">
              Have questions about a listing or need help? Vale, our AI partner, is available 24/7 on every property page.
            </p>
            <p className="mt-2 text-sm">
              Or reach Julio directly at{" "}
              <a href="tel:+12018735655" className="text-gold hover:underline">(201) 873-5655</a>
            </p>
          </div>
        </div>

        {/* Powered by Vale banner */}
        <div className="mt-10 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 px-6 py-5 text-center">
          <p className="text-base font-bold text-white">
            Powered with{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-300 underline underline-offset-2 transition">
              Vale
            </a>
            {" "}from{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-300 underline underline-offset-2 transition">
              InBot AI
            </a>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            AI-powered real estate technology — lead generation, MLS search &amp; WhatsApp automation
          </p>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} NJ Realty Bot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
