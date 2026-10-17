# Japan 2026 shared trip

**[Open the live shared planner](https://japan-2026-shared-plan.ugurcanuyumaz.chatgpt.site/)** · 23 October–11 November 2026 · two adults · 18 hotel nights.

The [original GitHub Pages link](https://ugurcuyumaz.github.io/japan-2026-plan/) forwards to the managed shared planner, preserving day links and older snapshot payloads for explicit review.

## One plan for everyone

Everyone can read the canonical trip without signing in. Only the two email accounts explicitly chosen by the owner may edit. Editors use the simple email-and-password form. Authorization is checked on the server using a server-only allowlist and an expiring session. ChatGPT sign-in is not required. Picks, saved ideas and handled preparation tasks are stored in a managed D1 database. Open pages refresh every eight seconds and when focused. Conflicting saves require review; failed saves retain a recoverable draft. Offline HTML and editable JSON downloads are dated snapshots.

All seven hotels, Peach and international flights remain source-confirmed. Other reservations are not confirmed. The website does not make bookings or payments. Workshop and food availability remains unverified.

## Current features

- Complete 20-day itinerary, confirmed stays, transport/booking tasks and indicative budget.
- MapLibre route/day maps with labeled pins, details, directions and place-list fallback.
- 18 researched alternatives across the cities; Tokyo has 23 outings, four evenings, seven English workshop options and seven hotel-food additions.
- Search, mobile day focus, saved ideas, date restrictions and offline travel packs.

## Source and maintenance

The maintained shared app has its own Sites source repository and is checked out locally in `shared-site/` (ignored by this GitHub repository). Its persisted identity is in `shared-site/.openai/hosting.json`. Use the Sites skill and existing project ID to open/update/publish that source; do not create another Site. Its frontend is under `planner/`, API under `app/api/shared-trip/`, schema under `db/` and generated migrations under `drizzle/`.

This GitHub repository now publishes the forwarding page. Its `src/` files remain the previous static planner implementation for reference; republishing them would restore browser-only decisions. Historical research and source-plan documents are retained under `docs/` and `source-plan/`.

See [shared-trip rollout](docs/SHARED-TRIP-ROLLOUT-2026-10-17.md) for architecture, verification and current limits.
