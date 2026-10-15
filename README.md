# Japan 2026 trip planner

**[Open the live planner](https://ugurcuyumaz.github.io/japan-2026-plan/)** · 23 October–11 November 2026 · two adults · 18 hotel nights

The site is the current day-by-day plan. It includes booked stays, travel days, a vector map with named pins and place details, reservation actions, budget estimates, Tokyo activity choices, and a printable day view. Tokyo activity choices are saved in the browser you use and can be transferred with a snapshot link, reviewed before applying and reversible with undo. Day focus starts with tonight’s booked hotel, checkout context and date-specific reservation tasks; its map opens on demand. Tokyo idea routes use the selected date’s hotel, and warn about tight outing/evening combinations. The itinerary is searchable by place and base; backup meals and optional stops are kept apart from the main timeline. Maps use MapLibre with OpenFreeMap vector tiles, with street and calm styles, English labels where available, grouped nearby stops, and a place list that remains usable if the map cannot load. Dashed lines show stop order, not a walking or rail route.

## Current route

| Dates | Base | Nights | Stay |
| --- | --- | ---: | --- |
| 24–27 Oct | Sapporo | 3 | Hotel Route-Inn Sapporo Chuo; Sapporo View Hotel Odori Park |
| 27–29 Oct | Hakodate | 2 | Pension Puppy Tail |
| 29–31 Oct | Sendai | 2 | KOKO HOTEL Sendai Kotodai Park |
| 31 Oct–2 Nov | Tokyo | 2 | Sakura Hotel Ikebukuro |
| 2–3 Nov | Nikko | 1 | Gableview Forest Inn |
| 3–11 Nov | Tokyo | 8 | Comfort Hotel Tokyo Kiyosumi Shirakawa |

Noboribetsu is a **27 October day stop** on the way to Hakodate, conditional on rail, bus, and luggage connections. There is no Noboribetsu overnight or planned onsen visit.

## Reservation status

As confirmed by the travelers on 15 October 2026, all seven hotels, Peach MM571, and the Iberia international flights are booked. Rail pass and seats, Tobu seats, taxis, inn meals, and other tickets are **not confirmed**. The site's booking board separates tasks to handle before travel from tickets bought on the day. Opening a booking link does not change its status; update the plan after a reservation is made.

The 24 October Narita connection is on separate tickets. The planned Iberia arrival is at T2 at 09:30; Peach departs T1 at 13:40 and currently requires check-in and checked-bag drop by **13:10**, with security by **13:15**. On 11 November, Narita currently lists Iberia at **T2, 3F**; confirm both terminals against the tickets. The TYO-NRT bus is usable only if each traveler's one suitcase fits its approximately 158 cm three-dimension limit. The planner shows N’EX as a fallback.

The budget is an indicative Japan-cost range for two. It excludes international airfare because the fare was not supplied, and excludes shopping. No personal budget ceiling has been provided.

## Source of truth and development

The current website data is in [`src/data/trip.ts`](src/data/trip.ts), with rail comparisons in [`src/data/rail.ts`](src/data/rail.ts). The latest reservation summary is [`source-plan/japan-2026/RESERVATIONS_2026-10-14.md`](source-plan/japan-2026/RESERVATIONS_2026-10-14.md). Older root-level itinerary and topic Markdown files describe previous drafts and may conflict with the booked route; use the live planner for travel.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm run build
```

Pushing to `main` runs the GitHub Pages workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which tests, builds, and deploys the site.
