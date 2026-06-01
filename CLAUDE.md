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

### Adding New Bugs

When a new bug is found:
1. Add a test case to `test/search-regression.ts`
2. Add a row to the bug registry table above
3. Fix the bug
4. Run `npx tsx test/search-regression.ts` to verify ALL tests pass
5. Only then deploy
