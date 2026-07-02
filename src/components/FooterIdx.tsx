/**
 * IDX subdomain footer — brokerage branded with full MLS compliance.
 * Shows on idxlistings.gardenstate.ai.
 */

import MLSDisclaimer from "@/components/MLSDisclaimer";

export default function FooterIdx() {
  return (
    <>
      <MLSDisclaimer />
      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">[Brokerage Name]</p>
              <p className="text-xs">Licensed Real Estate Broker — NJ License #XXXXXXX</p>
              <p className="text-xs">Agent: Julio Reynoso — License #XXXXXXX</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] text-gray-600">
                Property search powered by{" "}
                <a href="https://gardenstate.ai" className="text-gray-500 hover:text-gray-400 transition">
                  Garden State AI
                </a>
              </p>
              <p className="text-[10px] text-gray-600">
                Powered by{" "}
                <a href="https://gardenstate.ai" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition">
                  Garden State AI
                </a>
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 text-center text-[10px] text-gray-600">
            <p>&copy; {new Date().getFullYear()} [Brokerage Name]. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
