# Exact Connections — Nikko / Tohoku Leg (Wed 28 Oct – Sat 31 Oct 2026)

Research only. No itinerary redesign. All times as retrieved 2026-07-29; JR/Tobu
timetables can still be revised before travel — re-verify in September/October 2026,
especially anything affected by any Oct 2026 timetable revision.

---

## 1. Tobu Bus: TOBU NIKKO STATION → CHUZENJI-ONSEN (the "UP" direction, needed Fri 30 Oct)

**Could not retrieve the exact departure list for this specific stop-pair directly** —
both `tobu-bus.com/pc/search/bs_tt.php?key=43025_12` (the official link Tobu's own
access page points to) and NAVITIME's bus timetable pages (`navitime.co.jp/bus/...`)
returned HTTP 404 / 403 to automated fetches.

What WAS retrieved (NAVITIME segment timetables, Tobu Nikko Station → intermediate
stops on the same Yumoto-onsen-bound route, which lets the departure times be read
off directly since these are through-services):

Weekday timetable, Tobu Nikko Station departures bound for Chuzenji-onsen / Yumoto-onsen:
- **06:30** — service [Y] bound for Yumoto-onsen (passes through Chuzenji-onsen)
- **06:55** — service [C] bound for Chuzenji-onsen (terminates there)
- **07:53** — service [Y] bound for Yumoto-onsen
- **08:35** — service [Y] bound for Yumoto-onsen
- **08:45** — service [C] bound for Chuzenji-onsen
- **09:05** — service [YK] bound for Yumoto-onsen
- **09:35** — service [YK] bound for Yumoto-onsen

Journey time Tobu Nikko Station → Chuzenji-onsen is ~50 minutes (confirmed via
rome2rio.com: "bus from Tōbu Nikkō Station to Chūzenji Onsen takes 50 min... departs
every 30 minutes" — consistent with the ~06:30/06:55/07:53/08:35/08:45 pattern above).

**For the couple to be on a bus by 08:00–08:30 Fri 30 Oct**: the **07:53 [Y]** or
**08:35 [Y]** departure both fit. Recommend the **07:53** for safety margin before
Irohazaka Friday traffic builds.

⚠️ Could NOT confirm this is the Saturday/holiday timetable (30 Oct 2026 is a
**Friday** = weekday timetable, so the above should apply, but it is not independently
verified against the live weekday sheet for that exact date).

**Human should verify directly at:**
http://www.tobu-bus.com/pc/search/bs_tt.php?key=43003_11
(this is the actual "Departure from Tobu Nikko Station, Bound for Yumoto-onsen"
timetable link listed on Tobu's own bus info page — note this differs from the
`43025_12` key given in the task, which 404'd; `43003_11` is the correct link
Tobu's page itself uses for this direction)

---

## 2. Tobu Bus: CHUZENJI-ONSEN → TOBU NIKKO STATION (the "DOWN" direction — CRITICAL, Sat 31 Oct)

**NOT retrieved — this is the single most important gap.** Every avenue attempted
failed:
- `tobu-bus.com/pc/search/bs_tt.php?key=43025_12` (the URL given in the task, sourced
  from Tobu's own "Departure from Chuzenji-onsen, Bound for Tobu Nikko Station" link) →
  **HTTP 404**
- NAVITIME segment queries for this exact stop pair (`arrival=00078277&departure=00078299`,
  Chuzenji-onsen → Tobu Nikko Station) → **HTTP 403** (blocked for automated fetch)
- Jorudan mobile bus-stop page (`mb.jorudan.co.jp/os/bus/0901/stop/22574.html`) →
  redirects to a JS-rendered app, no usable static content
- General web search for literal times → no snippet captured actual DOWN-direction
  departure times from Chuzenji-onsen (only UP-direction Nikko→Chuzenji snippets
  surfaced, shown in §1 and §5)

**What can be inferred, NOT confirmed:** the route is a there-and-back service
(Tobu Nikko Station ⇄ Yumoto-onsen via Chuzenji-onsen), and UP journey time
Nikko→Chuzenji is ~50 min. If the schedule is symmetric (common on such routes),
first-bus-of-the-day DOWN departures from Chuzenji-onsen might mirror the ~06:30/
07:30/08:00 pattern, arriving Tobu Nikko Station ~50 min later. **This is a guess,
not a sourced fact — treat it as unconfirmed.**

**A human must open one of these directly to get real times:**
- http://www.tobu-bus.com/pc/search/bs_tt.php?key=43025_12 (Tobu's own listed
  link for this exact direction — retry manually in a browser; the 404 may be a
  bot-blocking / referer issue rather than a dead link)
- https://www.tobu.co.jp/en/access/nikko/bus_nikko.html (English access page,
  has a working link list — click "Departure from Chuzenji-onsen / Bound for
  Tobu Nikko Station")
- https://www.navitime.co.jp/bus/diagram/timelist?arrival=00078277&departure=00078299&line=00021677
  (NAVITIME direct route — blocked for the automated agent, works in a normal browser)
- https://mb.jorudan.co.jp/os/bus/0901/stop/22574.html (Jorudan's Chuzenji-onsen
  stop page — has a live timetable widget that needs JS)

This gates the entire Sat 31 Oct Halloween-arrival morning — **resolve this before
finalizing the day**.

---

## 3. Tobu Limited Express: TOBU NIKKO → ASAKUSA (inbound), morning departures

Source: Tobu's own PDF timetable link resolved (`tobu.co.jp/en/_assets_l/pdf/timetable1in.pdf`)
but PDF content could not be parsed by the fetch tool; cross-verified instead via
Nikko Station's (nikkostation.com) published Tobu timetable tables, which quote
Tobu's official schedule directly. These three services are confirmed real:

| Service | Type | Departs Tobu Nikko | Arrives Asakusa | Runs |
|---|---|---|---|---|
| Revaty Kegon #14 | Limited express | 08:52 | 10:45 | Daily |
| Spacia Kegon #18 | Limited express | 09:57 | 11:45 | Daily |
| Revaty Kegon #22 | Limited express | 10:39 | 12:35 | **Weekends/holidays only** |
| Spacia Kegon #24 | Limited express | 11:27 | 13:15 | Daily |

Kirifuri (weekend/holiday-only, cheapest fare) does NOT have a train that fits the
07:00–12:00 morning window inbound — its only inbound weekend service (#284) departs
Nikko 13:59, arrives Asakusa 16:05, too late for this use case.

**No confirmed inbound departure exists between roughly 07:00–08:51** — the
Revaty Kegon #208 that runs earlier (dep Shin-Tochigi 06:03) does **not stop at or
originate from Tobu Nikko Station**, so it cannot be boarded there. This means the
**08:52 Revaty Kegon #14** is effectively the FIRST usable inbound limited express
from Tobu Nikko Station in the whole morning.

Journey time Nikko→Asakusa: ~1h48m–1h53m on Spacia/Revaty; the Kirifuri (weekend-only)
takes ~2h06m.

**Non-reserved fallback:** No non-reserved/local "rapid" Tobu service was confirmed to
run the full Nikko–Asakusa route without a transfer. The JR Nikko Line + JR Utsunomiya
Line + JR/Tobu through-service to Shinjuku or Kita-Senju is the practical fallback if
the limited express is sold out, but that alternate routing was not itself timetabled
here (out of scope of what was requested — flagging for a human to check specifically
if this contingency is needed).

**Human should verify the exact PDF (in case of Oct 2026 revision) at:**
https://www.tobu.co.jp/en/_assets_l/pdf/timetable1in.pdf?202603
(labelled "Inbound: Aizu-tajima, Kinugawa-onsen, Tobu-nikko → Shinjuku, Asakusa")

---

## 4. Tohoku Shinkansen: SENDAI → UTSUNOMIYA (Yamabiko), morning departures

Source: ekitan.com English Shinkansen planner (retrieved directly, full table).
JR East data, "Aug. 2026 issue of JR JIKOKUHYO" per page footer — i.e. genuinely
current published data.

| Departs Sendai | Arrives Utsunomiya | Duration | Service |
|---|---|---|---|
| 06:07 | 07:18 | 1h11m | Yamabiko 202 |
| 06:23 | 07:39 | 1h16m | Yamabiko 204 |
| 06:50 | 08:08 | 1h18m | Yamabiko 206 |
| 07:11 | 08:22 | 1h11m | Yamabiko 122 |
| 07:34 | 09:02 | 1h28m | Yamabiko 208 |
| 08:07 | 09:17 | 1h10m | Yamabiko 126 |
| 08:20 | 09:28 | 1h8m | Yamabiko 50 |
| 08:40 | 09:57 | 1h17m | Yamabiko 128 |

**Only Yamabiko services stop at Utsunomiya.** Hayabusa (the faster Tokyo–Morioka/
Shin-Aomori service) does NOT call at Utsunomiya on most workings — confirm any
specific Hayabusa working individually if considering it, but for planning purposes
assume **Hayabusa skips Utsunomiya** and only Yamabiko (and slower Nasuno, which
doesn't reach as far as Sendai) serve this stop.

---

## 5. JR Nikko Line: UTSUNOMIYA → NIKKO, all-day weekday departures

Source: ekitan.com direct station timetable page (JR East data), retrieved for
Thu 30 Jul 2026 as the reference weekday — confirmed as "平日" (weekday) table.
All services are 普通 (local, all-stations) — the whole line is local-only.

| Departs Utsunomiya | Arrives Nikko (approx, ~40–42 min journey) |
|---|---|
| 05:57 | ~06:39 |
| 06:30 | ~07:12 |
| 07:02 | ~07:44 |
| 07:38 | ~08:20 |
| 08:11 (to Kanuma only — NOT through to Nikko) | — |
| 08:46 | ~09:28 |
| 09:36 | ~10:18 |
| 10:31 | ~11:13 |
| 11:22 | ~12:04 |
| 12:15 | ~12:57 |
| 13:07 | ~13:49 |
| 14:12 | ~14:54 |
| 15:15 | ~15:57 |
| 16:16 | ~16:58 |
| 16:50 | ~17:32 |
| 17:16 | ~17:58 |
| 17:50 | ~18:32 |
| 18:16 | ~18:58 |
| 18:50 | ~19:32 |
| 19:16 | ~19:58 |
| 19:50 | ~20:32 |
| 20:16 | ~20:58 |
| 21:02 | ~21:44 |
| 22:01 | ~22:43 |
| 22:48 (last) | ~23:30 |

Arrival times above are derived by adding the ~40–42 min published journey time
(confirmed independently by trip.com: "average duration 40 minutes / ~32km") to the
departure time — the exact minute-level arrival was not captured from the source
table (it only listed departures), so treat arrival times as **approximate, ±2 min**.

**Gaps flagged (>60 min):**
- 07:38 → 08:46 gap of ~68 min if the 08:11 Kanuma-only service is excluded
  (it doesn't reach Nikko)
- 08:46 → 09:36: 50 min
- 09:36 → 10:31: 55 min
- 10:31 → 11:22: 51 min
- Afternoon (13:07→14:12, etc.): consistently ~55–65 min gaps — this line really is
  only "roughly hourly" as flagged in the task, sometimes worse.

**Confirm weekday vs Saturday variant before relying on this for Wed 28 Oct** — the
ekitan page defaults to a 平日/土曜/休日 (weekday/Saturday/holiday) toggle; only the
平日 (weekday) table was captured. 28 Oct 2026 is a Wednesday, so the weekday table
above is the correct one to use.

Source: https://ekitan.com/timetable/railway/line-station/101-0/d1 (Utsunomiya
station, 日光方面 = Nikko-bound)

---

## RECOMMENDED CONNECTIONS

| Day | Leg | Recommended train/bus | Departs | Arrives | Slack at next transfer |
|---|---|---|---|---|---|
| **Wed 28 Oct** | Sendai → Utsunomiya | Yamabiko 122 | 07:11 | 08:22 | ~24 min before the 08:46 Nikko Line departure (see below) — comfortable |
| **Wed 28 Oct** | Utsunomiya → Nikko | JR Nikko Line local | 08:46 | ~09:28 | End of this leg — arrive Nikko town late morning |
| **Fri 30 Oct** | Tobu Nikko Station → Chuzenji-onsen | Tobu Bus [Y] (Yumoto-onsen bound) | 07:53 | ~08:43 | Beats Irohazaka traffic buildup; ~40 min ahead of the later 08:35 departure as a buffer |
| **Sat 31 Oct** | Chuzenji-onsen → Tobu Nikko Station | **UNRESOLVED — see §2** | ? | ? | **Cannot compute slack; this is the binding constraint for reaching the 08:52 train below** |
| **Sat 31 Oct** | Tobu Nikko → Asakusa | Revaty Kegon #14 | 08:52 | 10:45 | This is the FIRST usable inbound limited express — if the Chuzenji bus arrives after ~08:40, this train is missed and the next is Spacia Kegon #18 at 09:57 (arr. 11:45) |

**Critical dependency:** the Sat 31 Oct arrival time in Tokyo is entirely gated by
item #2 (Chuzenji-onsen → Tobu Nikko Station first bus), which could not be
retrieved. Until a human confirms that time, the safe planning assumption should be
**Spacia Kegon #18 (dep. Nikko 09:57, arr. Asakusa 11:45)** rather than the earlier
08:52 train, to avoid a missed connection on Halloween Saturday morning.

---

## SOURCES

1. Tobu bus access page (English): https://www.tobu.co.jp/en/access/nikko/bus_nikko.html
2. Tobu bus timetable (Nikko Station → Yumoto-onsen, working link): http://www.tobu-bus.com/pc/search/bs_tt.php?key=43003_11
3. Tobu bus timetable (Chuzenji-onsen → Nikko Station, per task — returned 404): http://www.tobu-bus.com/pc/search/bs_tt.php?key=43025_12
4. NAVITIME bus segment timetables (Tobu Nikko Station area, multiple stop-pairs): https://www.navitime.co.jp/bus/diagram/timelist?arrival=00078298&departure=00078277&line=00021677 (and sibling URLs)
5. Rome2Rio (journey-time cross-check only): https://www.rome2rio.com/s/Tobu-Nikko/Ch%C5%ABzenji-Onsen
6. Tobu limited express timetable index: https://www.tobu.co.jp/en/express_info/timetable.html
7. Tobu inbound limited express PDF: https://www.tobu.co.jp/en/_assets_l/pdf/timetable1in.pdf?202603
8. Nikko Station guide — Spacia Kegon timetable: https://www.nikkostation.com/limited-express-spacia-kegon-for-asakusa-and-nikko/
9. Nikko Station guide — Revaty Kegon timetable: https://www.nikkostation.com/limited-express-revaty-kegon-for-asakusa-and-nikko/
10. Nikko Station guide — Kirifuri timetable: https://www.nikkostation.com/limited-express-kirifuri-for-asakusa-and-nikko/
11. Ekitan English Shinkansen planner (Sendai→Utsunomiya, Yamabiko): https://www.ekitan.com/en/planner/shinkansen/section/sendai/utsunomiya/yamabiko
12. Shinkansen.co.jp Utsunomiya Tokyo-direction table (cross-check, arrival-side only): http://www.shinkansen.co.jp/jikoku_hyo/en/touhoku/tuh_utsunomiya.html
13. Ekitan JR Nikko Line, Utsunomiya station, Nikko-bound (weekday): https://ekitan.com/timetable/railway/line-station/101-0/d1
14. Ekitan JR Nikko Line, Nikko station, Utsunomiya-bound (weekday, for reference): https://ekitan.com/timetable/railway/line-station/101-6/d1
15. Jorudan Chuzenji-onsen bus stop page (JS-rendered, could not extract times): https://mb.jorudan.co.jp/os/bus/0901/stop/22574.html
