import Link from "next/link";

const quickLinks = [
  { href: "/sell", label: "Sell Your Home" },
  { href: "/chat", label: "Chat with Vale" },
  { href: "/alerts", label: "Price Alerts" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-navy text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Garden State AI */}
          <div>
            <h3 className="text-base font-bold text-white">
              <span className="text-gold">Garden</span> State <span className="text-indigo-400">AI</span>
            </h3>
            <p className="mt-2 text-sm">
              The Most Advanced Real Estate AI in NJ.
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
              Vale, our AI partner, is available 24/7.
            </p>
            <p className="mt-2 text-sm">
              <a href="tel:+12015281095" className="text-gold hover:underline">(201) 528-1095</a>
              {" | "}
              <a href="mailto:julio@inbot.ai" className="text-gold hover:underline">julio@inbot.ai</a>
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

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Garden State AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
