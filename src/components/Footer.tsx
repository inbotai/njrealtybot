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
        {/* Broker + Agent — MOST PROMINENT per MLS co-branding rules */}
        <div className="mb-10 flex flex-col items-center text-center">
          <img src="/realty-one-group-legend-logo.webp" alt="Realty One Group Legend"
            className="h-20 w-auto" />
          <p className="mt-3 text-sm text-gray-400">600 Getty Avenue, Clifton NJ 07011</p>
          <p className="text-sm text-gray-400"><a href="tel:+19737720660" className="hover:text-gold transition">+1 (973) 772-0660</a></p>
          <p className="mt-3 text-lg font-bold text-white">Julio Reynoso</p>
          <p className="text-sm text-gray-300">Licensed Real Estate Agent</p>
          <p className="mt-1 text-sm text-gray-400">(201) 873-5655 | julio@inbot.ai</p>
        </div>

        <div className="border-t border-white/10 pt-8 grid gap-8 md:grid-cols-3">
          {/* NJ Realty Bot — smaller than broker */}
          <div>
            <h3 className="text-base font-bold text-white">
              <span className="text-gold">NJ</span> Realty Bot
            </h3>
            <p className="mt-2 text-sm">
              Your AI-powered real estate platform for New Jersey.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              A technology platform operated by Julio Reynoso,
              Realty One Group Legend.
            </p>
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
            <h4 className="mb-3 font-semibold text-white">Contact</h4>
            <p className="text-sm">
              Vale, our AI partner, is available 24/7 on every property page.
            </p>
            <p className="mt-2 text-sm">
              Or reach Julio directly at{" "}
              <a href="tel:+12018735655" className="text-gold hover:underline">(201) 873-5655</a>
            </p>
          </div>
        </div>

        {/* Powered by Vale */}
        <div className="mt-10 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 px-6 py-5 text-center">
          <p className="text-sm font-bold text-white">
            Powered with{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-300 underline underline-offset-2 transition">
              Vale
            </a>
            {" "}from{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-300 underline underline-offset-2 transition">
              InBot AI
            </a>
          </p>
        </div>

        {/* Equal Housing Opportunity — required by NAR, HUD, and NJ LAD */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-6">
          <div className="flex items-center gap-4">
            <img src="/equal-housing-opportunity.svg" alt="Equal Housing Opportunity" className="h-10 w-auto" />
            <img src="/realtor-logo.svg" alt="REALTOR®" className="h-8 w-auto" />
          </div>
          <p className="max-w-2xl text-center text-[11px] leading-relaxed text-gray-500">
            We are pledged to the letter and spirit of U.S. policy for the achievement
            of equal housing opportunity throughout the Nation. We encourage and support
            an affirmative advertising and marketing program in which there are no barriers
            to obtaining housing because of race, color, religion, sex, handicap, familial
            status, national origin, sexual orientation, gender identity, or any other
            protected class under federal, state, or local law.
          </p>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} NJ Realty Bot | Realty One Group Legend. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
