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

## Verification — 17 October 2026

- 145 tests in 22 files passed; strict TypeScript unused checks and production build passed. GitHub Pages build/deploy succeeded.
- Public-site checks: saved Ozu workshop survived reload; whole-plan and day snapshots included a dated evening, saved workshop and handled task; mobile day focus stayed closed until shared-plan review finished. Malformed links left decisions unchanged.
- Two real browser tabs: a stale tab retained unsaved local edits without overwriting the saved copy. Explicit Keep downloaded the previous copy; Use adopted the reviewed state. Backup restore and undo restored all three personal lists.
- Whole HTML travel pack included saved Ozu/Sokichi resources, group price and English evidence. Date-aware export restrictions have automated coverage.
- Food guide: 9 November dinner filter excluded CLANN and offered existing Kimuraya; breakfast filter included CLANN with its maintenance restriction. Existing-pool shortcut opened the correct evening.
- Main map opened Tokyo detail, confirmed stays and dated itinerary links. No browser console errors observed.
- 320×568 and 667×375 menu checks: bounded scrolling, Escape, destination heading focus, no horizontal page overflow. Added explicit Tab wrapping after native dialog focus visited the browser document boundary.
- Restored the original browser decisions after QA: no Tokyo picks, no saved ideas, no handled records. 13 advance actions remain open. No reservations made or changed.

Known limits: browser storage can be cleared by the user/browser; no backend or automatic device synchronization exists. Sharing sends a snapshot and never incorporates later edits. Venue schedules are researched references, not checked vacancies. Map routes remain stop-order references; external directions need internet. Vite retains the existing large map-vendor chunk warning; the map is deferred until needed.
