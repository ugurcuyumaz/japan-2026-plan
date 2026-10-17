# Reliable sharing and Tokyo practical guide — 16 October 2026

## User decision and scope

The user confirmed there is no existing shared backend and requested improvements to sharing now. GitHub Pages serves a common published itinerary; personal choices, saves and progress are browser-local. Implement full reviewed snapshots, not a claim of automatic synchronization between devices. Continue primary-source research for English-taught Tokyo workshops and practical meals near both booked Tokyo hotels in parallel.

## Reviewed issues to fix

- Unsupported browser data currently falls back to empty and is overwritten on mount. Preserve it and provide recovery/reset/restore.
- Separate tabs can overwrite stale copies. Listen for external changes, compare storage before saving and present a conflict before overwriting.
- Tokyo-only sharing has a stale independent Undo. Use the parent transaction and invalidate after subsequent edits.
- Copied day links omit selected Tokyo outings. Include a reviewed snapshot and reveal the requested date after reviewing.
- The phone menu needs bounded scrolling, contained focus, background inertness and destination focus.
- A proposed move must preview the new date's hotel. Closure checks must also run at the mutation boundary.

## Implementation

1. Luna persistence owns a tested storage controller/hook. Expose current state, functional update, reviewed replace, recovery raw file, external-change review, accept/keep controls and save status. Initialization never overwrites invalid data. Parent integrates it into App and adds visible save/share status and recovery/conflict controls.
2. Parent implements bounded full-plan snapshot links in the URL fragment using the existing validated backup schema, a readable review before use, dismissal, centralized Undo and date-link sequencing. Retain JSON backup for links that are too large. Later edits remain independent. Parent also handles menu extraction/refinement and mutation guards.
3. Research agents verify workshop instruction language explicitly, operator location, duration, price basis, preparation and actual date restrictions. An English website alone is insufficient. Nearby food research uses named venues, official sources, hotel relevance, meal service and closure/booking notes. No invented prices, exact walking times or available slots.
4. Once sources are reviewed, implement a Tokyo practical guide with workshop/food filters, source links, language evidence, suitable-date notes, map actions and saving to the existing shortlist. Saved resources reach search and readable offline exports. These references do not silently assign activities or book anything.

## Verification

Test legacy migration, unsupported-data preservation, storage failure, stale-tab conflicts and resolutions, snapshot validation/limits, review-before-apply, undo invalidation and closure guards. Confirm actual JSON/HTML downloads, public live share/day-link navigation, cross-tab state behavior, keyboard menu operation, 390px and 320×568 layout. Restore original browser decisions after testing and publish the integrated result.
