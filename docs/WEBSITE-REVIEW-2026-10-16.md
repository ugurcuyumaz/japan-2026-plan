# Full website review and implementation plan — 16 October 2026

## Purpose and review method

This planner serves two travelers preparing for and traveling through Japan from 23 October to 11 November 2026. Seven hotels, Peach and the international flights are confirmed; other arrangements are unconfirmed. Tokyo choices are personal browser selections. The site must connect those choices to preparation, daily navigation, directions and saved references without implying that a reservation has been made.

A dedicated review agent examined all components and the source data after the previous improvements. The parent checked the live download flow: the single-day file contained one date, and the full pack contained all 20 days with no external rendering assets. Three Luna implementation agents are assigned separate file ownership below. The parent handles integration, live desktop/mobile checks and publication.

## Component decisions

| Area | Keep | Modify / add / remove |
| --- | --- | --- |
| Structure | Overview, route, days, ideas, reservations, stays, budget | Keep the sequence and calm notebook style; prioritize connections between existing tools |
| Overview | Confirmed-travel reassurance, countdown, relevant-day shortcut | Count preparation actions from the selected plan; explain local-time conventions |
| Navigation | Section anchors, mobile shortcuts, skip link | One day-history policy, reduced-motion-aware scrolling and selected-date visibility |
| Day discovery | Base and pace filters, date strip, search | Accent-insensitive food/place search, visible filter reset, explanation that date shortcuts cover the whole trip |
| Day cards | Summaries, planned-stop count, alternatives, pace | Consistent “Open day plan” language; retain distinct free days |
| Day focus | Hotel/checkout essentials, optional map, quick/full notes, contingencies | Visible timezone wording, truthful cost basis and matching preparation tasks from selected ideas |
| Stop cards | Directions, important transport instructions, source links | Shared human-readable reservation labels; qualify uncertain price references; avoid repeated status decoration |
| Route map | Vector styles, named/grouped pins, persistent details, list fallback | Alternatives includes backup food; counts agree with entries; defer large renderer until near viewport |
| Day map | Local visit bounds and distant endpoints retained in list | Use the same layer predicate and reservation wording as the route map |
| Map resilience | Useful place list and external directions when tiles fail | Add an error boundary for chunk/render failures and a meaningful retry that preserves filters |
| Hotels | Seven confirmed records, dates, tonight/checkout context | Use “Confirmed” consistently; retain actual booking data without inventing check-in/out details |
| Reservations | Official links, advance/day-of split, rail comparison | Add date-specific preparation actions for assigned Tokyo ideas; remove obsolete actions when a choice moves or is removed |
| Tokyo ideas | One main outing, effort filters, researched routes, optional evening | Explicit pre-assignment reservation requirements, move-to-date control and undo for replace/move/remove |
| Sharing | Review-before-apply snapshot, undo, clear browser-local scope | Retain scope; do not imply automatic synchronization |
| Budget | Two-person range, booked subtotal, exclusions and dated FX | Keep concise; qualify place/day references with unknown person/group basis; no invented personal ceiling |
| Offline plan | Working dated HTML downloads and all-day coverage | Include selected-idea tasks, food signatures/cuisine, price context and supplemental official booking links |
| Accessibility / mobile | Focus trap, background inertness, native controls | Preserve focus across history/actions; honor reduced motion; modest improvements to critical small text and 320px layout |

## Detailed implementation assignments

### Luna A — Selected-plan actions and complete saved references

Owns `bookingActions.ts`, explicit Tokyo booking metadata, `bookingLabels.ts`, `DayEssentials.tsx` and travel-pack generation/tests.

1. Add explicit action metadata for teamLab timed admission, Kawaguchiko limited-express seats and Hakone Romancecar seats using existing researched text and official references. Do not parse descriptions to infer tasks.
2. Export `buildPlannerBookings(choices): Booking[]`: static records plus stable date-specific actions for assigned ideas. Unknown prices stay absent; all new actions remain unconfirmed.
3. Let day essentials accept the same derived booking list used by the main action board.
4. Use the derived list in whole-trip and single-day saved plans. Include cuisine/signature/meal context, cautious price references, supplemental booking links and local-time labels.
5. Centralize traveler-facing reservation labels for stop/map consistency.

Acceptance: empty choices preserve original counts/statuses; assignment adds the right task; moving/removing eliminates the old date; exports carry the same task IDs and references, remain escaped and require no rendering network assets.

### Luna B — Repeated navigation and planning decisions

Owns `App.tsx`, navigation/search helpers/tests and scoped usability CSS.

1. Consume Luna A’s derived bookings in counts, day essentials, action-board rows and booking-attention filters.
2. Opening a day creates one owned history entry; changing or reselecting a day avoids extra entries; closing returns to its origin or safely replaces a direct link. Subsequent section actions must not race against history changes.
3. Centralize scrolling with reduced-motion support, keep the selected date visible, and preserve focus behavior.
4. Export and show `dayTimeLabel(day)`: Japan-local times on Japan days and local airport times for international travel.
5. Normalize search accents and search meal cuisine/signature as well as names. Add a visible reset for active filters and explain whole-trip date shortcuts.
6. Add move-to-date and complete-snapshot undo for replace/move/remove. Show known preparation requirements before assigning an idea.
7. Clarify ambiguous daily cost wording and keep the two-adult budget assumptions/exclusions intact. Use consistent human-readable hotel labels.

Acceptance: Back/Forward, direct links, repeated date selection and close behave consistently; accented meal searches work; undo restores the full selection; selected tasks and counts agree; controls fit phone widths and respect reduced motion.

### Luna C — Accurate map discovery and contained failures

Owns map renderer/wrapper, map helpers/tests, local error boundary and scoped map CSS.

1. Export `matchesMapLayer(place, filter)`. Alternatives uses the existing backup/optional definition; Food still includes backup meals.
2. Keep pins, lists and counts consistent; preserve grouped duplicate coordinates and local Nikko framing.
3. Reuse shared reservation labels and qualify costs whose person/group basis is not recorded.
4. Contain lazy import/render failure within the map. Keep the details list usable and allow retry without clearing filters.
5. Mount the overview renderer only near the viewport, with accessible reserved-space loading text and a fallback when intersection observation is unavailable.

Acceptance: backup meals appear in both applicable layers; map counts agree; failures do not take down the planner; retry preserves context; offscreen overview maps defer loading; keyboard selection and itinerary links still work.

## Integration and release checks

The agents share a checkout and have non-overlapping ownership. Shared contracts are agreed before App integration: `buildPlannerBookings`, `bookingStateLabel`, `dayTimeLabel`, `matchesMapLayer` and the optional day-essentials booking prop.

After integration: inspect all diffs, run targeted regression tests and the production build, then verify live teamLab actions, move/undo, browser history, alternative food layers, map details, real HTML downloads, desktop layout and 390px/320px phone layout. Preserve the travelers’ original selections after test mutations. Publish only the integrated verified result.

## Additional UX pass requested during implementation

The travelers asked for current, useful interaction improvements as well as content work. Add a trip-wide finder available from the header, mobile navigation and Ctrl/Cmd+K. It searches the actual selected itinerary, food details, hotels, dated reservation actions and unassigned Tokyo ideas, and takes the traveler directly to the relevant context. It never assigns an activity or changes a booking status.

Luna A owns the native-dialog component, scoped styles and a ranked, accent-insensitive search index with tests. Luna B integrates navigation targets, exact hotel/idea focus, keyboard shortcut and mobile entry points. The parent checks Escape, focus restoration, keyboard-only access, empty/no-match states, narrow viewports and result navigation. Searches are not persisted.

Interaction references checked on 16 October 2026: [W3C native modal dialog technique](https://www.w3.org/WAI/WCAG22/Techniques/html/H102), [modal focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum). The implementation targets 44px controls for common phone actions and visible focus; this is not a claim of a complete accessibility certification.

## Scope held for later

Accounts/live collaboration, geolocation, live weather, booking-confirmation toggles, expense tracking, new transport recommendations and a service-worker/PWA layer need separate product and data decisions. The current round strengthens the existing planner and preserves honest reservation, price and snapshot boundaries.

## Verification results

- Automated regression suite: 91 tests across 14 files passed. TypeScript and the production Vite build passed. The separately loaded MapLibre vendor chunk still produces a bundle-size warning.
- Live desktop: trip finder searched accented food names, opened an exact stop, opened the exact confirmed hotel and flight record, and supported Escape/focus restoration and Ctrl+K. Direct-link close, date changes, repeated selection and Back/Forward were checked.
- Live planning: assigning teamLab created the dated unconfirmed ticket task; move removed the old task; undo restored the date. Moving onto an occupied date and undoing restored both choices. Removal undo worked. The original blank Tokyo selections were restored afterward.
- Live maps: the Alternatives layer included a backup gyutan restaurant with food details and directions; the day Alternatives layer included the Toyosu lunch backup. Module/render failure containment and retry were inspected in code; a live network failure was not forced.
- Live phone checks at 390px and 320px: finder, five-item quick navigation, 16px search input, day focus, 44px Close control and long-plan scrolling were checked without horizontal overflow. Final polish wraps long phone place/result names and corrects undo feedback.
- Actual browser downloads: the selected day contained one day, and the full pack all 20 days; both included the assigned teamLab task, food context and reservation prices. Neither required external rendering assets. Directions and official links still need internet.
- The final map-loading adjustment observes 180px below the viewport, while avoiding preloading a map that is already above a direct day link.
