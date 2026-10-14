import { describe, expect, it } from 'vitest';
import {
  individualRailTotalJPY,
  individualRailTotalWithMatsushimaJPY,
  railDecision,
} from './rail';

describe('rail pass comparison', () => {
  it('covers the actual planned JR travel dates with the latest possible six-day window', () => {
    expect(railDecision.validFrom).toBe('2026-10-27');
    expect(railDecision.validThrough).toBe('2026-11-01');
    expect(railDecision.segments.map(({ date }) => date)).toEqual(['27 Oct', '27 Oct', '29 Oct', '31 Oct']);
    expect(railDecision.passJPY).toBe(40_000);
    expect(railDecision.purchaseStatus).toBe('unknown');
    expect(railDecision.people).toBe(2);
  });

  it('uses the published Noboribetsu route-table illustration without claiming a quote or saving', () => {
    expect(railDecision.fareConstruction.officialNoboribetsuRouteToSendaiJPY).toBe(34_210);
    expect(railDecision.fareConstruction.officialRouteComponents.reduce((sum, fare) => sum + fare, 0)).toBe(34_210);
    expect(railDecision.fareConstruction.plannedRouteTableIllustrationJPY).toBe(45_620);
    expect(individualRailTotalJPY).toBe(45_620);
    expect(railDecision.comparison.routeTableDifferenceBeforeLocalRideJPY).toBe(5_620);
    expect(railDecision.additionalCoveredRide.estimatedFareRangeJPY).toEqual([840, 880]);
    expect(railDecision.comparison.individualCorePlusMatsushimaJPY).toEqual([46_460, 46_500]);
    expect(individualRailTotalWithMatsushimaJPY).toBe(46_500);
    expect(railDecision.fareConstruction.shinhakodateHokutoToSendaiReferenceJPY).toBe(18_280);
    expect(railDecision.fareConstruction.discrepancyVsPreviouslySummedPartialReferencesJPY).toBe(3_250);
    expect(railDecision.fareConstruction.hakodateLinerSeparatelyPriced).toBe(false);
    expect(railDecision.fareConstruction.exactDatedTicketConstruction).toBe('unresolved');
    expect(railDecision.comparison.fareSourceStatus).toContain('unresolved');
    expect(railDecision.comparison.partyOfTwoPassPriceJPY).toBe(80_000);
    expect(railDecision.comparison.partyOfTwoRouteTableCoreJPY).toBe(91_240);
    expect(railDecision.comparison.partyOfTwoDifferenceBeforeLocalRideJPY).toBe(11_240);
  });

  it('keeps the Tohoku-pass comparison to product-price arithmetic, not a trip-saving claim', () => {
    expect(railDecision.comparison.tohokuPassJPY).toBe(32_000);
    expect(railDecision.comparison.sendaiTokyoOutsideTohokuPassJPY).toBe(11_410);
    expect(railDecision.comparison.tohokuPassPlusTokyoCoreJPY).toBe(43_410);
    expect(railDecision.comparison.tohokuAlternativeExtraProductCostVsEastSouthPassJPY).toBe(3_410);
  });

  it('tracks out-of-window transport and distinguishes the pass-covered Matsushima local trip', () => {
    expect(railDecision.trackedJourneys).toContainEqual(expect.objectContaining({ date: '24 Oct', route: 'New Chitose Airport → Sapporo (Rapid Airport)' }));
    expect(railDecision.trackedJourneys).toContainEqual(expect.objectContaining({ date: '2 Nov', route: 'Asakusa → Tobu-Nikko (Tobu limited express)' }));
    expect(railDecision.trackedJourneys).toContainEqual(expect.objectContaining({ date: '3 Nov', route: 'Tobu-Nikko → Asakusa (Tobu limited express)' }));
    expect(railDecision.trackedJourneys.find(({ date }) => date === '30 Oct')?.reason).toContain('covered by the candidate pass');
    expect(railDecision.trackedJourneys.find(({ date }) => date === '11 Nov')?.reason).toContain('bus is not rail');
  });

  it('has working-shaped HTTPS links to official JR/Tobu purchase, fares, rules, and route guidance', () => {
    const officialLinks = [
      railDecision.passPurchaseUrl,
      railDecision.passTermsUrl,
      railDecision.reservationUrl,
      railDecision.passPurchaseInstructionsUrl,
      railDecision.tohokuPassUrl,
      railDecision.baggageGuidanceUrl,
      railDecision.shinkansenRouteInfoUrl,
      railDecision.regularTicketsUrl,
      railDecision.jrHokkaidoTrainSearchUrl,
      railDecision.airportTrainInfoUrl,
      railDecision.naritaExpressTicketsUrl,
      railDecision.airportBusInfoUrl,
      railDecision.tobuReservationUrl,
    ];
    const parsed = officialLinks.map((link) => new URL(link));
    expect(parsed.every(({ protocol }) => protocol === 'https:')).toBe(true);
    expect(parsed.every(({ hostname }) => hostname === 'www.jreast.co.jp' || hostname === 'www.eki-net.com' || hostname === 'www.jrhokkaido.co.jp' || hostname === 'www.tobu.co.jp' || hostname === 'tyo-nrt.com')).toBe(true);
    expect(new URL(railDecision.passPurchaseUrl).pathname).toBe('/en/multi/pass/easthokkaido.html');
    expect(new URL(railDecision.passTermsUrl).pathname).toBe('/en/multi/pass/easthokkaido_terms.html');
    expect(new URL(railDecision.reservationUrl).pathname).toBe('/en/jreast-train-reservation/Top/Index');
    expect(new URL(railDecision.passPurchaseInstructionsUrl).pathname).toBe('/en/multi/pass/purchase_hokkaido.html');
    expect(new URL(railDecision.baggageGuidanceUrl).pathname).toBe('/en/multi/luggage-area/');
    expect(new URL(railDecision.regularTicketsUrl).pathname).toBe('/global/english/ticket/regular/index.html');
    expect(new URL(railDecision.airportTrainInfoUrl).pathname).toBe('/global/english/travel/airport.html');
    expect(new URL(railDecision.naritaExpressTicketsUrl).pathname).toBe('/en/multi/nex/tickets/');
    expect(new URL(railDecision.airportBusInfoUrl).pathname).toBe('/en/flow');
    expect(new URL(railDecision.tobuReservationUrl).pathname).toBe('/en/express_info/purchase/');
  });
});

