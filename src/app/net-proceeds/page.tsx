import type { Metadata } from "next";
import NetProceedsClient from "@/components/NetProceedsClient";

export const metadata: Metadata = {
  title: "Net Proceeds Calculator | What Will I Walk Away With?",
  description:
    "Calculate your net proceeds from selling your NJ home. Includes NJ Realty Transfer Fee, commission, closing costs, and sell vs rent comparison.",
  keywords: [
    "net proceeds calculator NJ", "selling costs NJ", "NJ realty transfer fee",
    "closing costs NJ", "sell vs rent calculator", "what will I net selling my house",
  ],
};

export default function NetProceedsPage() {
  return <NetProceedsClient />;
}
