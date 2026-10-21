import {
  findMunicipalities,
  marketPricesIn,
  municipalityLabel,
  equalizationRatio,
  taxFromMarketValue,
  NJ_TAX_RATE_SOURCE,
  type NjMunicipality,
} from "@/lib/nj-tax-rates";

/**
 * Standing rule sent with Vale chat sessions and with any turn that touches taxes.
 * The IDX chat API ignores a separate system-prompt field, so this rides in the
 * session context and in the grounded user turn the model actually reads.
 */
export const VALE_TAX_RATE_POLICY =
  "Never state a New Jersey municipal tax rate, equalization ratio, or tax bill from memory. Use only the 2025 NJ Division of Taxation figures supplied in this conversation. General tax rates apply per $100 of assessed value. A sale price is not an assessed value. Convert a price to assessed value with the equalization ratio, or label the figure as an approximation using the effective tax rate.";

const NO_MUNICIPALITY_REPLY =
  "Tell me the New Jersey municipality and I will use its official 2025 general tax rate from the NJ Division of Taxation. I don't state a tax rate from memory.";

export function isTaxRateQuestion(text: string): boolean {
  if (/\btax\s*rates?\b|per\s*\$?\s*100|equalization|millage/i.test(text)) return true;
  return findMunicipalities(text).length > 0 && /\b(property\s*tax(?:es)?|taxes|tax|tax\s*bill)\b/i.test(text);
}

export function valeStartBody(extra: Record<string, unknown> = {}): Record<string, unknown> {
  const prior = typeof extra.context === "string" ? extra.context.trim() : "";
  return {
    ...extra,
    context: prior ? `${VALE_TAX_RATE_POLICY}\n\n${prior}` : VALE_TAX_RATE_POLICY,
  };
}

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function ratioLabel(muni: NjMunicipality): string {
  return `${(equalizationRatio(muni) * 100).toFixed(2)}%`;
}

function townFacts(muni: NjMunicipality, prices: number[]): string {
  const lines = [
    `${municipalityLabel(muni)}: general tax rate ${muni.generalRate.toFixed(3)} per $100 of assessed value; effective tax rate ${muni.effectiveRate.toFixed(3)} per $100 of market value; equalization ratio ${ratioLabel(muni)}.`,
  ];
  for (const price of prices) {
    const { assessed, tax } = taxFromMarketValue(muni, price);
    lines.push(
      `${money(price)} market value in ${municipalityLabel(muni)}: assessed value ≈ ${money(assessed)} (${money(price)} × ${ratioLabel(muni)}). Tax ≈ ${money(tax)}. That is ${money(price)} × ${muni.effectiveRate.toFixed(3)} / 100, an approximation using the effective rate. Do not multiply the general rate ${muni.generalRate.toFixed(3)} by the sale price.`,
    );
  }
  return lines.join(" ");
}

/** Official figures prepended to a Vale turn. Unrelated messages stay unchanged. */
export function toValeModelMessage(userText: string): string {
  const towns = findMunicipalities(userText);
  const taxQuestion = isTaxRateQuestion(userText);
  if (!taxQuestion && towns.length === 0) return userText;

  const lines = [VALE_TAX_RATE_POLICY, ""];
  if (towns.length === 0) {
    lines.push("No municipality from the 2025 NJ Division of Taxation table was named. Do not supply a municipal tax rate.");
  } else {
    lines.push(`Official 2025 figures from ${NJ_TAX_RATE_SOURCE}:`);
    const prices = marketPricesIn(userText);
    for (const town of towns) lines.push(townFacts(town, prices));
  }
  lines.push("", `User question: ${userText}`);
  return lines.join("\n");
}

/** User-facing answer built only from the official table. */
export function canonicalTaxAnswer(userText: string, towns = findMunicipalities(userText)): string {
  if (!towns.length) return NO_MUNICIPALITY_REPLY;
  const prices = marketPricesIn(userText);
  const lines = [
    "These are the official 2025 general tax rates from the NJ Division of Taxation. A general rate is per $100 of assessed value, not the sale price.",
    "",
  ];
  for (const town of towns) {
    lines.push(
      `${municipalityLabel(town)}: general tax rate ${town.generalRate.toFixed(3)}. Effective tax rate ${town.effectiveRate.toFixed(3)} per $100 of market value. Equalization ratio ${ratioLabel(town)}, so assessed value is about ${ratioLabel(town)} of market value.`,
    );
  }
  if (prices.length) {
    lines.push("", "A sale price has to be converted to assessed value before the general rate applies. The effective rate is the approximation on market value:");
    for (const price of prices) {
      for (const town of towns) {
        const { assessed, tax } = taxFromMarketValue(town, price);
        lines.push(
          `${municipalityLabel(town)} on ${money(price)}: assessed value ≈ ${money(assessed)}, annual tax ≈ ${money(tax)} (${money(price)} × ${town.effectiveRate.toFixed(3)} / 100).`,
        );
      }
    }
  }
  lines.push("", `Source: ${NJ_TAX_RATE_SOURCE}`);
  return lines.join("\n");
}

function rateCandidates(reply: string): number[] {
  const found: number[] = [];
  const grab = (value: string) => {
    const n = Number(value);
    if (Number.isFinite(n)) found.push(n);
  };
  for (const match of reply.matchAll(/(?:\$\s*)?(\d{1,2}\.\d{2,3})\s*(?:per|\/)\s*\$?\s*100/gi)) grab(match[1]);
  for (const match of reply.matchAll(/(?:\$\s*)?(\d{1,2}\.\d{2,3})\s*[–—-]\s*(?:\$\s*)?(\d{1,2}\.\d{2,3})/g)) {
    grab(match[1]);
    grab(match[2]);
  }
  for (const match of reply.matchAll(/(?:about|around|roughly|approximately|approx\.?)\s*\$?\s*(\d{1,2}\.\d{2,3})/gi)) grab(match[1]);
  return found;
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.0015;
}

function allowedRates(towns: NjMunicipality[]): number[] {
  const allowed: number[] = [];
  for (const town of towns) {
    allowed.push(town.generalRate, town.effectiveRate, Math.round(equalizationRatio(town) * 10000) / 100);
  }
  return allowed;
}

/** True when the model quoted the official general rates and did not invent another per-$100 rate. */
export function replyMatchesOfficialRates(userText: string, reply: string, towns = findMunicipalities(userText)): boolean {
  if (!towns.length) return false;
  for (const town of towns) {
    if (!reply.includes(town.generalRate.toFixed(3))) return false;
  }
  const allowed = allowedRates(towns);
  for (const candidate of rateCandidates(reply)) {
    if (!allowed.some((rate) => close(rate, candidate))) return false;
  }
  for (const price of marketPricesIn(userText)) {
    for (const town of towns) {
      const correct = Math.round(price * town.effectiveRate / 100);
      const wrong = Math.round(price * town.generalRate / 100);
      const hasCorrect = reply.includes(correct.toLocaleString("en-US")) || reply.includes(String(correct));
      if (!hasCorrect) return false;
      if (wrong !== correct) {
        const wrongText = wrong.toLocaleString("en-US");
        if (reply.includes(wrongText) || reply.includes(String(wrong))) return false;
      }
    }
  }
  return true;
}

/**
 * Keep a model reply only when it sticks to the official table.
 * Tax-rate questions with no named town, or a reply that invents a rate, are replaced.
 */
export function finalizeValeReply(userText: string, modelReply: string): string {
  const towns = findMunicipalities(userText);
  if (isTaxRateQuestion(userText) && towns.length === 0) return NO_MUNICIPALITY_REPLY;
  if (towns.length === 0) return modelReply;
  if (replyMatchesOfficialRates(userText, modelReply, towns)) return modelReply;
  const invented = rateCandidates(modelReply).some((candidate) => !allowedRates(towns).some((rate) => close(rate, candidate)));
  if (isTaxRateQuestion(userText) || invented) return canonicalTaxAnswer(userText, towns);
  return modelReply;
}
