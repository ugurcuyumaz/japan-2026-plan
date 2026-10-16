# Travel use review and implementation — 16 October 2026

## Current coverage

The current plan includes the seven booked hotels, confirmed Peach and international flights, the constrained Noboribetsu stop, Matsushima, Nikko, Kamakura and seven open Tokyo dates. The previous release added 18 alternatives (Sapporo 5, Hakodate 3, Sendai 2, Matsushima 4, Nikko 2, Kamakura 2), and expanded Tokyo from 14 outings/one evening to 23 outings/four evenings. Noboribetsu retains its existing choices to protect the luggage, bus and rail buffer.

A fresh review agent read the components, planner data and previous review. The main remaining gap is remembering decisions and reaching useful information during travel. More undifferentiated content would increase browsing effort.

## Major changes

1. **Travel desk:** a date preview near the top, Japan time, tonight's confirmed hotel and directions, checkout/luggage context, open preparation actions and the following day's first planned transfer. Previewing does not mutate the plan/history. Before/after travel it uses a clearly labeled first/final-day preview. No live transport inference.
2. **Action progress:** explicit Mark handled/Reopen controls saved locally. `Booking.handledAt` annotates the original record; source `status` remains unchanged. Open counts, hero recommendations, day essentials, finder and saved HTML use the same annotated list. Handled tasks have their own view. A Tokyo action moved to a new date gets a newly open task; exact old progress is retained in backup but does not apply to the new date.
3. **Persistent shortlist:** save Tokyo ideas and dated places without assigning them. One compact saved section, saved-only discovery filters and exact-context navigation. Keys are `idea:<id>` and `place:<dayId>:<placeId>`. Comparison remains temporary and independent. Save buttons are outside disclosure summaries.
4. **Backup/restore:** a versioned JSON file containing Tokyo choices, progress and saved keys. Strict bounded validation, readable preview, explicit full replacement and undo. This is distinct from the read-only offline HTML travel pack and Tokyo-only sharing links. No accounts, automatic sync or confirmation numbers.

## Smaller changes and removals

- Replace the two hardcoded hero tasks with the first relevant outstanding tasks.
- Extract the reservation board from App; keep existing rail comparison as a child.
- Replace broad research-stop booking attention with actual outstanding dated actions, so completed arrangements leave the filter.
- Collapse secondary Tokyo filters behind a labeled disclosure with active count and reset; preserve direct search and activity type.
- Keep 44px common controls, visible focus, concise result/operation announcements and narrow-screen wrapping.
- Add direct Saved and Travel desk navigation without expanding the phone bottom bar beyond five controls.

## Ownership and contracts

- Luna actions owns `bookingProgress.ts`, tests, BookingBoard and scoped CSS, booking type annotation, day brief/essentials, finder subtitles, travel-pack/TravelPackButton integration. Parent removes the old board and passes callbacks.
- Luna shortlist owns shortlist validation/index/tests, SavedIdeas, CityGuide/TokyoActivityPool save/filter controls and scoped CSS. Parent integrates saved state and adds dated-place save controls in day alternatives.
- Luna travel desk owns TravelDesk, its data helper/tests and scoped CSS. Parent mounts it and passes the same planned days/bookings/choices/progress.
- Parent owns App state/integration, JSON backup/restore component/data/tests, navigation, final review and release.

## Acceptance

Source-confirmed reservations never become editable confirmations. Handling a task updates all open counts and exports; reopening reverses it. Saving does not assign or alter a day. Exact saved alternatives reveal their dated row. Reload preserves state. Restore validates all domains before changing any, previews the replacement and supports undo. Malformed/oversized/unknown IDs are rejected. Original browser state is restored after live checks. Run meaningful regression tests, production build, actual HTML/JSON download/import checks and desktop/390px/320px QA before publication.

## Interaction references

Use native disclosures with visible state and standard keyboard behavior ([W3C disclosure guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)). Browser-local data persists across sessions but needs an explicit transfer/backup path ([MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)). Retain the working standalone offline HTML rather than introducing caching behavior in this change.

## Integration details

The parent stores all three personal domains in one versioned browser record, migrating existing Tokyo picks on first use. This makes restore a single state replacement and a single persistent write. Undo for a restore is cleared after a subsequent edit. Source-confirmed hotels/flights remain untouched. Saved-only filters and temporary comparison are independent.

The plan review found that Mt Moiwa was optional but its outbound and return transfers still appeared in the fixed evening timeline. Those two rows were removed from the scheduled plan; the optional visit now carries its access and return allowances. Its venue and fare sources remain unchanged.

The readable full-trip export now includes the saved shortlist, with source links, museum date limits and preparation notes. A day export includes saved places for that date. Saving an unassigned Tokyo idea does not populate a dated main timeline.

## Verification and review

- The integrated source passes strict TypeScript (including unused imports), production build and 115 regression tests across 19 files. Existing deferred MapLibre bundle-size warning remains.
- A second review caught stale booking-focus requests after progress edits, lost offline source links for a saved restaurant after its outing moved, and focus loss after Unsave/restore Undo. These were corrected before the published interaction checks.
- Live desktop checks: handled/reopen flow, correct count changes, no jump to an older focused action, saved city/Tokyo choices, saved-only guide results, exact dated alternative reveal and reload persistence.
- Moving the selected Sunshine City outing from 4 to 6 November produces a newly open dated task; the old handled task disappears from active lists and remains in the backup. Its saved 4 November restaurant offers the source idea instead of pretending it is still in the dated plan.
- Actual JSON downloads were inspected: original state had 0 picks/0 saves/0 progress; the edited test backup had 1 pick/3 saves/2 progress records. Import rejects invalid JSON before any change; valid import previews all three domains, replaces them together, and undo restores them together and returns keyboard focus to Import. The original state was restored and survived reload.
- The actual full HTML download includes 20 dates, local handled progress, saved options and the inactive saved restaurant's map and official source links, without rendering network assets. External map/direction/official links require internet.
- Live phone checks at 390px and 320px covered Travel desk, native date selector, action controls and backup replacement preview, without horizontal document overflow. Main action-view controls measured 44px. At 320px the collapsed Tokyo filters correctly reported two active filters and two matching indoor/art ideas; Clear restored the full pool. The desk's longer narrative was moved into a disclosure to bring hotel details closer to the initial phone view.
