# Japan 2026 trip planner

**[Open the live planner](https://ugurcuyumaz.github.io/japan-2026-plan/)** · 23 October–11 November 2026 · two adults · 18 hotel nights

The site is the current day-by-day plan. It includes booked stays, travel days, a vector map with named pins and place details, reservation actions, budget estimates, Tokyo activity choices, and a printable day view. Tokyo activity choices are saved in the browser you use and can be transferred with a snapshot link, reviewed before applying and reversible with undo. Day focus starts with tonight’s booked hotel, checkout context and date-specific reservation tasks; its map opens on demand. Tokyo idea routes use the selected date’s hotel, and warn about tight outing/evening combinations. The itinerary is searchable by place and base; backup meals and optional stops are kept apart from the main timeline. Maps use MapLibre with OpenFreeMap vector tiles, with street and calm styles, English labels where available, grouped nearby stops, and a place list that remains usable if the map cannot load. Dashed lines show stop order, not a walking or rail route.

## Sharing and Tokyo practical guide

Personal edits persist in the browser/device that made them. **Share your plan** creates a full snapshot link containing Tokyo picks, saved ideas and handled tasks; the recipient reviews it before replacing their own decisions. Day links include the same snapshot. Later changes require a new link. There is no shared backend or automatic cross-device synchronization. Long snapshots can be transferred as validated JSON backups instead.

Unreadable stored data is preserved for recovery instead of overwritten. Changes from another tab trigger review before this tab can overwrite them; explicit recovery actions retain the original raw copy. Native mobile navigation traps focus, supports Escape and scrolls on small screens.

**English workshops & local food** adds seven workshops with explicit English instruction or included interpretation and seven restaurant/café options near the two Tokyo hotels. Filter by hotel, candidate date, meal and saved status. Cards distinguish instruction from English web information, show price basis and restrictions, and link to operators and hotel-origin directions. No slots or tables have been checked. Saved resources are included in full travel packs and date-appropriate day packs. The existing Kimuraya izakaya evening covers the Monday dinner gap without duplicating an idea.

See the [sharing/CX plan](docs/SHARING-TOKYO-PLAN-2026-10-16.md), [English workshop research](docs/ENGLISH-WORKSHOPS-2026-10-16.md) and [hotel food research](docs/TOKYO-HOTEL-FOOD-2026-10-16.md).

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

Use **Save offline travel pack** above the daily explorer to download the current plan as a standalone HTML file, or the download icon in day focus for one date. Keep it in Downloads / Files and open it before travel. It includes the current Tokyo choices and full notes; save again after edits. Text works offline, while directions and official links require internet. The full pack includes saved ideas and action progress; single-day files include saved places for that date. The website itself does not cache an offline copy.

Day focus offers Quick view and Full notes. Transport instructions and booking warnings stay visible in Quick view. Tokyo ideas can be filtered by the sample route’s total time commitment; pace includes the selected evening as well as the main outing. Assigned ideas with known ticket or seat requirements create dated preparation tasks in the reservation board, day essentials and saved travel pack. Moving or removing an idea updates those tasks; it never confirms a reservation.

The **Travel desk** previews any date with its hotel/directions, checkout context, outstanding preparation and the next day's first planned transfer. The clock uses Japan time; previews do not change the itinerary. Use **Saved ideas** to shortlist Tokyo ideas or dated alternatives without assigning them. Their Open controls reveal the exact dated place, or the original Tokyo idea if that place is no longer in the selected plan.

Preparation tasks now have **Mark handled / Reopen** controls. Progress is saved locally, updates outstanding counts and offline references, and stays separate from the source-confirmed hotels/flights. Moving an idea creates a different dated task, which starts open. Use **Keep your decisions safe** near the bottom to download a JSON backup of all choices, saves and progress. Imports are validated and reviewed before replacing all three lists, with undo until the next edit. JSON backups transfer decisions; HTML packs are readable offline snapshots. Later edits are not automatically synchronized.

The [travel-use review and implementation](docs/ON-TRIP-CX-PLAN-2026-10-16.md) records this round's decisions, source-plan correction and verification.

The full component review and implementation decisions are recorded in [`docs/WEBSITE-REVIEW-2026-10-16.md`](docs/WEBSITE-REVIEW-2026-10-16.md). It covers navigation, discovery, day plans, Tokyo choices, maps, reservations, hotels, budget, accessibility and offline references.

Use **Find** or **Ctrl/Cmd+K** to search across days, stops, food, hotels, current preparation tasks and Tokyo ideas. Results open the relevant day, hotel, task or idea. Phone controls use larger touch areas and a persistent Close control in day focus; map rendering is deferred until its section is reached.

The **City guide** adds 18 researched food and activity alternatives for suitable dates in Sapporo, Hakodate, Sendai, Matsushima, Nikko and Kamakura. They also appear in each relevant day’s alternatives, map, search and saved plan. Tokyo now offers **23 day outings and four evenings**, with category, theme, time and indoor-focus filters and comparison of up to three ideas. Known date-specific museum closures prevent new assignments for those dates; older saved choices remain visible with a warning. Weather labels describe the main visits, not a forecast.

See the [discovery plan](docs/DISCOVERY-PLAN-2026-10-16.md), [city research](docs/CITY-RESEARCH-2026-10-16.md), [Tokyo research](docs/TOKYO-RESEARCH-2026-10-16.md) and [CX changes](docs/DISCOVERY-CX-2026-10-16.md) for sources, scope and implementation decisions.

The current website data is in [`src/data/trip.ts`](src/data/trip.ts), with rail comparisons in [`src/data/rail.ts`](src/data/rail.ts). The latest reservation summary is [`source-plan/japan-2026/RESERVATIONS_2026-10-14.md`](source-plan/japan-2026/RESERVATIONS_2026-10-14.md). Older root-level itinerary and topic Markdown files describe previous drafts and may conflict with the booked route; use the live planner for travel.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm run build
```

Pushing to `main` runs the GitHub Pages workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which tests, builds, and deploys the site.
