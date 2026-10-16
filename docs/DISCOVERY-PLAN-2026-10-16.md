# Research and discovery expansion — 16 October 2026

## Goal

Give the travelers a wider, researched choice of things to do and eat, with clear ways to find and compare suitable options. Keep the booked route, transfers, hotel nights and currently selected Tokyo outings intact.

## Parallel work

1. **City research:** official tourism, venue and restaurant references for Sapporo, Hakodate, Sendai, Matsushima, Nikko, Kamakura and the constrained Noboribetsu stop. Add explicit date suitability, area, reason to choose, weather focus and source links.
2. **Tokyo research:** expand the existing 14 outings and one evening with distinct neighborhoods, food, museums, gardens and shorter options. Add researched meal alternatives, realistic sample travel blocks, preparation actions and opening-calendar cautions.
3. **Discovery CX:** extract the Tokyo pool from the large App component; add useful category/weather filters and comparison of up to three ideas; create a collapsed city guide with city/type/weather filters and relevant-day navigation.
4. **Parent integration:** append researched city alternatives only to their suitable dates; include them in maps, trip search and saved plans; preserve the fixed timeline; verify the whole release and publish.

## Product rules

- City alternatives have no scheduled time and remain optional swaps. Their duration reads “if chosen.”
- Open Tokyo dates remain free until the traveler assigns an outing or evening.
- New selections reuse existing local storage, snapshot, undo and dated preparation-task behavior.
- Weather labels describe the main visits; they are not weather forecasts or promises that a whole route is sheltered.
- Travel blocks are allowances. Published venue pages establish references; date-specific calendars, availability and live transport still need checking.
- Unknown prices stay unknown. Sources are visible on the cards, and research logs record the review date.
- Compare and browsing filters do not change the plan. Keep secondary controls behind disclosures where that improves scanning.

## Integration contracts

`CityAlternative` includes `id`, `city`, `area`, `reason`, `suitableDayIds`, `weatherFit` and an existing `Place` record. `cityAlternativesForDay(dayId)` returns the matching options. `Place` records use the same stable ID, have no `startTime`, and use backup food or optional sightseeing semantics.

Tokyo activities gain `weatherFit`, `themes` and `planningCautions` metadata. Explicit `bookingActions` remain the single source for derived preparation tasks.

## Checks

Confirm secure primary sources, unique IDs, valid coordinates, sensible date suitability, named meal backups, route duration and transport origin coverage. Check that fixed commitments and raw trip data remain unchanged, new alternatives reach search/maps/exports, and new ideas remain assignable/shareable. Run tests and production build, then check the published city guide, filters, comparison, assignment/undo, keyboard access and 390px/320px layout. Restore the original browser choices after UI testing.

## Parent source check

The [official Mt. Hakodate maintenance notice](https://334.co.jp/news/2026/0406-22668/) confirms ropeway closure from 20 October through 8 November 2026, covering the Hakodate stay. Preserve the existing closure handling. The [official Tokyo November guide](https://www.gotokyo.org/en/story/guide/november/index.html) is useful seasonal context; individual events and opening calendars must be verified against the actual trip dates.
