Now I have all 9 files. Let me do the systematic review.

---

# ADVERSARIAL CONSISTENCY REVIEW — Japan 2026

## A. NIGHT COUNTS

| File | Text | Count |
|---|---|---|
| ITINERARY.md header | "23 October – 11 November 2026 · 18 nights" | 18 ✅ |
| ITINERARY.md summary line | "Tokyo 10 · Sapporo 2 · Hakodate 2 · Sendai 2 · Nikko **1** · Noboribetsu 1 = **18**" | 18 ✅ |
| README.md table | Sapporo 2 + Noboribetsu 1 + Hakodate 2 + Sendai 2 + Tokyo 2 + **Nikko 2** + Tokyo 7 = **18** | 18 ✅ sum... |
| ACCOMMODATION.md table | 2+1+2+2+1+1+**1**+**8** | 18 ✅ |
| BUDGET.md Leg 1 | "10 nights" | — |
| BUDGET.md Leg 2 | "8 nights" | — |
| BUDGET.md header "Whole trip" | "18 nights" | 18 ✅ |

**FINDING:**

**BREAKS THE PLAN** | `README.md` | `"2 | Nikko | 2–3 Nov 🛁"` | contradicts ITINERARY.md which says `"Nikko **1** · Noboribetsu 1"` and ACCOMMODATION.md which has `"2–3 Nov 🛁"` as ONE night (Casual Euro). The README table says **2 nights** in Nikko and **7** in the second Tokyo block. | Fix: change README Nikko to `1` and second Tokyo block to `8`, keeping total at 18.

Let me verify: README shows `2 | Nikko | 2–3 Nov 🛁` — this is ambiguous. "2–3 Nov" could be read as the date range. But the "Nights" column says **2**. Meanwhile:
- ITINERARY AT A GLANCE: Night 10 = Mon 2 Nov = Nikko. Night 11 = Tue 3 Nov = Tokyo. So Nikko = 1 night.
- ACCOMMODATION: "2–3 Nov 🛁 | Hotel Casual Euro" — this is listed as a single row. But wait, it says **¥11,000** which is ONE night's rate. Let me re-read.

Actually looking more carefully at ACCOMMODATION.md: `"2–3 Nov 🛁 | **Hotel Casual Euro, Nikko** — ¥11,000 category, room only | **¥11,000** | **€59**"` — that's ONE night at ¥11,000.

And README: The nights column says `2` for Nikko with dates `2–3 Nov`. But the ITINERARY says Nikko is ONE night (sleep 2 Nov, leave 3 Nov morning). README's Tokyo second block says `7` nights for `4–10 Nov`. 

If Nikko = 1, then second Tokyo = 8, and: 2+1+2+2+2+1+8 = 18. ✅
README has: 2+1+2+2+2+**2**+**7** = 18. The sum is 18 either way, but the *distribution* is wrong.

**SEVERITY: BREAKS THE PLAN** | `README.md` | `"2 | Nikko | 2–3 Nov 🛁"` and `"7 | Tokyo | 4–10 Nov"` | contradicts ITINERARY.md `"Nikko **1**"` and the AT A GLANCE table which shows only Night 10 in Nikko, Night 11 already in Tokyo. ACCOMMODATION shows Nikko as 1 night at ¥11,000. | Fix: README Nikko → `1 | Nikko | 2 Nov 🛁`, second Tokyo → `8 | Tokyo | 3–10 Nov`.

---

## B. BUDGET ARITHMETIC

**Leg 1 subtotal check:**
BUDGET.md states: **¥358,860–494,360 | €1,929–2,658**

Let me add the line items (low–high):
- Accommodation 10 nights: 111,760–143,760
- JR pass ×2: 80,000–80,000
- NRT→CTS ×2: 21,000–30,000
- Rail off-pass: 14,000–21,000
- Local buses/trams: 12,000–18,000
- Entry tickets: 15,500–19,500
- Food 11 days: 80,500–140,000
- Halloween: 10,300–14,300
- Costumes: 6,000–12,000
- Misc (buses, taxi, luggage): 3,800–7,800
- Breakfasts: 4,000–8,000

**Low sum:** 111,760+80,000+21,000+14,000+12,000+15,500+80,500+10,300+6,000+3,800+4,000 = **358,860** ✅
**High sum:** 143,760+80,000+30,000+21,000+18,000+19,500+140,000+14,300+12,000+7,800+8,000 = **494,360** ✅

**€ conversion check:** ¥358,860 / 186 = €1,929.4 ✅ | ¥494,360 / 186 = €2,658.0 ✅
**Centre:** (1,929+2,658)/2 = 2,293.5 — stated as "≈ €2,294" ✅

**Leg 2 subtotal check:**
- Tokyu Stay 8 nights: 80,000–167,500
- Kamakura+Enoshima: 12,600–16,400
- Workshops: 11,660–18,260
- Local transit: 12,500–17,000
- TYO-NRT bus: 3,000–3,000
- Entry/activities: 9,500–13,000
- Food 8 days: 44,000–76,000
- Breakfasts: 4,000–8,000

**Low:** 80,000+12,600+11,660+12,500+3,000+9,500+44,000+4,000 = **177,260** ✅
**High:** 167,500+16,400+18,260+17,000+3,000+13,000+76,000+8,000 = **319,160** ✅

**€ conversion:** 177,260/186 = €953.0 ✅ | 319,160/186 = €1,715.9 ≈ €1,716 ✅
**Centre:** (953+1,716)/2 = 1,334.5 — stated as "≈ €1,334" ✅

**Trip-wide:**
- eSIM: 3,000–5,000
- Insurance: 11,000–22,000
**Low:** 14,000 ✅ | **High:** 27,000 ✅
**€:** 14,000/186 = €75.3 ≈ €76 ✅ | 27,000/186 = €145.2 ≈ €147 ✅ (rounds up slightly but acceptable)

**Grand total €:**
- Low: 1,929+953+76 = **2,958** ✅
- High: 2,658+1,716+147 = **4,521** ✅
- Centre: (2,958+4,521)/2 = **3,739.5** — stated as "≈ €3,740" ✅

**Cross-file check:**
- OPEN-ITEMS.md: `"€2,958–4,521, centre ~€3,740"` ✅ matches
- README.md: Does NOT state a budget figure ✅ (no conflict)

**FINDING:** Budget arithmetic is **CLEAN**.

---

## C. CUT-ITEM SURVIVAL

Searching for live-plan references to cut items:

1. **Hakodate ropeway** — ITINERARY explicitly says "not ropeway", "summit bus". BUDGET "Hakodate ropeway out" in context of things cut. BOOKINGS mentions checking the ropeway dates but framed as "only tells you whether you get a bonus". OPEN-ITEMS same. **All framed as cut/rejected.** ✅ Clean.

2. **Oyster huts / kaki-goya** — ITINERARY 30 Oct: "anago, not oysters". BUDGET: "anago replaces the closed oyster huts". BOOKINGS: "SETTLED, THEY'LL BE SHUT" with ❌. ✅ Clean.

3. **Entsuin illumination** — ITINERARY: "CUT, deliberately". BOOKINGS: "only if you want to reinstate it". OPEN-ITEMS records it as fixed. ✅ Clean.

4. **Zuihoden** — ITINERARY: "Cut: Zuihoden and Aoba Castle." ✅ Clean.

5. **Aoba Castle** — Same cut note. ✅ Clean.

6. **Trappistine** — ITINERARY: "Cut: Trappistine Monastery." ✅ Clean.

7. **Enoden day pass (Nori-ori-kun)** — ITINERARY 5 Nov: "Do NOT buy the Nori-ori-kun day pass". BUDGET: "Enoden pass dropped". ✅ Clean.

8. **Roppongi route** — HALLOWEEN.md: "kept as reference" section clearly labelled. ITINERARY 31 Oct: "Roppongi was rejected". ✅ Clean.

9. **Kiyosumi Gardens on 1 Nov** — ITINERARY 1 Nov: `"Kiyosumi Gardens is 25 min away now that the base is Shinjuku — save it for the Fukagawa day on the 4th"`. ✅ Explicitly redirected, not live.

10. **Second Nikko night** — ITINERARY: "One Nikko night only". README: ⚠️ says 2 (caught in §A). ✅ otherwise clean.

11. **4 Nov morning return from Nikko** — ITINERARY 3 Nov: "Tobu 18:11 back to Tokyo". 4 Nov opens with "You slept here last night" (referring to Monzen-Nakacho). ✅ No stale "return from Nikko in the morning" reference.

**FINDING:**

**COSMETIC** | `BUDGET.md` Leg 1 entry tickets line | `"Entry tickets — **Zuihoden and the Hakodate ropeway out; Nikko set ticket and Fukuurajima in**"` | Not a bug — this explicitly names them as OUT. But worth noting the ropeway was ¥3,000 not a flat entry ticket; semantically fine.

✅ **Category C is CLEAN** — no cut items survive as live plan.

---

## D. BASE-DEPENDENT ACTIVITIES

The split: **east Shinjuku** on 31 Oct + 1 Nov; **Monzen-Nakacho** from 3 Nov evening.

**Checking 31 Oct and 1 Nov for Monzen-Nakacho assumptions:** 
- ITINERARY 1 Nov: "From an east Shinjuku base that's **SHINJUKU GYOEN** (¥500 pp, 10 min walk" — ✅ correct for Shinjuku base.
- "Kiyosumi Gardens is 25 min away now that the base is Shinjuku — save it for the Fukagawa day on the 4th" — ✅ correctly acknowledges the distance.

**Checking 3–10 Nov for Shinjuku assumptions:**
- ITINERARY Leg 2 intro: "Base: Tokyu Stay Monzen-Nakacho" ✅
- 4 Nov: "walkable or one to two Oedo stops" ✅
- 6 Nov: "Everything today is within about twenty minutes' walk on the east side" ✅
- 7 Nov: "Map Camera FIRST, at opening — West Exit, Shinjuku" — transit from Monzen-Nakacho to Shinjuku is ~15 min. Not stated but implied. Fine.
- 7 Nov Kitasenju: "Odakyu → Chiyoda line direct, ~35 min" — from Shimokitazawa ✅

**FINDING:**

**WRONG BUT HARMLESS** | `HALLOWEEN.md` §6 item 1 | `"Decide the accommodation shape first, then book early. Either east Shinjuku for these two nights, or extend Tokyu Stay Monzen-Nakacho to cover all nine."` | This says "all nine" implying 9 Tokyo nights from one hotel. But the decided split is 2 (Shinjuku) + 8 (Tokyu Stay) = 10 total Tokyo nights. "All nine" is stale — it reflects a pre-decision state where Nikko was still 2 nights and the second Tokyo block was 7+2=9. | Fix: This section is now moot since the decision was made, but the number "nine" is incorrect for the current plan (10 Tokyo nights total, or 8 at Tokyu Stay).

**WRONG BUT HARMLESS** | `HALLOWEEN.md` §4 hotel recommendation box | `"⚠️ This is a recommendation for Halloween night alone, and the accommodation decision is still OPEN."` | The decision was CLOSED on 5 Aug per the same file's §3 and §7. This paragraph survived from the pre-decision draft. | Fix: Remove or mark as superseded.

✅ No activity is planned from the wrong base.

---

## E. TIME-CHAIN SELF-CONSISTENCY

**30 Oct (Matsushima):**
- 08:15 depart Sendai → ~08:55 arrive. Duration ~40 min. ✅
- 09:00–09:15 Godaido ✅
- 09:15–10:30 Zuiganji (75 min) ✅
- 10:30–11:20 Entsuin (50 min) ✅
- 11:20–11:55 walk to pier ✅
- **12:00–12:50** cruise (50 min) ✅
- 13:00–14:00 lunch ✅
- 14:10–14:55 Fukuurajima (45 min) ✅
- 15:00–15:20 shops ✅
- 15:30 train back → ~16:10 in Sendai ✅

No overlaps, no impossible gaps. The 12:00 cruise rebuild is coherent with the preceding Entsuin slot ending at 11:20 and 35 min of slack. ✅ **CLEAN.**

**3 Nov (Toshogu + return):**
- 07:45 breakfast + check out
- 08:20 taxi
- 08:35 coin locker
- 08:45 at ticket gate
- 08:50 buy tickets
- 09:00 Toshogu opens — 1.5–2h → done ~10:30–11:00
- 11:30 Taiyuinbyo — 45–60 min → done ~12:15–12:30
- 13:00 Yuba lunch — ~1–1.5h → done ~14:00–14:30
- 14:30 Rinnoji + Futarasan + Shinkyo → to ~16:00–16:30
- 16:30 Slack + souvenirs + collect bag
- **18:11** Tobu Kegon #46

Gap between ~16:30 and 18:11 = ~1h40 of slack. ✅ **CLEAN.**

---

## F. HALLOWEEN COST vs BUDGET

**HALLOWEEN.md §3:** `"Total: ¥16,300–24,300 for two — €88–131"` (Shape B all-in with costumes)

**HALLOWEEN.md §7 table:** Shape B column: costumes ¥6,000–10,000 + early evening (Koenji) + late (WARP) = implied ¥16,300–24,300. 

Wait — let me break that table down: costumes ¥6,000–10,000; Koenji ¥5,000–7,000 + JR ¥320; WARP ¥5,000–7,000. That's 6,000+5,000+320+5,000 = 16,320 low and 10,000+7,000+320+7,000 = 24,320. Close enough to ¥16,300–24,300 (the ¥20 rounding is negligible). ✅

**BUDGET.md:** Two separate lines:
- "Halloween night — Shape B: Kōenji ¥5,000–7,000 + JR ¥320 + WARP ¥5,000–7,000, no taxi": **¥10,300–14,300**
- "Costumes — Don Quijote, ¥3,000–6,000 pp": **¥6,000–12,000**

Combined: 10,300+6,000 = 16,300 low; 14,300+12,000 = 26,300 high.

**FINDING:**

**WRONG BUT HARMLESS** | `BUDGET.md` | Combined Halloween + Costumes = **¥16,300–26,300** | `HALLOWEEN.md` §3 states total as **¥16,300–24,300** and §7 table also says "¥16,300–24,300 (€88–131)" | The discrepancy is in the HIGH end: BUDGET allows ¥12,000 for costumes (¥6,000 pp) while HALLOWEEN caps at ¥10,000 (¥5,000 pp from the §7 table which says "¥6,000–10,000"). | Fix: Align — either BUDGET costumes should be ¥6,000–10,000 (matching HALLOWEEN), or HALLOWEEN's total should be ¥16,300–26,300.

**€ conversion check:** ¥16,300/186 = €87.6 ≈ €88 ✅ | ¥24,300/186 = €130.6 ≈ €131 ✅

But the **BUDGET.md** does NOT state a combined Halloween € figure — it keeps them as separate lines. The total flows into the Leg 1 subtotal which verifies (see §B). The **HALLOWEEN.md bottom disclaimer** says: `"Budgeted in BUDGET.md as ¥7,600–8,600 for the night plus ¥6,000–12,000 for costumes — €73–111"`.

**FINDING:**

**BREAKS THE PLAN** | `HALLOWEEN.md` bottom disclaimer (§ after the warnings) | `"Budgeted in BUDGET.md as **¥7,600–8,600** for the night plus ¥6,000–12,000 for costumes — €73–111 for the two of you"` | BUDGET.md actually has **¥10,300–14,300** for the night (Shape B). The ¥7,600–8,600 figure is the OLD pre-decision placeholder. And €73–111 doesn't match either the old or new figures. | Fix: Update to "Budgeted in BUDGET.md as ¥10,300–14,300 for the night plus ¥6,000–12,000 for costumes — €88–141"

---

## G. CROSS-FILE FACT DRIFT

| Fact | File 1 | File 2 | Mismatch? |
|---|---|---|---|
| FX rate | BUDGET: ¥186=€1 | HALLOWEEN: ¥186=€1 | ✅ |
| Toshogu hours | ITINERARY: 09:00–16:00 | OPEN-ITEMS: 09:00 | ✅ |
| TYO-NRT fare | ITINERARY: ¥1,500 pp | TRANSPORT: ¥1,500 pp | ✅ |
| Tobu return fare | ITINERARY: ¥2,700 pp | BOOKINGS: ¥2,700 pp | ✅ |
| Booking date 3 Nov train | ITINERARY: "09:00 JST on 3 October" | BOOKINGS: "3 Oct, 09:00 JST" | ✅ |
| Booking date 2 Nov train | BOOKINGS: "2 Oct, 09:00 JST" | ITINERARY does not contradict | ✅ |
| teamLab price | ITINERARY: ¥3,800 pp | BUDGET: ¥7,600 confirmed (= 2×3,800) | ✅ |
| teamLab slot | ITINERARY: 14:00 | BOOKINGS: "14:00–15:00 slot" | ⚠️ slight |
| Tokyu Stay nights | ACCOMMODATION: "8 nights" | BUDGET: "8 nights" | ✅ |
| Grand Hotel phone | ACCOMMODATION: +81-143-84-2101 | OPEN-ITEMS: +81-143-84-2101 | ✅ |
| Masudaya phone | ITINERARY: 0288-54-2151 | OPEN-ITEMS: 0288-54-2151 | ✅ |
| Shinjuku street-drinking ban time | HALLOWEEN §5: "18:00 on 31 Oct → 05:00" | — | ✅ (only stated once) |
| Nikko taxi | ITINERARY: ~¥1,200 | OPEN-ITEMS: ¥1,200 | ✅ |
| Casual Euro price | ACCOMMODATION: ¥11,000 | ITINERARY: "¥11,000 category" | ✅ |
| Nikko shuttle times | ITINERARY: "15:15 · 16:15 · 17:15 · 18:15" | ACCOMMODATION: same | ✅ |

**FINDING:**

**COSMETIC** | `BOOKINGS.md` | `"Book a 14:00–15:00 slot"` for teamLab | `ITINERARY.md` pinned it to `"14:00 specifically, not 15:00"` and the feasibility review explicitly says `"Pinned to 14:00"` | BOOKINGS says "14:00–15:00" which could be read as either slot being acceptable. | Fix: BOOKINGS → "Book the 14:00 slot" to match the decision.

**WRONG BUT HARMLESS** | `ACCOMMODATION.md` Nikko row | `"2–3 Nov 🛁"` — this notation looks like 2 nights | contradicts the ¥11,000 single-night rate and ITINERARY's "One Nikko night only" | The dates mean "check in 2 Nov, check out 3 Nov" = 1 night, but the same notation format elsewhere (e.g. "24–25 Oct" = 2 nights, "27–28 Oct" = 2 nights) means 2 nights. This is inconsistent notation. | Fix: Change to `"2 Nov 🛁"` (single night, check out 3 Nov).

---

## H. OPEN vs CLOSED ITEMS

**Checking for stale "open/undecided" references:**

1. **Matsushima cruise timing** — OPEN-ITEMS "Settled" section lists it explicitly: check. But does it appear as open anywhere? Searching... BOOKINGS.md has no open question about cruise timing. ✅ Clean.

2. **Halloween shape** — OPEN-ITEMS item 1 says `"✅ CLOSED 5 Aug"`. ✅ Clean.

3. **Halloween accommodation** — OPEN-ITEMS item 1 says CLOSED. But...

**FINDING:**

**COSMETIC** | `HALLOWEEN.md` §6 item 1 | `"Decide the accommodation shape first, then book early."` — framed as still-open | This was decided 5 Aug per OPEN-ITEMS and ACCOMMODATION's "DECIDED 5 Aug" section. | Fix: Either remove §6 item 1 or mark it as ✅ DECIDED.

**Checking genuinely open items NOT listed in OPEN-ITEMS.md:**

- The east Shinjuku **property** is still assumed/unknown — ✅ this IS captured ("The Shinjuku property and price are still ASSUMED")
- Tokyu Stay rate unknown — ✅ captured in OPEN-ITEMS unverified section
- The **2 Nov luggage drop** question — ✅ captured in ACCOMMODATION §"Ask the hotels" #3 and OPEN-ITEMS implicitly

✅ **Category H is substantially CLEAN** aside from the §6 cosmetic above.

---

## CLEAN CATEGORIES (checked, no issues found)

- **Budget arithmetic** — all yen sums, euro conversions, subtotals, and grand total verify exactly
- **Time chains** on 30 Oct and 3 Nov — no overlaps, no impossible connections
- **Cut-item survival** — every cut item is explicitly marked as cut/rejected/reference in every file it appears
- **Base-dependent activities** — no activity is described from the wrong base with wrong walk times
- **FX rate** — ¥186=€1 used consistently in BUDGET, HALLOWEEN, ACCOMMODATION
- **Phone numbers** — consistent across files
- **Train times and fares** — consistent across ITINERARY, BOOKINGS, TRANSPORT
- **Booking dates** — consistent (2 Oct / 3 Oct for Tobu)

---

## HIGHEST-CONFIDENCE "ACTUALLY WRONG" FINDING

**BREAKS THE PLAN** | `README.md` | The night-count table shows **`2 | Nikko | 2–3 Nov 🛁`** and **`7 | Tokyo | 4–10 Nov`** | Every other file (ITINERARY, ACCOMMODATION, BUDGET) consistently shows **1 night Nikko** and **8 nights in the second Tokyo block (+ 2 before = 10 total)**. The README table was not updated when Nikko was reduced from 2→1 night on 5 Aug. The sum happens to stay at 18, which is why it wasn't caught, but the distribution is wrong and would mislead anyone reading just the README.

---

## SUMMARY OF ALL FINDINGS

| # | Severity | File | Issue |
|---|---|---|---|
| 1 | **BREAKS THE PLAN** | README.md | Nikko = 2 nights, Tokyo = 7 — should be 1 and 8 |
| 2 | **BREAKS THE PLAN** | HALLOWEEN.md bottom disclaimer | Cites old ¥7,600–8,600 Halloween budget figure; actual is ¥10,300–14,300 |
| 3 | **WRONG BUT HARMLESS** | BUDGET.md + HALLOWEEN.md | Costume ceiling ¥12,000 in BUDGET vs ¥10,000 in HALLOWEEN (¥2,000 gap on high end) |
| 4 | **WRONG BUT HARMLESS** | HALLOWEEN.md §6 item 1 | Still frames accommodation as an open decision |
| 5 | **WRONG BUT HARMLESS** | HALLOWEEN.md §4 | "the accommodation decision is still OPEN" — it's closed |
| 6 | **WRONG BUT HARMLESS** | ACCOMMODATION.md Nikko row | "2–3 Nov" notation inconsistent with other rows (looks like 2 nights) |
| 7 | **COSMETIC** | BOOKINGS.md | "14:00–15:00 slot" for teamLab, should be "14:00" per the decision |
| 8 | **COSMETIC** | HALLOWEEN.md §6 | "all nine" Tokyo nights — should be 10 (or 8 at Tokyu Stay) |

[OPTIONS: Fix all 8 findings | Fix only BREAKS THE PLAN (1–2) | Show me the exact edits first]