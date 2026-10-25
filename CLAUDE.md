@AGENTS.md

## Regression Tests — MANDATORY

**Before every deploy**, run the search regression test suite:

```
npx tsx test/search-regression.ts
```

This suite contains every bug found and fixed. If any test fails, DO NOT deploy — fix it first.

### Bug Registry (all bugs must stay fixed)

| ID | Bug | Root Cause | Fix |
|----|-----|-----------|-----|
| PARSE-001 | "200 mil dolares" not parsed | Regex too strict | AI parser replaces regex |
| PARSE-002 | City not extracted sometimes | GPT-4o-mini inconsistency | Sonnet + fallback |
| PARSE-004 | County search not working | No county param support | Added county to API + UI |
| PARSE-007 | "doscientos mil" not parsed | Speech-to-text variations | AI prompt handles STT |
| PARSE-010 | "Paramus" converted to "Bergen County" | AI inferred county from city | Prompt: city names stay as city |
| PARSE-012 | "2 dormitorios" beds not extracted | Parser missed Spanish | AI parser handles all languages |
| SEARCH-001 | Hero search didn't execute on load | useEffect loop with searchParams | Single mount effect + key remount |
| SEARCH-002 | Shared URLs caused infinite loop | URL param order mismatch | Sorted param comparison |
| SEARCH-003 | Morristown stayed when searching Wayne | Component didn't remount | page.tsx key={searchParams} |
| SEARCH-006 | Multi-Family in Elmwood Park = 0 results | NJMLS stores all as "Residential" | Fallback to public_remarks search |
| SEARCH-008 | beds=2 showed 3+ bed homes first | No bedroom sort | Sort by bedrooms ASC when filter active |
| UI-001 | City input: can't select-all + delete | Debounce + sync overwrite | Focus tracking prevents sync while typing |
| UI-002 | Price dropdowns didn't show AI values (700k) | Fixed select options | Replaced with text inputs |
| UI-003 | Vale bubble truncated responses | Only showed 2 sentences | Full text + scroll + "Open chat" link |
| UI-004 | Chat page scrolled behind footer | h-calc with footer | Fixed positioning below navbar |
| UI-005 | Chat input lost focus after response | focus() before re-render | setTimeout focus after state update |
| CMA-001 | 37 Summit Ave not found for CMA | Property not in MLS | Added NJ MOD-IV public records lookup |
| CMA-002 | CMA showed comparable addresses in free tier | No restriction | Prompt: hide addresses in quick estimate |
| WA-001 | Vale side panel interfered with search | Hero opened Vale + search | Removed Vale send from hero |
| CMA-003 | CMA from search page hero went to search instead of chat | Search page hero missing CMA detection | Added same CMA regex to search page hero |
| CMA-004 | "análisis de mercado" not detected as CMA | Accented á not matched by regex | Normalize accents before regex test |
| UI-006 | Price input only accepts 1 digit | updateFilter fires doSearch on every keystroke | Local state + search on blur/Enter (same pattern as city input UI-001) |
| TAX-001 | Common Level Range showed 5403%–7309% | API sends percentage points (54.03); formatPercent multiplied by 100 again | formatPercent treats values above 2 as already-percent |
| TAX-002 | Tax Shock said comps support a lower assessment when every sale was above it | Headline was hardcoded | Copy is derived from sale price vs assessment |
| TAX-003 | Property ratio 61.7% looked like it contradicted equalization 63.56% | Different measures rendered without labels; API text said "near the upper limit" when the ratio sat by the county average | Both pages label the two ratios, and that clause is corrected when the numbers are not near the ceiling |
| UI-007 | /chat showed raw markdown | Assistant text rendered as plain text | Safe markdown renderer (bold, headings, rules, lists, links) |
| UI-008 | Get My Report / Get Free Estimate dumped into a blank chat for 15–30s | Address boxes redirected to /chat?q=CMA | They open /value, which loads a report from the pricing API with a visible waiting state |
| RENO-001 | $25k floor refinish kept 83% recovery and “Worth it? Yes” | Recovery ignored spend above the typical budget | Spend above the typical maximum recovers at a declining rate |
| COPY-001 | Homepage claimed 60,000+ MLS listings | Figure mixed MLS estimates and did not match the active search index (~9,100) | Claims use the live active listing total |
| ADMIN-001 | Admin blog, leads, and MyHome called Railway from the browser | Blog tab sent the UI password as Bearer; MyHome used a profiles path the API does not serve | Those calls go through /api/admin/proxy; profiles use /api/idx/myhome/admin/profiles |
| TAX-005 | Appeal form and PDF said Tax Year 2026 against 2027 ratios | Tax Year defaulted to the calendar year and was never set from the analyze API | Form uses API taxYear, else the tax year whose April 1 deadline is next; results label that year |
| TAX-006 | Multi-unit / Class 4 analysis showed $0–$0 savings and a case badge | API sets savingsSuppressed and zeroes the dollars; the UI still rendered them | Suppressed results hide savings and case strength and show the attorney warning |
| TAX-007 | No-case homes showed Estimated Overpayment $0–$5,738 and the tax-shock package said overpaying | Savings rendered whenever the API had not suppressed them, including a $0 low and a no-case verdict | Savings and overpayment show only for a strong or moderate case with a positive high; $0 high and other cases use neutral text |
| VALE-001 | Vale invented Paramus $2.10–$2.30 and Hackensack $2.40–$2.60 and applied them to sale price | No municipal rate source; the model answered from memory | 2025 NJ general and effective rates for all 564 municipalities are injected into Vale, which is told never to state a rate from memory. Price estimates use the equalization ratio or the effective rate |
| SEO-001 | Every public URL advertised the homepage canonical, so Google would not index property, market, tax, and tool pages | Root layout set `alternates.canonical` to the homepage and child routes did not override it; `headers()` also forced `no-store` | Homepage canonical lives on `/` only. Each public route sets its own canonical. Layout no longer reads headers. Sitemap lists `/news`, market cities, 564 town tax pages, and active listings. Named AI search bots may crawl public tools |
| INDEXNOW-001 | New and updated Garden State AI URLs were not pushed to Bing and other IndexNow engines | No key file and no submission client | Public key file, robots and middleware allow it, and URL lists submit to IndexNow in batches of 10,000 |
| MONITOR-001 | A repeating check was suspected of valuing 119 W 21st St and 155 W 3rd St in Bayonne | Those lookups bill Perplexity and Bright Data | No cron, workflow, or health check calls a valuation or tax-appeal lookup. The 30-minute script only hits search and market endpoints. The Bayonne addresses remain only in an in-memory tax fixture |
| SQFT-001 | $0/sqft and 0 sqft appeared when area was missing | pricePerSqft 0 and living_area 0 were rendered as real measurements | Zero, blank, and null area or price per square foot are omitted on /value, tax pages, and listing cards |
| VAL-001 | /value and the tax pages could drift from the API market value | A missing price per square foot could be filled in from another estimate | /value shows the pricing API estimatedValue. /property-tax and /tax-shock show the tax-appeal API market value and do not copy the pricing estimate or a zestimate over it |

### Adding New Bugs

When a new bug is found:
1. Add a test case to `test/search-regression.ts`
2. Add a row to the bug registry table above
3. Fix the bug
4. Run `npx tsx test/search-regression.ts` to verify ALL tests pass
5. Only then deploy
