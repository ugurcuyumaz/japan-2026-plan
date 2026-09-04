# Japan 2026 — Document Conventions

Every document in this folder follows these rules so they stay consistent and
machine-readable across sessions.

## Folder purpose

| Folder | Contains | Naming |
|---|---|---|
| `01-research/` | Region/topic research, evidence-backed | `<region>.md` |
| `02-itinerary/` | Route options and the day-by-day plan | `option-<n>-<name>.md`, `FINAL-ITINERARY.md` |
| `03-logistics/` | Transport, passes, packing, budget | `<topic>.md` |
| `04-bookings/` | Confirmed reservations + confirmation numbers | `BOOKINGS.md`, `<vendor>-<ref>.md` |
| `99-archive/` | Superseded drafts (never delete, move here) | keep original name + `-superseded-<date>` |

## Required sections

### Research docs (`01-research/*.md`)
```
# <Region> — Research
## Verdict            ← 3-5 lines, the answer up front
## Seasonal fit (24 Oct – 11 Nov 2026)
## Highlights         ← table: Place | Why | Time needed | Peak window | Needs car?
## Logistics
## Accommodation
## Food
## Risks & closures
## Suggested day counts
## SOURCES            ← every URL used, numbered
```

### Itinerary docs (`02-itinerary/*.md`)
```
# Option <n> — <name>
## Shape              ← one-line route string
## Trade-offs         ← pros / cons table
## Day-by-day         ← table: Day | Date | Base | Move | Highlights | Nights
## Booking-critical items   ← things that sell out
```

## Formatting rules

- **Dates:** always `YYYY-MM-DD` plus weekday, e.g. `2026-10-24 (Sat)`.
- **Times:** 24h, always state timezone when ambiguous (`09:30 JST`).
- **Money:** `¥12,000 (~€70)` — yen first, EUR estimate in brackets. Record the
  FX rate used in `03-logistics/budget.md`.
- **Every factual claim** that isn't common knowledge gets a `[n]` footnote
  pointing at the SOURCES list. No unsourced claims about opening dates,
  prices, or closures.
- **Uncertainty is explicit:** mark unverified items `⚠️ VERIFY` with what needs
  checking and where.
- **Status markers:** `✅ confirmed` · `🔶 proposed` · `⚠️ VERIFY` · `❌ rejected`.
- **Distances/times** between places: always give the actual transport mode and
  duration, not just "close by".

## Update discipline

- `00-TRIP-OVERVIEW.md` is the single source of truth for the trip skeleton and
  open decisions. Any decision made in chat gets written there.
- Never edit a research doc to fit a plan — research describes reality, the
  itinerary adapts.
- Append to the changelog table in `00-TRIP-OVERVIEW.md` on every session.
