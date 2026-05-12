export default function MLSDisclaimer() {
  const now = new Date();
  const lastUpdated = now.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  const year = now.getFullYear();

  return (
    <section className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* NJMLS Disclaimer */}
        <div className="flex items-start gap-4">
          <img src="/njmls-idx-logo.jpg" alt="NJMLS Internet Data Exchange" className="mt-1 h-10 w-auto flex-shrink-0" />
          <div>
            <p className="text-xs leading-relaxed">
              The data relating to real estate for sale on this web site comes in part from
              the Internet Data Exchange Program of the NJMLS. Real estate listings held by
              brokerage firms other than Realty One Group Legend are marked with the NJMLS Internet
              Data Exchange logo and information about them includes the name of the listing
              brokers. Some properties listed with the participating brokers do not appear on
              this website at the request of the seller. Listings of brokers that do not participate
              in Internet Data Exchange do not appear on this website.
            </p>
          </div>
        </div>

        {/* GSMLS Disclaimer — exact mandatory text from IDX Display Guidelines */}
        <div className="mt-4 flex items-start gap-4">
          <img src="/gsmls-logo.gif" alt="GSMLS - Garden State MLS" className="mt-1 h-10 w-auto flex-shrink-0" />
          <div>
            <p className="text-xs leading-relaxed">
              The data displayed relating to real estate for sale comes in part from the IDX
              Program of Garden State Multiple Listing Service, L.L.C. Real estate listings
              held by other brokerage firms are marked as IDX Listing.
            </p>
          </div>
        </div>

        {/* N.J.A.C. 11:5.6.1 Disclosure — mandatory per GSMLS */}
        <p className="mt-4 text-xs leading-relaxed">
          Notice: The dissemination of listings displayed herein does not constitute the consent
          required by N.J.A.C. 11:5.6.1(n) for the advertisement of listings exclusively for
          sale by another broker. Any such consent must be obtained in writing from the listing broker.
        </p>

        {/* Consumer disclaimer — mandatory per both NJMLS and GSMLS */}
        <p className="mt-3 text-xs leading-relaxed">
          This information is being provided for Consumers&apos; personal, non-commercial use and
          may not be used for any purpose other than to identify prospective properties Consumers
          may be interested in purchasing.
        </p>

        {/* Accuracy + Copyright + Last Updated */}
        <div className="mt-4 space-y-1 text-[10px] text-gray-500">
          <p>Information deemed reliable but not guaranteed. Last date updated: {lastUpdated}.</p>
          <p>&copy; {year} New Jersey Multiple Listing Service, Inc. All rights reserved.</p>
          <p>Information deemed reliable but not guaranteed. Copyright &copy; {year} Garden State Multiple Listing Service, L.L.C. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
}
