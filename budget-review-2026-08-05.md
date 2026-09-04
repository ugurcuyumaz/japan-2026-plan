I'll read all the referenced files first, then perform the full arithmetic review.Now I have all the data. Let me perform the full arithmetic review.

---

# BUDGET ARITHMETIC REVIEW

## (a) Reconciliation Table — Section Subtotals

### Leg 1 — Re-addition of ¥ column

| Line | Low ¥ | High ¥ |
|---|---|---|
| Accommodation, 10 nights | 111,760 | 143,760 |
| JR pass ×2 | 80,000 | 80,000 |
| NRT → New Chitose ×2 | 21,000 | 30,000 |
| Rail off-pass | 14,000 | 21,000 |
| Local buses/trams | 12,000 | 18,000 |
| Entry tickets | 15,500 | 19,500 |
| Food, 11 days | 80,500 | 140,000 |
| Halloween night | 12,000 | 17,000 |
| Costumes | 6,000 | 12,000 |
| Noboribetsu buses etc. | 3,800 | 7,800 |
| Breakfasts, 8 mornings | 4,000 | 8,000 |
| **MY SUM** | **360,560** | **497,060** |
| **Stated subtotal** | **360,560** | **497,060** |

**Leg 1 ¥ sum: ✅ matches.**

**Leg 1 € conversion:**
- Low: 360,560 / 186 = 1,938.49 → stated €1,938 ✅
- High: 497,060 / 186 = 2,672.37 → stated €2,672 ✅

**Leg 1 Centre:**
- (1,938 + 2,672) / 2 = 2,305 → stated €2,305 ✅

---

### Leg 2 — Re-addition of ¥ column

| Line | Low ¥ | High ¥ |
|---|---|---|
| Tokyu Stay, 8 nights | 80,000 | 168,000 |
| Kamakura + Enoshima | 12,600 | 16,400 |
| Workshops | 11,660 | 18,260 |
| Local transit, 8 days | 12,500 | 17,000 |
| TYO-NRT bus ×2 | 3,000 | 3,000 |
| Entry / activities | 9,500 | 13,000 |
| Food, 8 days | 44,000 | 76,000 |
| Breakfasts, 8 mornings | 4,000 | 8,000 |
| **MY SUM** | **177,260** | **319,660** |
| **Stated subtotal** | **177,260** | **319,660** |

**Leg 2 ¥ sum: ✅ matches.**

**Leg 2 € conversion:**
- Low: 177,260 / 186 = 953.01 → stated €953 ✅
- High: 319,660 / 186 = 1,718.60 → stated €1,719 ✅ (rounds up correctly)

**Leg 2 Centre:**
- (953 + 1,719) / 2 = 1,336 → stated €1,336 ✅

---

### Trip-wide — Re-addition

| Line | Low ¥ | High ¥ |
|---|---|---|
| eSIM | 3,000 | 5,000 |
| Travel insurance | 11,000 | 22,000 |
| **MY SUM** | **14,000** | **27,000** |
| **Stated subtotal** | **14,000** | **27,000** |

**Trip-wide ¥ sum: ✅ matches.**

**Trip-wide € conversion:**
- Low: 14,000 / 186 = 75.27 → stated €75 ✅
- High: 27,000 / 186 = 145.16 → stated €145 ✅

**Trip-wide Centre:**
- (75 + 145) / 2 = 110 → stated implicitly via total. ✅

---

### Whole Trip Total

| | Low € | High € |
|---|---|---|
| Leg 1 | 1,938 | 2,672 |
| Leg 2 | 953 | 1,719 |
| Trip-wide | 75 | 145 |
| **MY SUM** | **2,966** | **4,536** |
| **Stated total** | **2,966** | **4,536** |

**Total: ✅ matches.**

**Whole-trip Centre:**
- (2,966 + 4,536) / 2 = 3,751 → stated €3,751 ✅

---

### ❌ ONE DISCREPANCY: Leg 2 high-end in the "Whole trip" table

The "Whole trip" summary table in BUDGET.md states:

> | Leg 2 (3–11 Nov) | 953–**1,716** |

But the Leg 2 section header states **€953–1,719** and the ¥ sum (319,660 / 186 = 1,718.6 → 1,719) confirms **1,719**.

The total still says 4,536, which is 2,672 + 1,719 + 145 = 4,536. So the total was computed with the CORRECT 1,719, but the **summary table cell says 1,716 — a typo, off by €3.**

| Section | Stated | Recomputed | |
|---|---|---|---|
| Leg 1 subtotal (¥) | 360,560–497,060 | 360,560–497,060 | ✅ |
| Leg 1 subtotal (€) | 1,938–2,672 | 1,938–2,672 | ✅ |
| Leg 1 centre | 2,305 | 2,305 | ✅ |
| Leg 2 subtotal (¥) | 177,260–319,660 | 177,260–319,660 | ✅ |
| Leg 2 subtotal (€) | 953–1,719 | 953–1,719 | ✅ |
| Leg 2 centre | 1,336 | 1,336 | ✅ |
| Trip-wide subtotal | 75–145 | 75–145 | ✅ |
| **Summary table Leg 2 high** | **1,716** | **1,719** | ❌ **typo** |
| Total | 2,966–4,536 | 2,966–4,536 | ✅ |
| Total centre | 3,751 | 3,751 | ✅ |
| Spread | 1,570 | 1,570 | ✅ |

---

## (b) FX Mismatch Table

**Declared rate: ¥186 = €1.** I checked every ¥/€ pair across all files.

| File | Item | ¥ | € stated | Implied rate | Verdict |
|---|---|---|---|---|---|
| ACCOMMODATION.md | Noboribetsu ¥28,760 | 28,760 | €155 | 185.5 | ⚠️ off by €0.4 — rounding artifact |
| ACCOMMODATION.md | Nikko ¥11,000 | 11,000 | €59 | 186.4 | ✅ rounding |
| ACCOMMODATION.md | Tokyu Stay 8n high: ¥168,000 | 168,000 | €903 | 186.0 | ✅ |
| ACCOMMODATION.md | Tokyu Stay 8n low: ¥80,000 | 80,000 | €430 | 186.0 | ✅ |
| BUDGET.md | JR pass ¥80,000 | 80,000 | €430 | 186.0 | ✅ |
| BUDGET.md | Halloween low ¥12,000 | 12,000 | €65 | 184.6 | ⚠️ 12,000/186 = 64.5 → should round to €65. OK |
| BUDGET.md | Halloween high ¥17,000 | 17,000 | €91 | 186.8 | ✅ rounding |
| BUDGET.md | Costumes low ¥6,000 | 6,000 | €32 | 187.5 | ⚠️ 6,000/186 = 32.26. Rounds to €32. OK |
| BUDGET.md | Costumes high ¥12,000 | 12,000 | €65 | 184.6 | ⚠️ same as above (64.5 rounds to 65) |
| HALLOWEEN.md | Shape B total | ¥18,000–29,000 | €97–156 | 185.6–185.9 | ✅ within rounding |
| HALLOWEEN.md | Shape A total | ¥24,000–36,500 | €129–196 | 186.0–186.2 | ✅ |
| HALLOWEEN.md | Shape C total | ¥17,500–28,500 | €94–153 | 186.2–186.3 | ✅ |
| ITINERARY.md | 4 Nov day total | ¥10,700–19,100 | €58–103 | 184.5–185.4 | ⚠️ minor rounding |
| ITINERARY.md | 9 Nov day total | ¥16,000–20,000 | €86–108 | 186.0–185.2 | ✅ |
| ITINERARY.md | 5 Nov day total | ¥12,600–16,400 | €68–88 | 185.3–186.4 | ✅ within rounding |
| BUDGET.md | NRT→CTS ¥21,000–30,000 | — | €113–161 | 185.8–186.3 | ✅ |
| TRANSPORT.md | TYO-NRT ¥1,500 pp = ¥3,000 | 3,000 | €16 | 187.5 | ⚠️ 3,000/186 = 16.13. Rounds to €16. OK |

**No real FX bugs found.** All pairs are within ±€1 of ¥186, attributable to integer rounding. The two previously documented FX bugs (¥165 in Halloween shapes, ¥183 in insurance) have been fixed. **Clean.**

---

## (c) Per-Person vs Per-Couple Findings

| Item | Stated in budget | Check | Verdict |
|---|---|---|---|
| **JR pass ¥40,000 pp** | Budget says "×2" = ¥80,000 | ✅ correctly doubled | |
| **Peach NRT→CTS** | Budget says "NRT → New Chitose ×2, ¥21,000–30,000" = ¥10,500–15,000 pp | ✅ correctly doubled | |
| **Matsushima cruise ¥1,500 pp** | ITINERARY.md says ¥1,500 pp. Entry tickets line says ¥15,500–19,500. Let me check: Zuiganji ¥700pp=¥1,400 + Entsuin ¥500pp=¥1,000 + cruise ¥1,500pp=¥3,000 + Fukuurajima ¥200pp=¥400 + Nikko set (¥1,300–1,600pp + others) → the range is coherent with all doubling done | ✅ | |
| **teamLab ¥3,800 pp** | ITINERARY says "¥3,800 pp weekday = ¥7,600 for two". Budget entry line says "teamLab ¥7,600 confirmed" | ✅ correctly doubled | |
| **TYO-NRT bus ¥1,500 pp** | Budget says "×2, ¥3,000" | ✅ correctly doubled | |
| **Toshogu ¥1,600 pp** | Covered in entry tickets line (¥15,500–19,500 range). The itinerary says ¥1,600 pp standalone. This is inside the "Entry tickets" aggregate | ✅ assumed doubled | |
| **Sekisuitei PER PERSON** | ACCOMMODATION.md explicitly flags "⚠️ Sekisuitei quotes PER PERSON". It is NOT in the budget — only Grand Hotel ¥28,760 total is. | ✅ not applicable to budget | |
| **Noboribetsu Grand Hotel ¥28,760** | ACCOMMODATION.md says "buffet half-board + ¥4,400 kashikiri, all taxes" — this appears to be a TOTAL for the room (for two). The budget uses ¥28,760 as a flat figure | ⚠️ **AMBIGUOUS** — see below | |

**⚠️ THE NOBORIBETSU LINE — potential per-person risk:**

The accommodation table says ¥28,760 with €155 (¥28,760/186 = €154.6 ✅). ACCOMMODATION.md describes it as the all-in figure. However, the OPEN-ITEMS file notes Sekisuitei is "quoted PER PERSON" and contrasts with the Grand Hotel. The hotel's Japanese site typically quotes "per person per night" for half-board ryokans. If ¥28,760 is actually **per person**, the real cost would be **¥57,520 = €309**, not €155.

**However:** the research explicitly says "¥28,760" as the total including the ¥4,400 kashikiri and taxes, and ACCOMMODATION.md frames the Sekisuitei per-person issue as a *correction* that distinguished it from the Grand Hotel. The Grand Hotel appears to be a **per-room** western-style hotel price. I rate this **probably correct but flag it as the single item most worth confirming at booking time.**

| Item | Stated in budget | Check | Verdict |
|---|---|---|---|
| **Hakodate bus day pass ¥1,400** | Budget says "×2" in the description | ✅ | |
| **Kanmangafuchi bus ¥1,400** | ¥350 pp × 2 ways × 2 people = ¥1,400 | ✅ correctly doubled | |
| **Ikebukuro JR ¥680** | ¥160 pp × 2 + ¥160 pp × 2 return = ¥640. Stated ¥680 | ⚠️ minor — ¥160×2×2=¥640, not ¥680. May include Koenji return (¥320 for two, stated separately). Actually the ¥680 is just the Ikebukuro JR portion. Let me re-check: Shinjuku→Ikebukuro = ¥180 pp × 2 = ¥360, Ikebukuro→Shinjuku = ¥180 pp × 2 = ¥360. Wait — ITINERARY says "¥160 pp" for 1 stop. Actually ¥160 is plausible (IC card fare). ¥160 × 2 people × 2 ways = ¥640. Budget says ¥680. **Off by ¥40** — possibly including the extra ¥20 pp paper-ticket surcharge, or one extra segment | ⚠️ trivial, ¥40 |
| **Workshops: Edo kiriko ¥7,260** | ITINERARY says "¥3,630 pp confirmed". ¥3,630 × 2 = ¥7,260 | ✅ | |
| **Indigo ¥4,400–11,000** | ITINERARY says "¥2,200–5,500 pp". ¥2,200×2=¥4,400, ¥5,500×2=¥11,000 | ✅ | |

---

## (d) Unbudgeted Costs (excluding shopping)

Reading the itinerary day by day for items that cost money but have no budget line:

| Item | Estimated cost (for two) | Where it should sit |
|---|---|---|
| **Kiyosumi Garden ¥150 pp** = ¥300 | Trivial but technically unbudgeted | Entry/activities Leg 2 |
| **Tobu limited express to Nikko ¥3,050–3,940 pp** = ¥6,100–7,880 | ⚠️ **This IS budgeted** — "Rail off-pass" line ¥14,000–21,000 covers airport rapid + Tobu return. Tobu return alone = ¥2,700 pp × 2 = ¥5,400 (Kegon). Tobu TO Nikko = ¥3,050–3,940 pp × 2 = ¥6,100–7,880. Total Tobu = ¥11,500–13,280. Airport rapid ¥1,230–1,300 pp × 2 = ¥2,460–2,600. Grand total = ¥13,960–15,880. Budget says ¥14,000–21,000. | ✅ covered (generous) |
| **Coin locker at Tobu Nikko** | ¥400–700. Budget's "Noboribetsu buses etc." line explicitly says "coin locker" | ✅ covered |
| **Goryokaku Tower** | Not listed in entry tickets, but ITINERARY says "Goryokaku Tower for the shape from above". Typically ¥900 pp = ¥1,800 | ⚠️ **Possibly unbudgeted** — the entry tickets line description mentions "Nikko set ticket and Fukuurajima" but not Goryokaku. Range ¥15,500–19,500 might absorb it, but it's not named |
| **Mt Moiwa ¥2,100 pp** = ¥4,200 | Not named in entry tickets but should be inside it. The range ¥15,500–19,500 needs to cover: Matsushima cruise ¥3,000 + Zuiganji ¥1,400 + Entsuin ¥1,000 + Fukuurajima ¥400 + Nikko set ¥2,600–3,200 + Mt Moiwa ¥4,200 + Goryokaku Tower ¥1,800 + Hase-dera? No — Hase-dera and Kotoku-in are Leg 2. So: ¥3,000+1,400+1,000+400+2,600+4,200+1,800 = **¥14,400 minimum**. Against ¥15,500 low → ¥1,100 slack. Add Goryokaku: fits. | ✅ probably covered |
| **Nikko taxi ¥1,200 on 3 Nov** | Budget's misc line says "one Nikko taxi ¥1,200" | ✅ |
| **Enoshima Sea Candle / Escar** | ITINERARY says ¥650 pp passport rate. For two = ¥1,300. Budget's Kamakura line ¥12,600–16,400 should include it. Let me verify: JR ¥950pp×2×2=¥3,800 + Enoden ¥460pp×2=¥920 (wait, ITINERARY says ¥200pp×2 segments = ¥460pp, so ¥920 total). No — "¥200 pp point-to-point" per hop, 2 hops = ¥400 pp = ¥800 total. + Kotoku-in ¥300pp×2=¥600 + Hase-dera ¥400pp×2=¥800 + Enoshima ¥650pp×2=¥1,300 + food ~¥4,000–6,000 + JR Fujisawa→Tokyo ¥1,000pp×2=¥2,000. Total: 3,800+800+600+800+1,300+4,000+2,000 = ¥13,300 min. Against ¥12,600 low — **the low end is ¥700 short**. Stated ¥12,600 might assume skipping Sea Candle (ITINERARY notes "Skipping Enoshima's Sea Candle and Escar brings the day to ~€52–72"). So the range probably reflects the skip-or-don't optionality | ⚠️ tight but intentional |
| **Fire ritual at Fukagawa Fudo-do** | Free | ✅ |
| **Sumo Museum** | Free | ✅ |
| **eSIM** | Budgeted in trip-wide | ✅ |
| **Travel insurance** | Budgeted in trip-wide | ✅ |
| **Azabudai Hills rooftop** | Free | ✅ |
| **Luggage transfer (takkyubin)** | Budget says "¥0 by Oedo line, or ¥2,000–4,000 takkyubin" in misc line | ✅ |
| **Peach checked baggage surcharge** | TRANSPORT says "+¥5,000–7,000 for two checked bags" — but the budget's NRT→CTS line is ¥21,000–30,000 for two. That's ¥10,500–15,000 pp. Peach base is ¥10,500–15,000 pp, PLUS bags ¥2,500–3,500 pp. Total pp = ¥13,000–18,500, total for two = ¥26,000–37,000. Budget says ¥21,000–30,000. | ❌ **The low end is almost certainly too low.** If bags are ¥5,000–7,000 total on top of base fare ¥21,000–30,000, then ¥21,000 implies base fare ¥16,000 for two (¥8,000 pp) which is below the stated ¥10,500 pp floor. **One interpretation**: ¥21,000–30,000 INCLUDES bags. Then base+bags for two = ¥21,000–30,000, meaning base = ¥16,000–23,000 for two = ¥8,000–11,500 pp. TRANSPORT says "~¥10,500–15,000 pp **plus** ¥5,000–7,000 for two checked bags" which gives ¥26,000–37,000 total. **Budget low-end is ¥5,000 short of TRANSPORT's implied minimum.** |

---

## (e) Verified Clean List

These items are confirmed correct and internally consistent:

- ✅ All three section ¥ subtotals add correctly
- ✅ All three € subtotals convert correctly at ¥186
- ✅ All three centres are correct midpoints
- ✅ Total is correct sum of subtotals
- ✅ Spread of €1,570 is correct (4,536 - 2,966)
- ✅ JR pass correctly doubled (¥40,000 × 2 = ¥80,000)
- ✅ teamLab correctly doubled (¥3,800 × 2 = ¥7,600)
- ✅ TYO-NRT bus correctly doubled (¥1,500 × 2 = ¥3,000)
- ✅ Workshops correctly doubled
- ✅ No FX rate bugs remaining (all within ±€1 rounding)
- ✅ Shopping is consistently excluded from all subtotals and the total
- ✅ No shopping figure has leaked into any subtotal
- ✅ Accommodation nights sum correctly: Sapporo 2 + Noboribetsu 1 + Hakodate 2 + Sendai 2 + Tokyo 2 + Nikko 1 + Tokyo 8 = **18** ✅
- ✅ No night is double-costed (Leg 1 has 10 accommodation nights for 11 days because day 1 is arrival; Leg 2 has 8 nights for 8 days because check-out day 11 Nov is not an accommodation night)
- ✅ Leg 1 food covers 11 days correctly (24 Oct–3 Nov inclusive)
- ✅ Leg 2 food covers 8 days correctly (4–11 Nov inclusive, though 11 Nov is a departure morning)
- ✅ Breakfast lines: 8 mornings each leg is plausible (Leg 1: 2 free Toyoko Inn + 1 included Noboribetsu = 3 included, leaving 8 of 11; Leg 2: 8 of 8 → but hotel has no breakfast, so all 8)
- ✅ Halloween shapes are all on the same FX rate now
- ✅ Leg 2 breakfast count matches 8 nights at Tokyu Stay (no included breakfast)

---

## (f) Single Highest-Confidence Error

### ❌ **The Peach flight line (¥21,000–30,000) is inconsistent with TRANSPORT.md and is likely ¥5,000 too low at the bottom.**

**Arithmetic:**
- TRANSPORT.md states: "~¥10,500–15,000 pp, plus ¥5,000–7,000 for two checked bags"
- Minimum: (¥10,500 × 2) + ¥5,000 = **¥26,000**
- Maximum: (¥15,000 × 2) + ¥7,000 = **¥37,000**
- BUDGET.md states: ¥21,000–30,000

**The budget low of ¥21,000 implies ¥10,500 pp with ZERO baggage charge, contradicting the "plus" in TRANSPORT.md.** If bags are included, the band should be **¥26,000–37,000** (€140–199), not ¥21,000–30,000 (€113–161). This would raise the Leg 1 subtotal by **¥5,000–7,000** at the low end (€27–38) and the total low from €2,966 to approximately **€2,993–3,004**.

---

## Summary of Findings

| Category | Count |
|---|---|
| Arithmetic errors in addition | 0 |
| FX conversion bugs | 0 (all fixed from prior passes) |
| Typos in summary table | 1 (Leg 2 high: 1,716 should be 1,719) |
| Per-person/couple errors confirmed | 0 |
| Per-person/couple items worth verifying at booking | 1 (Noboribetsu ¥28,760 — is it truly per-room?) |
| Cross-file inconsistency | 1 (Peach flight + bags) |
| Potentially unbudgeted costs | 1 substantive (Goryokaku Tower ¥1,800, likely absorbed in the range but not named) |
| Shopping leakage | None |

**The budget is arithmetically sound.** The prior FX bugs are all fixed, the subtotals add correctly, and the centres are true midpoints. The one real finding is the Peach flight line's low-end being ¥5,000 short of what TRANSPORT.md implies, plus the summary-table typo (1,716 vs 1,719).

## (g) Band Sanity Check

| Line | Band width | Assessment |
|---|---|---|
| **Tokyu Stay 8 nights** | €473 | Absurdly wide for a single property — drives the entire trip spread. Correct to flag as unresolved |
| **Food Leg 1** (11 days) | €320 | Wide but defensible — market grazing vs restaurant dinners |
| **Food Leg 2** (8 days) | €172 | Reasonable |
| **NRT→CTS flight** | €48 | Reasonable for an LCC with variable pricing |
| **Halloween night** | €26 | Tight — reasonable given a fixed venue |
| **eSIM** | €11 | Negligible |
| **Travel insurance** | €59 | Wide for a known product — could tighten with a quote |

**Most likely under-budgeted:** the Peach flight (as shown above), and the Tokyu Stay low end (¥10,000/night for a Saturday in November seems optimistic for an apart-hotel with washer-dryer in Koto).

[OPTIONS: Fix all findings now | Fix only the Peach flight line | Fix only the typo | Leave as-is, I'll fix manually]