This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Property Tax Appeal (ServiceLadder)

### How the calc works

The property tax overpayment calculator uses NJ's **Chapter 123 Common Level Ratio** method:

1. **Assessment lookup** — get the property's current assessed value from the data provider
2. **Comparable sales** — find recent nearby sales to estimate true market value
3. **Director's Ratio** — the county-wide ratio of assessed-to-market value (from the NJ Table of Equalized Valuations)
4. **Common Level Range** — the Director's Ratio ±15%. If the property's individual ratio (assessed / market) exceeds the upper bound, it's over-assessed
5. **Overpayment** — `(currentAssessment - fairAssessment) × taxRate`, shown as a range based on the comp spread

All math is in `src/lib/service-ladder/property-tax/calc.ts` — pure, deterministic, zero LLM calls.

### Swapping the mock data provider for real data

The `AssessmentDataProvider` interface (`src/lib/service-ladder/property-tax/data-provider.ts`) has three methods:

- `getAssessment(address)` — property assessment data (NJ MOD-IV public records)
- `getComparableSales(address)` — recent nearby sales (county deed records or MLS closed sales)
- `getDirectorRatio(county)` — from the annual NJ Table of Equalized Valuations

To plug in real data, create a new class implementing `AssessmentDataProvider` and swap it in `PropertyTaxAppeal.tsx`:

```ts
import { RealProvider } from "@/lib/service-ladder/property-tax/real-provider";
const provider = new RealProvider();
```

### Adding the next service to the ladder

The **ServiceLadder** abstraction (`src/lib/service-ladder/types.ts`) defines a generic 4-stage funnel: Diagnose → Equip → Connect → Automate. To add a new service (e.g. refinance analysis):

1. Create `src/lib/service-ladder/refinance/types.ts` with your input/result types
2. Create a data provider interface + mock (same pattern as property tax)
3. Create a pure calc module for the deterministic analysis
4. Create a client component implementing the 4 stages
5. Add a route in `src/app/refinance/page.tsx`

Each service owns its own diagnose logic, packet generator, and lead routing while sharing the same stage progression model.

### Running tests

```bash
npx tsx src/lib/service-ladder/property-tax/calc.test.ts
```

Tests cover 3 scenarios: overpaying, fairly assessed, and under-assessed.
