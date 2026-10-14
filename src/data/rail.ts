/**
 * JR pass comparison for the confirmed itinerary as of 14 October 2026.
 * Published route-table figures below are illustrations, not dated checkout quotes.
 * The exact fare/ticket construction for the Hakodate–Sendai route remains unresolved.
 */
export const railDecision = {
  passName: 'JR East–South Hokkaido Rail Pass',
  passJPY: 40_000,
  people: 2,
  // Six consecutive days: starting 27 Oct covers every planned JR trip through 31 Oct;
  // 26 Oct was an unnecessary early start in the previous version.
  validFrom: '2026-10-27',
  validThrough: '2026-11-01',
  purchaseStatus: 'unknown',
  segments: [
    { date: '27 Oct', route: 'Sapporo → Noboribetsu (Ltd. Exp. Hokuto)', fareJPY: 4_890 },
    { date: '27 Oct', route: 'Noboribetsu → Hakodate (Ltd. Exp. Hokuto)', fareJPY: 7_790 },
    {
      date: '29 Oct',
      route: 'Hakodate → Sendai (JR Hokkaido route-table illustration; exact construction unresolved)',
      fareJPY: 21_530,
    },
    { date: '31 Oct', route: 'Sendai → Tokyo (Hayabusa 10)', fareJPY: 11_410 },
  ],
  // The published route-table value for Hakodate→Sendai is 8,490 + 6,250 + 6,790 = 21,530.
  // Hakodate Liner is not separately priced in this table. Do not add the 18,280
  // Shin-Hakodate-Hokuto→Sendai reference on top of 21,530; that double counts a
  // different route construction. None of these amounts is a dated purchase quote.
  fareConstruction: {
    officialNoboribetsuRouteToSendaiJPY: 34_210,
    officialRouteComponents: [4_890, 7_790, 8_490, 6_250, 6_790],
    shinhakodateHokutoToSendaiReferenceJPY: 18_280,
    officialSendaiTokyoReferenceJPY: 11_410,
    plannedRouteTableIllustrationJPY: 45_620,
    discrepancyVsPreviouslySummedPartialReferencesJPY: 3_250,
    hakodateLinerSeparatelyPriced: false,
    exactDatedTicketConstruction: 'unresolved',
  },
  additionalCoveredRide: {
    route: 'Sendai ↔ Matsushima-Kaigan (Senseki Line)',
    fareJPY: 880,
    estimatedFareRangeJPY: [840, 880],
    status: 'approximate',
    includedInCoreTotal: false,
  },
  comparison: {
    // Not savings: the point-to-point side uses published route-table references,
    // leaves the Senseki return as an estimate, and is not a live ticket quote.
    individualCoreJPY: 45_620,
    individualCorePlusMatsushimaJPY: [46_460, 46_500],
    passPriceJPY: 40_000,
    routeTableDifferenceBeforeLocalRideJPY: 5_620,
    routeTableDifferenceIncludingEstimatedMatsushimaJPY: [6_460, 6_500],
    partyOfTwoPassPriceJPY: 80_000,
    partyOfTwoRouteTableCoreJPY: 91_240,
    partyOfTwoDifferenceBeforeLocalRideJPY: 11_240,
    tohokuPassJPY: 32_000,
    sendaiTokyoOutsideTohokuPassJPY: 11_410,
    tohokuPassPlusTokyoCoreJPY: 43_410,
    tohokuAlternativeExtraProductCostVsEastSouthPassJPY: 3_410,
    fareSourceStatus: 'published-route-table-illustration; exact-ticket-baseline-unresolved',
  },
  // Trip rail legs around the pass-comparison core, plus the covered local excursion.
  trackedJourneys: [
    { date: '24 Oct', route: 'New Chitose Airport → Sapporo (Rapid Airport)', reason: 'before pass validity; JR Hokkaido lists ¥1,230 non-reserved' },
    { date: '30 Oct', route: 'Sendai ↔ Matsushima-Kaigan (Senseki Line)', reason: 'covered by the candidate pass; local round-trip fare remains approximate and excluded from core' },
    { date: '2 Nov', route: 'Asakusa → Tobu-Nikko (Tobu limited express)', reason: 'outside pass validity and not the planned JR/Tobu through-service' },
    { date: '3 Nov', route: 'Tobu-Nikko → Asakusa (Tobu limited express)', reason: 'outside pass validity and not the planned JR/Tobu through-service' },
    { date: '11 Nov', route: 'Tokyo → Narita Airport (planned TYO-NRT bus; N’EX rail alternative)', reason: 'outside pass validity; bus is not rail/pass-covered' },
  ],
  passPurchaseUrl: 'https://www.jreast.co.jp/en/multi/pass/easthokkaido.html',
  passTermsUrl: 'https://www.jreast.co.jp/en/multi/pass/easthokkaido_terms.html',
  reservationUrl: 'https://www.eki-net.com/en/jreast-train-reservation/Top/Index',
  passPurchaseInstructionsUrl: 'https://www.jreast.co.jp/en/multi/pass/purchase_hokkaido.html',
  tohokuPassUrl: 'https://www.jreast.co.jp/en/multi/pass/tohokuhokkaido.html',
  baggageGuidanceUrl: 'https://www.jreast.co.jp/en/multi/luggage-area/',
  shinkansenRouteInfoUrl: 'https://www.jreast.co.jp/en/multi/routemaps/tohokushinkansen.html',
  regularTicketsUrl: 'https://www.jrhokkaido.co.jp/global/english/ticket/regular/index.html',
  jrHokkaidoTrainSearchUrl: 'https://www.jrhokkaido.co.jp/global/english/train/',
  airportTrainInfoUrl: 'https://www.jrhokkaido.co.jp/global/english/travel/airport.html',
  naritaExpressTicketsUrl: 'https://www.jreast.co.jp/en/multi/nex/tickets/',
  airportBusInfoUrl: 'https://tyo-nrt.com/en/flow',
  tobuReservationUrl: 'https://www.tobu.co.jp/en/express_info/purchase/',
} as const;

// Published JR Hokkaido route-table illustration for the planned route via Noboribetsu,
// plus its separately published Sendai→Tokyo reference. Not a quote or promised total.
export const individualRailTotalJPY = railDecision.segments.reduce((sum, segment) => sum + segment.fareJPY, 0);

// Compatibility point estimate for the existing UI; explicitly an illustration, not a saving.
export const individualRailTotalWithMatsushimaJPY = individualRailTotalJPY + railDecision.additionalCoveredRide.fareJPY;

