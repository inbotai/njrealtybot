import Link from "next/link";

const quickLinks = [
  { href: "/search", label: "Search Homes" },
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
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white">
              <span className="text-gold">NJ</span> Realty Bot
            </h3>
            <p className="mt-2 text-sm">
              Your AI-powered real estate assistant for New Jersey.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Brokered by Realty One Group Legend
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

          {/* Disclaimer */}
          <div>
            <h4 className="mb-3 font-semibold text-white">MLS Compliance</h4>
            <p className="text-xs leading-relaxed text-gray-400">
              The data relating to real estate for sale on this website comes in
              part from the IDX Program of NJMLS. Information deemed reliable but
              not guaranteed. The broker providing this data believes it to be
              correct, but advises interested parties to confirm before relying on
              it in a purchase decision.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} NJ Realty Bot. All rights reserved.</p>
          <p className="mt-2">
            Powered with{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-400 font-semibold transition">
              Vale
            </a>
            {" "}from{" "}
            <a href="https://inbot.ai" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-400 font-semibold transition">
              InBot AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
