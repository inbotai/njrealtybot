import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CityLeadCapture from "@/components/CityLeadCapture";
import JsonLd, { breadcrumbList, faqPageSchema, webApplicationSchema } from "@/components/JsonLd";
import { equalizationRatio, taxFromMarketValue, townTaxPageBySlug, townTaxPages, type NjMunicipality } from "@/lib/nj-tax-rates";
import { cityToSlug } from "@/lib/place-slug";
import { pageCanonical, SITE_URL } from "@/lib/seo";

export const revalidate = 86400;

type Props = { params: Promise<{ town: string }> };

function asMuni(town: NonNullable<ReturnType<typeof townTaxPageBySlug>>): NjMunicipality {
  return {
    county: town.county,
    district: town.district,
    generalRate: town.generalRate,
    effectiveRate: town.effectiveRate,
  };
}

export function generateStaticParams() {
  return townTaxPages().map((town) => ({ town: town.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { town: slug } = await params;
  const town = townTaxPageBySlug(slug);
  if (!town) return { title: "Town Not Found" };
  const title = `${town.name}, N.J. Property Tax Rate 2026`;
  const description = `${town.name}, ${town.county} County property tax rate: general ${town.generalRate.toFixed(3)} per $100 assessed and effective ${town.effectiveRate.toFixed(3)} per $100 of market value. Check your assessment and start a tax appeal.`;
  return {
    title,
    description,
    keywords: [
      `${town.name} NJ property tax rate 2026`,
      `${town.name} NJ tax appeal`,
      `${town.name} effective tax rate`,
      `${town.name} assessment check`,
    ],
    alternates: pageCanonical(`/property-tax/${town.slug}`),
    openGraph: { title, description, url: `${SITE_URL}/property-tax/${town.slug}` },
  };
}

export default async function TownTaxPage({ params }: Props) {
  const { town: slug } = await params;
  const town = townTaxPageBySlug(slug);
  if (!town) notFound();
  const muni = asMuni(town);
  const ratio = equalizationRatio(muni);
  const bill500 = taxFromMarketValue(muni, 500000);
  const bill750 = taxFromMarketValue(muni, 750000);
  const marketSlug = cityToSlug(town.name);
  const faqs = [
    {
      question: `What is the property tax rate in ${town.name}, NJ?`,
      answer: `The official 2025 general tax rate in ${town.name} (${town.county} County) is ${town.generalRate.toFixed(3)} per $100 of assessed value. The effective tax rate is ${town.effectiveRate.toFixed(3)} per $100 of market value.`,
    },
    {
      question: `What is the effective tax rate in ${town.name}?`,
      answer: `${town.name}'s effective tax rate is ${town.effectiveRate.toFixed(3)}. That rate already converts market value into an approximate tax bill. The general rate applies only to assessed value.`,
    },
    {
      question: `How much is property tax on a $500,000 home in ${town.name}?`,
      answer: `Using the equalization ratio of ${(ratio * 100).toFixed(2)}%, a $500,000 market value is about $${bill500.assessed.toLocaleString("en-US")} assessed. The approximate annual tax is $${bill500.tax.toLocaleString("en-US")}, which is $500,000 times the effective rate of ${town.effectiveRate.toFixed(3)} per $100.`,
    },
    {
      question: `How do I appeal my ${town.name} property assessment?`,
      answer: `Enter your ${town.name} address on this page. Garden State AI compares the assessment with recent sales under NJ Chapter 123 and, when the numbers support it, prepares the appeal packet.`,
    },
  ];

  return (
    <>
      <JsonLd data={breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Property Tax", path: "/property-tax" },
        { name: town.name, path: `/property-tax/${town.slug}` },
      ])} />
      <JsonLd data={webApplicationSchema({
        name: `${town.name} Property Tax Check`,
        path: `/property-tax/${town.slug}`,
        description: `Official ${town.name}, NJ tax rates and an instant assessment check.`,
      })} />
      <JsonLd data={faqPageSchema(faqs)} />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">{town.county} County, New Jersey</p>
          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{town.name}, N.J. Property Tax Rate 2026</h1>
          <p className="mt-3 text-gray-600">
            Official 2025 Division of Taxation rates for {town.name}. The general rate is per $100 of assessed value. A sale price is not an assessed value.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-gray-50 p-4">
              <dt className="text-xs uppercase text-gray-500">General tax rate</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">{town.generalRate.toFixed(3)}</dd>
              <p className="text-xs text-gray-500">per $100 assessed</p>
            </div>
            <div className="rounded-xl border bg-gray-50 p-4">
              <dt className="text-xs uppercase text-gray-500">Effective tax rate</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">{town.effectiveRate.toFixed(3)}</dd>
              <p className="text-xs text-gray-500">per $100 market value</p>
            </div>
            <div className="rounded-xl border bg-gray-50 p-4">
              <dt className="text-xs uppercase text-gray-500">Equalization ratio</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">{(ratio * 100).toFixed(2)}%</dd>
              <p className="text-xs text-gray-500">assessed ÷ market, from the two rates</p>
            </div>
          </dl>
          <div className="mt-6 rounded-xl border p-5">
            <h2 className="font-bold text-navy">Example tax bills</h2>
            <p className="mt-1 text-sm text-gray-600">Approximation using the effective rate. The general rate is applied to the equalized assessment, not the sticker price.</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>$500,000 market value → assessed about ${bill500.assessed.toLocaleString("en-US")} → about ${bill500.tax.toLocaleString("en-US")}/year</li>
              <li>$750,000 market value → assessed about ${bill750.assessed.toLocaleString("en-US")} → about ${bill750.tax.toLocaleString("en-US")}/year</li>
            </ul>
          </div>
          <form action="/property-tax" method="get" className="mt-8 rounded-2xl bg-navy p-6 text-white">
            <h2 className="text-xl font-bold">Check a {town.name} address</h2>
            <p className="mt-1 text-sm text-gray-200">See the assessment, comps, and whether a Chapter 123 appeal is worth filing.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                name="address"
                required
                placeholder={`123 Main St, ${town.name}, NJ`}
                className="flex-1 rounded-lg px-4 py-3 text-gray-900"
              />
              <button type="submit" className="rounded-lg bg-gold px-5 py-3 font-bold text-navy">
                Check my taxes
              </button>
            </div>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            <Link href={`/market/${marketSlug}`} className="text-indigo-700 hover:underline">{town.name} market report</Link>
            {" · "}
            <Link href={`/search?city=${encodeURIComponent(town.name)}`} className="text-indigo-700 hover:underline">Homes for sale in {town.name}</Link>
            {" · "}
            <Link href="/property-tax" className="text-indigo-700 hover:underline">All NJ tax rates</Link>
          </p>
        </div>
      </section>
      <CityLeadCapture city={town.name} source={`property-tax/${town.slug}`} />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="text-2xl font-bold text-navy">Questions about {town.name} taxes</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-navy">{faq.question}</h3>
              <p className="mt-1 text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-gray-400">
          Source: 2025 General Tax Rates, NJ Division of Taxation. Rates are not a legal opinion and do not include exemptions.
        </p>
      </section>
    </>
  );
}
