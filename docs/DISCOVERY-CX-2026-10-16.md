# Discovery experience · 16 October 2026

## What changed

- The Tokyo activity pool now lives in `src/app/TokyoActivityPool.tsx`; its existing assignment, removal, undo, sharing, date, and request props remain intact.
- Tokyo browsing keeps the activity kind and time filters, adds the actual pool categories from `tokyoPoolCategories`, and adds weather and theme filters backed by each activity's metadata.
- Up to three Tokyo ideas can be compared in an in-flow panel. The panel shows duration, area, weather fit, main visits, meal options, cautions or advance tasks, and source links. Remove and clear controls are available. Choosing a date updates the existing browse date; adding or replacing a dated idea still uses the existing assignment control and planner state.
- Date-specific closure data disables a new assignment or move for that date and shows the supplied reason. Existing saved choices remain visible with the warning so a prior choice is not silently rewritten.
- The collapsed City guide sits between the dated plan and Tokyo pool. Its city, food or sight, and indoor filters show sourced map links, area, time allowance, cuisine, and a route-relevant day shortcut. These alternatives remain optional swaps.
- Day focus explains that its alternatives are swaps, displays source-link counts, and lets the reader filter all, food, or things to do. The filter resets when the day changes or a place is selected, preserving finder and map jumps.

## State and planning behavior

Compare selection and the comparison date are session-only React state. They do not create a booking, itinerary assignment, or persisted choice. The selected comparison date only supplies the existing Tokyo pool date picker when opening a compared idea. An assignment is still explicit and flows through the established planner mutation callbacks.

City alternatives are displayed from `src/data/cityAlternatives.ts`. Their dated plan, map, search, and export integration is handled by the shared planner layer; the guide itself does not append them a second time. Their `role: 'backup'` values keep them out of the main day timeline.

## Accessibility and responsive behavior

The guide uses native collapsed `details` disclosure, labeled native filters, live result counts, and 44 px minimum controls for the main actions. Comparison stays in document flow and introduces no modal or focus trap. Existing reduced-motion styles continue to cover the page. The cards and filters use the shared focus colors and narrow layouts collapse to one column.

## Verification

`pnpm run build` completed successfully on 16 October 2026, including TypeScript and the Vite production build. The output retains the pre-existing large MapLibre vendor chunk notice. No browser viewport QA or interaction automation was run in this work slice.
