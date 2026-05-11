export default function MLSDisclaimer() {
  return (
    <section className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h4 className="mb-3 text-sm font-semibold text-gray-300">
          MLS Disclaimer
        </h4>

        <p className="text-xs leading-relaxed">
          <strong>NJMLS:</strong> The data relating to real estate for sale on
          this website comes in part from the Internet Data Exchange (IDX)
          program of the New Jersey Multiple Listing Service (NJMLS). Real
          estate listings held by brokerage firms other than NJ Realty Bot /
          Realty One Group Legend are marked with the NJMLS logo and information
          about them includes the name of the listing broker. The information
          deemed reliable but not guaranteed. The data is provided for
          consumers&apos; personal, non-commercial use and may not be used for
          any purpose other than to identify prospective properties consumers
          may be interested in purchasing.
        </p>

        <p className="mt-4 text-xs leading-relaxed">
          <strong>GSMLS:</strong> Information is provided exclusively for
          consumers&apos; personal, non-commercial use and may not be used for
          any purpose other than to identify prospective properties consumers
          may be interested in purchasing. Data is deemed reliable but is not
          guaranteed accurate by the Garden State Multiple Listing Service.
        </p>

        <p className="mt-4 text-[10px] text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </section>
  );
}
