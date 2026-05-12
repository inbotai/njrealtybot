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

        {/* GSMLS Disclaimer */}
        <div className="mt-4 flex items-start gap-4">
          <img src="/gsmls-logo.gif" alt="GSMLS - Garden State MLS" className="mt-1 h-10 w-auto flex-shrink-0" />
          <div>
            <p className="text-xs leading-relaxed">
              Some of the listing data on this website comes from the Garden State Multiple
              Listing Service, LLC. Real estate listings held by brokerage firms other than
              Realty One Group Legend are marked with the GSMLS logo. Information is provided
              exclusively for consumers&apos; personal, non-commercial use and may not be used
              for any purpose other than to identify prospective properties consumers may be
              interested in purchasing. Data is deemed reliable but is not guaranteed accurate
              by the GSMLS.
            </p>
          </div>
        </div>

        {/* Required notices */}
        <div className="mt-4 space-y-1 text-[10px] text-gray-500">
          <p>All information deemed reliable but not guaranteed. Last date updated: {lastUpdated}.</p>
          <p>Source: New Jersey Multiple Listing Service, Inc. | Garden State Multiple Listing Service, LLC.</p>
          <p>&copy; {year} New Jersey Multiple Listing Service, Inc. All rights reserved.</p>
          <p>
            The information provided is for consumers&apos; personal, non-commercial use and may
            not be used for any purpose other than to identify prospective properties consumers
            may be interested in purchasing.
          </p>
        </div>
      </div>
    </section>
  );
}
