import {
  findMunicipalities,
  marketPricesIn,
  municipalityLabel,
  equalizationRatio,
  taxFromMarketValue,
  NJ_TAX_RATE_SOURCE,
  NJ_TAX_RATE_YEAR,
  type NjMunicipality,
} from "@/lib/nj-tax-rates";
import { nextAppealTaxYear } from "@/lib/tax-display";
import { isRevaluationYear, NJ_REVALUATION_SOURCE } from "@/lib/nj-revaluations";

/**
 * Standing rule sent with Vale chat sessions and with any turn that touches taxes.
 * The IDX chat API ignores a separate system-prompt field, so this rides in the
 * session context and in the grounded user turn the model actually reads.
 */
export const VALE_TAX_RATE_POLICY =
  "Never state a New Jersey municipal tax rate, equalization ratio, or tax bill from memory. Use only the 2025 NJ Division of Taxation figures supplied in this conversation. General tax rates apply per $100 of assessed value. A sale price is not an assessed value. Convert a price to assessed value with the equalization ratio, or label the figure as an approximation using the effective tax rate.";

const NO_MUNICIPALITY_REPLY =
  "Tell me the New Jersey municipality and I will use its official 2025 general tax rate from the NJ Division of Taxation. I don't state a tax rate from memory.";

const BAD_APPEAL_VENUE = /tax board of appeals|county court|tax assessor/i;

export function isTaxRateQuestion(text: string): boolean {
  if (/\btax\s*rates?\b|per\s*\$?\s*100|equalization|millage/i.test(text)) return true;
  return findMunicipalities(text).length > 0 && /\b(property\s*tax(?:es)?|taxes|tax|tax\s*bill)\b/i.test(text);
}

/** Filing steps, the county board, or Chapter 123 — not a rate lookup. */
export function isAppealProcedureQuestion(text: string): boolean {
  if (/\bchapter\s*123\b/i.test(text)) return true;
  if (/\b(petition of appeal|county board of taxation|tax court)\b/i.test(text)) return true;
  if (/\bappeal(?:s|ed|ing)?\b/i.test(text) && /\b(property\s*tax(?:es)?|tax(?:es)?|assessment|assessed)\b/i.test(text)) return true;
  return false;
}

/** Tax year the appeal question is about. A bare "2025 rate" does not change it. */
export function appealYearInQuestion(text: string, now = new Date()): number {
  const labeled = text.match(/\b(?:tax\s*year|revaluation|reassessment)\s+(?:of\s+|for\s+|in\s+)?(20\d{2})\b/i)
    || text.match(/\b(20\d{2})\s+(?:tax\s*year|revaluation|reassessment|tax\s+appeal|appeal)\b/i);
  if (labeled) {
    const year = Number(labeled[1]);
    if (year >= 1990 && year <= 2100) return year;
  }
  return nextAppealTaxYear(now);
}

export function countyBoardName(county: string): string {
  const titled = county.trim().toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  return `${titled} County Board of Taxation`;
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

function filingSentence(towns: NjMunicipality[]): string {
  const boards = [...new Set(towns.map((town) => countyBoardName(town.county)))];
  if (boards.length === 1) return `File the property tax appeal with the ${boards[0]}.`;
  return `File the property tax appeal with the ${boards.slice(0, -1).join(", the ")} and the ${boards[boards.length - 1]}.`;
}

function appealGrounding(towns: NjMunicipality[], year: number): string {
  if (!towns.length) {
    return "This is a property-tax appeal procedure question. File with the County Board of Taxation for the property's county. A further appeal is to the Tax Court of New Jersey. Name that county board and the Tax Court of New Jersey, and answer the filing steps. Do not replace the procedure with a rate-only reply.";
  }
  const lines = [
    `This is a property-tax appeal procedure question. ${filingSentence(towns)} A further appeal is to the Tax Court of New Jersey. Name that county board and the Tax Court of New Jersey, and answer the filing steps. Do not replace the procedure with a rate-only reply.`,
  ];
  for (const town of towns) {
    if (!isRevaluationYear(town, year)) continue;
    lines.push(
      `${municipalityLabel(town)} is on the ${year} revaluation and reassessment list (${NJ_REVALUATION_SOURCE}). Chapter 123 does not apply this year. Do not state an equalization ratio or a common level range. Compare the assessment to market value. The county filing deadline is May 1, ${year}.`,
    );
  }
  return lines.join(" ");
}

function townFacts(muni: NjMunicipality, prices: number[], omitRatio: boolean): string {
  const label = municipalityLabel(muni);
  if (omitRatio) {
    const lines = [
      `${label}: ${NJ_TAX_RATE_YEAR} general tax rate ${muni.generalRate.toFixed(3)} per $100 of assessed value; ${NJ_TAX_RATE_YEAR} effective tax rate ${muni.effectiveRate.toFixed(3)} per $100 of market value. Chapter 123 does not apply this year. Do not state an equalization ratio or a common level range.`,
    ];
    for (const price of prices) {
      const { tax } = taxFromMarketValue(muni, price);
      lines.push(
        `${money(price)} market value in ${label}: ${NJ_TAX_RATE_YEAR} effective-rate approximation, tax ≈ ${money(tax)} (${money(price)} × ${muni.effectiveRate.toFixed(3)} / 100). Do not convert that price with an equalization ratio, and do not multiply the general rate ${muni.generalRate.toFixed(3)} by the sale price.`,
      );
    }
    return lines.join(" ");
  }
  const lines = [
    `${label}: ${NJ_TAX_RATE_YEAR} general tax rate ${muni.generalRate.toFixed(3)} per $100 of assessed value; ${NJ_TAX_RATE_YEAR} effective tax rate ${muni.effectiveRate.toFixed(3)} per $100 of market value; ${NJ_TAX_RATE_YEAR} equalization ratio ${ratioLabel(muni)}.`,
  ];
  for (const price of prices) {
    const { assessed, tax } = taxFromMarketValue(muni, price);
    lines.push(
      `${money(price)} market value in ${label}: assessed value ≈ ${money(assessed)} (${money(price)} × ${ratioLabel(muni)}). Tax ≈ ${money(tax)}. That is ${money(price)} × ${muni.effectiveRate.toFixed(3)} / 100, an approximation using the ${NJ_TAX_RATE_YEAR} effective rate. Do not multiply the general rate ${muni.generalRate.toFixed(3)} by the sale price.`,
    );
  }
  return lines.join(" ");
}

/** Official figures prepended to a Vale turn. Unrelated messages stay unchanged. */
export function toValeModelMessage(userText: string, now = new Date()): string {
  const towns = findMunicipalities(userText);
  const taxQuestion = isTaxRateQuestion(userText);
  const appealQuestion = isAppealProcedureQuestion(userText);
  if (!taxQuestion && !appealQuestion) return userText;

  const year = appealYearInQuestion(userText, now);
  const lines = [VALE_TAX_RATE_POLICY, ""];
  if (appealQuestion) {
    lines.push(appealGrounding(towns, year), "");
  }
  if (towns.length === 0) {
    lines.push("No municipality from the 2025 NJ Division of Taxation table was named. Do not supply a municipal tax rate.");
  } else {
    lines.push(`Official ${NJ_TAX_RATE_YEAR} figures from ${NJ_TAX_RATE_SOURCE}. Label these rates ${NJ_TAX_RATE_YEAR}:`);
    const prices = marketPricesIn(userText);
    for (const town of towns) lines.push(townFacts(town, prices, isRevaluationYear(town, year)));
  }
  lines.push("", `User question: ${userText}`);
  return lines.join("\n");
}

function rateLines(towns: NjMunicipality[], year: number, prices: number[]): string[] {
  const lines = [
    `These are the official ${NJ_TAX_RATE_YEAR} general tax rates from the NJ Division of Taxation. A general rate is per $100 of assessed value, not the sale price. Label these rates ${NJ_TAX_RATE_YEAR}.`,
    "",
  ];
  for (const town of towns) {
    if (isRevaluationYear(town, year)) {
      lines.push(
        `${municipalityLabel(town)}: ${NJ_TAX_RATE_YEAR} general tax rate ${town.generalRate.toFixed(3)}. ${NJ_TAX_RATE_YEAR} effective tax rate ${town.effectiveRate.toFixed(3)} per $100 of market value. Chapter 123 does not apply for tax year ${year}, so this reply does not state an equalization ratio or a common level range.`,
      );
    } else {
      lines.push(
        `${municipalityLabel(town)}: ${NJ_TAX_RATE_YEAR} general tax rate ${town.generalRate.toFixed(3)}. ${NJ_TAX_RATE_YEAR} effective tax rate ${town.effectiveRate.toFixed(3)} per $100 of market value. ${NJ_TAX_RATE_YEAR} equalization ratio ${ratioLabel(town)}, so assessed value is about ${ratioLabel(town)} of market value.`,
      );
    }
  }
  if (prices.length) {
    lines.push("", "A sale price has to be converted to assessed value before the general rate applies. The effective rate is the approximation on market value:");
    for (const price of prices) {
      for (const town of towns) {
        const { assessed, tax } = taxFromMarketValue(town, price);
        if (isRevaluationYear(town, year)) {
          lines.push(
            `${municipalityLabel(town)} on ${money(price)}: ${NJ_TAX_RATE_YEAR} effective-rate approximation, annual tax ≈ ${money(tax)} (${money(price)} × ${town.effectiveRate.toFixed(3)} / 100).`,
          );
        } else {
          lines.push(
            `${municipalityLabel(town)} on ${money(price)}: assessed value ≈ ${money(assessed)}, annual tax ≈ ${money(tax)} (${money(price)} × ${town.effectiveRate.toFixed(3)} / 100).`,
          );
        }
      }
    }
  }
  return lines;
}

/** User-facing answer built only from the official table. */
export function canonicalTaxAnswer(userText: string, towns = findMunicipalities(userText), now = new Date()): string {
  if (!towns.length) return NO_MUNICIPALITY_REPLY;
  const year = appealYearInQuestion(userText, now);
  const lines = rateLines(towns, year, marketPricesIn(userText));
  lines.push("", `Source: ${NJ_TAX_RATE_SOURCE}`);
  return lines.join("\n");
}

/** Procedure answer. Never a rate card, and never a town board or county court. */
export function canonicalAppealAnswer(userText: string, towns = findMunicipalities(userText), now = new Date()): string {
  const year = appealYearInQuestion(userText, now);
  if (!towns.length) {
    return [
      "File the property tax appeal with the County Board of Taxation in the county where the property is located. A further appeal is to the Tax Court of New Jersey.",
      `Tell me the New Jersey municipality and I will name that county board. Official rates stay labeled ${NJ_TAX_RATE_YEAR}.`,
      `Source: ${NJ_TAX_RATE_SOURCE}`,
    ].join("\n\n");
  }
  const lines = [
    `${filingSentence(towns)} A further appeal is to the Tax Court of New Jersey.`,
  ];
  for (const town of towns) {
    if (isRevaluationYear(town, year)) {
      lines.push(
        `${municipalityLabel(town)} is in a revaluation or reassessment year for tax year ${year} (${NJ_REVALUATION_SOURCE}). Chapter 123 does not apply this year. Compare the assessment to market value. The county filing deadline is May 1, ${year}.`,
      );
    } else {
      lines.push(
        `${municipalityLabel(town)}: for tax year ${year}, file with the ${countyBoardName(town.county)}. Chapter 123 can apply when the property ratio is outside the county common level range.`,
      );
    }
  }
  lines.push(...rateLines(towns, year, marketPricesIn(userText)));
  lines.push("", `Source: ${NJ_TAX_RATE_SOURCE}`);
  return lines.join("\n\n");
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

function allowedRates(towns: NjMunicipality[], userText: string, now: Date): number[] {
  const year = appealYearInQuestion(userText, now);
  const allowed: number[] = [];
  for (const town of towns) {
    allowed.push(town.generalRate, town.effectiveRate);
    if (!isRevaluationYear(town, year)) {
      allowed.push(Math.round(equalizationRatio(town) * 10000) / 100);
    }
  }
  return allowed;
}

/** True when the model quoted the official general rates and did not invent another per-$100 rate. */
export function replyMatchesOfficialRates(
  userText: string,
  reply: string,
  towns = findMunicipalities(userText),
  now = new Date(),
): boolean {
  if (!towns.length) return false;
  const year = appealYearInQuestion(userText, now);
  for (const town of towns) {
    if (!reply.includes(town.generalRate.toFixed(3))) return false;
    if (isRevaluationYear(town, year) && reply.includes(ratioLabel(town))) return false;
  }
  const allowed = allowedRates(towns, userText, now);
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

export function appealReplyKeepsProcedure(
  userText: string,
  reply: string,
  towns = findMunicipalities(userText),
  now = new Date(),
): boolean {
  if (!reply.trim() || BAD_APPEAL_VENUE.test(reply)) return false;
  if (!/Tax Court of New Jersey/i.test(reply)) return false;
  if (!towns.length) return /County Board of Taxation/i.test(reply);
  for (const town of towns) {
    if (!reply.includes(countyBoardName(town.county))) return false;
  }
  const year = appealYearInQuestion(userText, now);
  for (const town of towns) {
    if (!isRevaluationYear(town, year)) continue;
    if (!/chapter 123 does not apply/i.test(reply)) return false;
    if (reply.includes(ratioLabel(town))) return false;
    if (/common level range\s*(?:of|is|:)?\s*\d/i.test(reply)) return false;
    if (/equalization ratio\s*(?:of|is|:)?\s*\d/i.test(reply)) return false;
  }
  return true;
}

/**
 * Keep a model reply only when it sticks to the official table.
 * Appeal procedure questions keep a real procedure answer. They are not
 * replaced with a rate card. Tax-rate questions with no named town, or a
 * reply that invents a rate, are replaced.
 */
export function finalizeValeReply(userText: string, modelReply: string, now = new Date()): string {
  const towns = findMunicipalities(userText);
  if (isAppealProcedureQuestion(userText)) {
    if (appealReplyKeepsProcedure(userText, modelReply, towns, now)) return modelReply;
    return canonicalAppealAnswer(userText, towns, now);
  }
  if (isTaxRateQuestion(userText) && towns.length === 0) return NO_MUNICIPALITY_REPLY;
  if (towns.length === 0) return modelReply;
  if (replyMatchesOfficialRates(userText, modelReply, towns, now)) return modelReply;
  const invented = rateCandidates(modelReply).some((candidate) => !allowedRates(towns, userText, now).some((rate) => close(rate, candidate)));
  if (isTaxRateQuestion(userText) || invented) return canonicalTaxAnswer(userText, towns, now);
  return modelReply;
}
