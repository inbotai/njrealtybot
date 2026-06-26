import type { Metadata } from "next";
import NetProceedsClient from "@/components/NetProceedsClient";

export const metadata: Metadata = {
  title: { absolute: "NJ Home Sale Net Proceeds Calculator \u2014 How Much Will I Make? | Garden State AI" },
  description:
    "Calculate exactly how much you'll take home when you sell your NJ property. Includes NJ Realty Transfer Fee, agent commissions, closing costs, and mortgage payoff.",
  keywords: [
    "NJ home sale proceeds calculator",
    "NJ realty transfer fee calculator",
    "how much will I make selling my house NJ",
    "closing costs NJ seller",
  ],
  alternates: {
    canonical: "https://gardenstate.ai/net-proceeds",
  },
  openGraph: {
    type: "website",
    title: "NJ Home Sale Net Proceeds Calculator \u2014 How Much Will I Make? | Garden State AI",
    description:
      "Calculate exactly how much you'll take home when you sell your NJ property. Includes NJ Realty Transfer Fee, agent commissions, closing costs, and mortgage payoff.",
    url: "https://gardenstate.ai/net-proceeds",
  },
  twitter: {
    card: "summary_large_image",
    title: "NJ Home Sale Net Proceeds Calculator \u2014 How Much Will I Make? | Garden State AI",
    description:
      "Calculate exactly how much you'll take home when you sell your NJ property. Includes NJ Realty Transfer Fee, agent commissions, closing costs, and mortgage payoff.",
  },
};

export default function NetProceedsPage() {
  return <NetProceedsClient />;
}
