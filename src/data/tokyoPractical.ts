export type TokyoResourceKind = 'workshop' | 'food';
export type TokyoMealTag = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface TokyoResource {
  id: string;
  kind: TokyoResourceKind;
  title: string;
  area: string;
  address?: string;
  description: string;
  mapsQuery: string;
  hotelId?: 'stay-tokyo-long' | 'stay-tokyo-halloween';
  durationLabel?: string;
  priceLabel: string;
  languageLabel: string;
  languageEvidenceUrl?: string;
  scheduleNote: string;
  candidateDayIds: string[];
  notes: string[];
  sources: { label: string; url: string }[];
  bookingUrl?: string;
  mealTags?: TokyoMealTag[];
  mealByDate?: Record<string, TokyoMealTag[]>;
  checkedOn: '2026-10-16';
}

/** Meal times supported by the published schedule for this date. */
export function resourceMeals(resource: TokyoResource, dayId?: string): TokyoMealTag[] {
  if (resource.kind !== 'food') return [];
  if (!dayId) return [...(resource.mealTags ?? [])];
  if (!resource.candidateDayIds.includes(dayId)) return [];
  if (resource.mealByDate && Object.prototype.hasOwnProperty.call(resource.mealByDate, dayId)) return [...(resource.mealByDate[dayId] ?? [])];
  return [...(resource.mealTags ?? [])];
}

const workshopDays = ['2026-11-01', '2026-11-04', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'];

export const tokyoResources: TokyoResource[] = [
  {
    id: 'nihonbashi-origami', kind: 'workshop', title: 'Washi-paper origami', area: 'Nihonbashi',
    description: 'Fold designs with washi paper at the Omotenashi Nihonbashi information center.', mapsQuery: 'Omotenashi Nihonbashi COREDO Muromachi 1',
    durationLabel: '30 or 60 minutes', priceLabel: '¥1,500/person (30 min) or ¥2,500/person (60 min)',
    languageLabel: 'English instruction', languageEvidenceUrl: 'https://nihonbashi-info.jp/omotenashi/workshop.html',
    scheduleNote: 'Daily 11:30–18:00; advance or same-day reservation. Check the exact session with the operator.', candidateDayIds: workshopDays,
    notes: ['Take home your folded designs.', '1–5 participants.', 'Participation terms generally allow no refund after payment; video recording is prohibited.'], sources: [{ label: 'Omotenashi Nihonbashi workshops', url: 'https://nihonbashi-info.jp/omotenashi/workshop.html' }, { label: 'Participation terms', url: 'https://nihonbashi-info.jp/omotenashi/attention.html' }],
    bookingUrl: 'https://nihonbashi-info.jp/omotenashi/workshop.html', checkedOn: '2026-10-16',
  },
  {
    id: 'ozu-washi-making', kind: 'workshop', title: 'Ozu Washi paper-making', area: 'Nihonbashi',
    description: 'Make paper through the Omotenashi Nihonbashi concierge; partner meeting point needs confirmation.', mapsQuery: 'Ozu Washi Nihonbashi Tokyo',
    durationLabel: 'About 60 minutes', priceLabel: '¥9,000/group (up to 4 people)',
    languageLabel: 'English instruction via concierge', languageEvidenceUrl: 'https://nihonbashi-info.jp/omotenashi/workshop.html',
    scheduleNote: 'Published sessions Tue–Sat at 11:30, 14:00 or 15:00. Candidate trip dates: 4, 6, 7 and 10 Nov only; these are not confirmed seats.',
    candidateDayIds: ['2026-11-04', '2026-11-06', '2026-11-07', '2026-11-10'],
    notes: ['Take home the paper you make.', 'Advance request required; submitting the form is not confirmation.', 'Generally no refund after payment; partner sessions may cancel when over 15 minutes late.', 'Video recording is prohibited.'],
    sources: [{ label: 'Omotenashi Nihonbashi workshops', url: 'https://nihonbashi-info.jp/omotenashi/workshop.html' }, { label: 'Participation terms', url: 'https://nihonbashi-info.jp/omotenashi/attention.html' }],
    bookingUrl: 'https://form.jotform.com/262232423112037', checkedOn: '2026-10-16',
  },
  {
    id: 'nijiyura-tenugui', kind: 'workshop', title: 'Nijiyura tenugui dyeing', area: 'Nihonbashi',
    description: 'Apply a resist paste and dye a tenugui with guidance through the Omotenashi Nihonbashi concierge.', mapsQuery: 'Nijiyura Nihonbashi Tokyo',
    durationLabel: 'About 90 minutes', priceLabel: '¥10,600/person',
    languageLabel: 'English interpreter included', languageEvidenceUrl: 'https://nihonbashi-info.jp/omotenashi/workshop.html',
    scheduleNote: 'Schedule by inquiry; no fixed dates published. Ask the operator about a suitable candidate date and meeting point.', candidateDayIds: workshopDays,
    notes: ['Take home your towel.', 'Up to 2 participants; advance request required.', 'Generally no refund after payment; partner sessions may cancel when over 15 minutes late.', 'Video recording is prohibited.'],
    sources: [{ label: 'Omotenashi Nihonbashi workshops', url: 'https://nihonbashi-info.jp/omotenashi/workshop.html' }, { label: 'Participation terms', url: 'https://nihonbashi-info.jp/omotenashi/attention.html' }],
    bookingUrl: 'https://form.jotform.com/262232423112037', checkedOn: '2026-10-16',
  },
  {
    id: 'sokichi-kiriko', kind: 'workshop', title: 'Sokichi kiriko glass engraving', area: 'Asakusa',
    description: 'Engrave a clear base glass in a compact hands-on class near Asakusa Station.', mapsQuery: 'Sokichi 2-1-14 Kaminarimon Tokyo',
    durationLabel: '90 minutes', priceLabel: '¥3,630/person for clear base glass; colored or shaped glass adds ¥1,100–4,510',
    languageLabel: 'English instruction (request English)', languageEvidenceUrl: 'https://en.sokichi-workshop.com/q-a',
    scheduleNote: 'Weekday starts listed at 10:15, 13:00 and 15:00; weekends add starts. Availability and any 17:00 surcharge need confirmation.', candidateDayIds: workshopDays,
    notes: ['Hair ties or eyeglasses may help; studio is upstairs without an elevator.', 'Shipping is available by quote; protect the finished glass in luggage.', 'The overview says cash only while the booking form describes confirmation followed by payment; confirm payment instructions.', 'A submitted form is not a confirmed reservation.'],
    sources: [{ label: 'English-language FAQ', url: 'https://en.sokichi-workshop.com/q-a' }, { label: '90-minute course', url: 'https://en.sokichi-workshop.com/90min' }, { label: 'Access', url: 'https://en.sokichi-workshop.com/access' }],
    bookingUrl: 'https://booking.sokichi-workshop.com/?course=lecture&lang=en', checkedOn: '2026-10-16',
  },
  {
    id: 'mon-cadeau-kintsugi', kind: 'workshop', title: 'mon cadeau modern kintsugi', area: 'Shibuya',
    description: 'Repair a piece with modern materials and gold-colored powder; this is not a full traditional urushi restoration.', mapsQuery: 'Dogenzaka Plaza Nishinaya Building Shibuya',
    durationLabel: '2 hours', priceLabel: '¥19,980/person (¥39,960 for two)',
    languageLabel: 'English instruction', languageEvidenceUrl: 'https://www.moncadeau.jp/',
    scheduleNote: 'No November session availability verified; request a date with the operator.', candidateDayIds: workshopDays,
    notes: ['Wear clothes suitable for glue and paint.', 'Cancellations incur a 10% fee; within seven days they are non-refundable.', 'Ask the operator for care instructions; food-safe use and curing time are not promised.'],
    sources: [{ label: 'Official class information', url: 'https://www.moncadeau.jp/' }, { label: 'Classes and cancellation terms', url: 'https://www.moncadeau.jp/ja/book' }],
    bookingUrl: 'https://www.moncadeau.jp/ja/book', checkedOn: '2026-10-16',
  },
  {
    id: 'cooking-sun-tokyo', kind: 'workshop', title: 'Cooking Sun Tokyo: sushi or Japanese home cooking', area: 'Shinanomachi, Shinjuku',
    description: 'Choose one three-hour English cooking class; use its meal as the meal anchor for that date.', mapsQuery: 'Maya Shinanomachi II 18-39 Shinanomachi Tokyo',
    durationLabel: '3 hours', priceLabel: '¥10,000/person for 2–3 adults booking together; ¥10,500 solo',
    languageLabel: 'English instruction', languageEvidenceUrl: 'https://www.cooking-sun.com/',
    scheduleNote: 'Published daily classes: Wagyu + seven dishes 09:30–12:30; sushi 13:30–16:30. November vacancies unverified.', candidateDayIds: workshopDays,
    notes: ['Ask about dietary substitutions before booking.', 'Sushi uses pre-sliced fish; it is not a sashimi-cutting lesson.', 'Save the detailed directions and use the right-hand entrance/intercom 314.', 'Refund ladder: 100% over 7 days, 80% 2–6 days, 50% one day, none day-of/no-show; clarify the exact 7-day boundary.'],
    sources: [{ label: 'Cooking Sun English classes', url: 'https://www.cooking-sun.com/' }, { label: 'Tokyo course and directions', url: 'https://www.cooking-sun.com/tokyo-cooking-class/' }],
    bookingUrl: 'https://www.cooking-sun.com/tokyo-cooking-class/', checkedOn: '2026-10-16',
  },
  {
    id: 'taiko-lab-private', kind: 'workshop', title: 'Taiko-Lab English private taiko', area: 'Aoyama or Akihabara (confirm studio)',
    description: 'Private drumming lesson with an instructor performance; confirm which studio is actually booked.', mapsQuery: 'Taiko-Lab Aoyama Tokyo',
    durationLabel: '60 minutes', priceLabel: 'Ask for a two-person quote',
    languageLabel: 'Easy English instruction', languageEvidenceUrl: 'https://www.taikolab.com/world/',
    scheduleNote: 'Date, quote, meeting point and studio require operator confirmation; no dated vacancies verified.', candidateDayIds: workshopDays,
    notes: ['Program includes instruction, instruments/sticks and an instructor performance.', 'A ¥6,160 public listing is not established as the final price for a two-person private English lesson.', 'Ask about preparation and cancellation instructions.'],
    sources: [{ label: 'Taiko-Lab visitor program', url: 'https://www.taikolab.com/world/' }, { label: 'GO TOKYO Aoyama listing', url: 'https://www.gotokyo.org/en/workshop/sd033/index.html' }],
    bookingUrl: 'https://www.taikolab.com/world/', checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-ichibanboshi', kind: 'food', title: 'Ichibanboshi · local izakaya / yoshoku', area: 'Shirakawa, Koto', address: '1-4-18 Shirakawa, Furuya Building 1-B, Koto-ku',
    description: 'A neighborhood izakaya with proper meal dishes such as pork sauté, garlic shrimp and seasonal items.', mapsQuery: '1-4-18 Shirakawa, Koto City, Tokyo',
    hotelId: 'stay-tokyo-long', priceLabel: 'Ask venue; price not verified', languageLabel: 'English menu and spoken service not verified',
    scheduleNote: 'Lunch 11:30–14:00; dinner 17:00–23:00, hours subject to change. Dinner closed Monday and Tuesday; lunch closed Monday and second/fourth Sunday. Dinner candidates: 4–8 Nov. Do not suggest dinner 9 or 10 Nov. No holiday exception verified.',
    candidateDayIds: ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'],
    notes: ['Booking requirement is unknown; ask before relying on a table.', 'An English tourism article is not evidence of English menu or service.'],
    sources: [{ label: 'Koto ward official shop introduction', url: 'https://kotomise.jp/shops/下町食楽酒房いちばん星/変わらない味、変わっていく街受け継がれる「い/' }],
    mealTags: ['lunch', 'dinner'], checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-fukagawa-kamasho', kind: 'food', title: 'Fukagawa Kamasho · clam rice', area: 'Shirakawa, Koto', address: '2-1-13 Shirakawa, Koto-ku',
    description: 'A close local choice for Fukagawa-meshi with clams, distinct from the other clam-rice venue already in the plan.', mapsQuery: '2-1-13 Shirakawa, Koto City, Tokyo',
    hotelId: 'stay-tokyo-long', priceLabel: 'Ask venue; price not verified', languageLabel: 'Menu and service language not verified',
    scheduleNote: 'Tue/Thu 11:00–15:00 only. Wed/Fri/Sat/Sun/public holidays accept entry until 20:00. Monday closed except a Monday public holiday. Dinner candidates 4, 6, 7, 8 Nov; 5 and 10 Nov are lunch only. 9 Nov closed. Reconfirm 3 Nov holiday service.',
    candidateDayIds: ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-10'],
    mealByDate: { '2026-11-05': ['lunch'], '2026-11-10': ['lunch'] },
    notes: ['Booking requirement is unknown. Official tourism listing supplies phone 03-3643-4053.'],
    sources: [{ label: 'Koto Tourism official listing', url: 'https://www.koto-kanko.jp/fukagawameshi/introduction/detail.php?shop_id=FS0008' }, { label: 'MapFan address match', url: 'https://mapfan.com/spots/S3YW%2CJ%2C43Z7W' }],
    mealTags: ['lunch', 'dinner'], checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-clann', kind: 'food', title: 'CLANN BY THE RIVER · riverside grill', area: 'Kiyosumi, Koto', address: '1-1-7 Kiyosumi, LYURO Tokyo Kiyosumi 2F, Koto-ku',
    description: 'Riverside restaurant serving pulled pork, grill dishes, tapas and craft beer. Guests do not cook their own barbecue.', mapsQuery: '1-1-7 Kiyosumi, Koto City, Tokyo',
    hotelId: 'stay-tokyo-long', priceLabel: 'Ask venue; price not verified', languageLabel: 'English booking and course information; spoken service not confirmed',
    scheduleNote: 'Normal dinner 17:00–22:00 (food last order 21:00). 9 Nov 2026 is breakfast only, 07:00–10:00 (last order 09:30), due to maintenance; no lunch or dinner that day. Other dinner candidates 3–8 and 10 Nov, subject to availability.',
    candidateDayIds: ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'],
    notes: ['Cashless payment only.', 'Dinner reservations are offered; terrace seating cannot be reserved.', 'English booking flow and course descriptions do not establish spoken English.'],
    sources: [{ label: 'Official restaurant', url: 'https://clannbytheriver.jp/' }, { label: 'Hotel meal information', url: 'https://www.thesharehotels.com/lyuro/restaurant/' }, { label: '9 Nov maintenance notice', url: 'https://www.thesharehotels.com/lyuro/news/1025/' }, { label: 'Booking terms', url: 'https://www.tablecheck.com/en/shops/pitmans-kiyosumi/reserve' }],
    bookingUrl: 'https://www.tablecheck.com/en/shops/pitmans-kiyosumi/reserve', mealTags: ['dinner'], mealByDate: { '2026-11-09': ['breakfast'] }, checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-iki-espresso', kind: 'food', title: 'iki Espresso · daytime café', area: 'Tokiwa, Koto', address: '2-2-12 Tokiwa, Koto-ku',
    description: 'Specialty coffee and café food for a relaxed breakfast or lunch break. Optional breakfast; the hotel already supplies breakfast.', mapsQuery: '2-2-12 Tokiwa, Koto City, Tokyo',
    hotelId: 'stay-tokyo-long', priceLabel: 'Ask venue; price not verified', languageLabel: 'Menu and service language not verified',
    scheduleNote: 'Weekdays 08:00–17:00; weekends/public holidays 08:00–18:00. No weekly closure stated on the current page. Daytime option on 3–10 Nov when staying local.',
    candidateDayIds: ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'],
    notes: ['Not a dinner fallback.', 'Avoid adding to the early-start Kamakura day or a long outing automatically.', 'Kitchen last order and reservations were not verified. The official menu is image-based, so menu language is unknown.', 'This is iki Espresso at 2-2-12 Tokiwa, not iki Roastery & Eatery at 1-4-7 Tokiwa.'],
    sources: [{ label: 'Official iki Espresso branch', url: 'https://iki-espresso.com/pages/iki-espresso' }, { label: 'Official menu', url: 'https://iki-espresso.com/pages/iki-espresso-menu' }],
    mealTags: ['breakfast', 'lunch'], checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-fujimaru', kind: 'food', title: 'Kiyosumi Shirakawa Fujimaru Winery', area: 'Miyoshi, Koto', address: '2-5-3 Miyoshi, restaurant 2F, Koto-ku',
    description: 'Italian-based cooking and Japanese/international wine above a working urban winery; a planned dinner choice rather than a quick late backup.', mapsQuery: '2-5-3 Miyoshi, Koto City, Tokyo',
    hotelId: 'stay-tokyo-long', priceLabel: 'Ask venue; price not verified', languageLabel: 'English corporate information; English menu and spoken service unknown',
    scheduleNote: 'Lunch last order 14:00; dinner 17:00–23:00, last order 21:30. Normally closed Monday/Tuesday, with Wednesday substitution when a holiday changes the pattern. Prefer 5–8 Nov. Confirm 3–4 Nov holiday schedule directly; ordinarily closed 9–10 Nov.',
    candidateDayIds: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'],
    notes: ['Reservations are linked from the operator site; required status is not established.', 'A winery tour is not guaranteed; production can prevent it.'],
    sources: [{ label: 'Operator restaurant directory', url: 'https://www.papilles.net/shop_restaurants/' }, { label: 'English operator information', url: 'https://www.papilles.net/english/' }],
    bookingUrl: 'https://www.papilles.net/shop_restaurants/', mealTags: ['lunch', 'dinner'], checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-rakuzo', kind: 'food', title: 'RAKUZO Ikebukuro Nishiguchi · private-room izakaya', area: 'Nishi-Ikebukuro', address: '1-21-1 Nishi-Ikebukuro, YKD Building 3F, Toshima-ku',
    description: 'Japanese grilled dishes and drinks; private rooms are available for two people after a busy Ikebukuro day.', mapsQuery: '1-21-1 Nishi-Ikebukuro, Toshima City, Tokyo',
    hotelId: 'stay-tokyo-halloween', priceLabel: 'Ask venue; appetizer/seat charge may apply', languageLabel: 'English website and food/drink pages; spoken service and in-person menu language unknown',
    scheduleNote: '17:00–23:30; food last order 22:30 and drinks 23:00. No regular closed day listed. Candidate dates 31 Oct and 1 Nov while staying at Sakura.',
    candidateDayIds: ['2026-10-31', '2026-11-01'],
    notes: ['Walk-ins allowed; advance booking recommended.', 'Appetizer/seat charge applies unless included in the selected course.', 'Smoking room is separate from dining seating.'],
    sources: [{ label: 'Official English branch and booking FAQ', url: 'https://rakuzo.dkdining.com/ikebukuro/en/' }],
    bookingUrl: 'https://rakuzo.dkdining.com/ikebukuro/en/', mealTags: ['dinner'], checkedOn: '2026-10-16',
  },
  {
    id: 'hotel-food-jidorinyo', kind: 'food', title: 'Jidorinyo · Miyazaki chicken izakaya', area: 'Ikebukuro', address: '2-12-13 Ikebukuro, 12 Building 301, Toshima-ku',
    description: 'Miyazaki charcoal-grilled chicken and hot pots; the operator explicitly advertises an English menu.', mapsQuery: '2-12-13 Ikebukuro, Toshima City, Tokyo',
    hotelId: 'stay-tokyo-halloween', priceLabel: 'Ask venue; price not verified', languageLabel: 'English menu confirmed by operator; spoken English unknown',
    scheduleNote: 'Structured hours: Mon–Sat 17:30–01:00, last order midnight; Sunday closed with occasional special opening. Candidate trip date 31 Oct dinner only. Do not suggest 1 Nov dinner without direct confirmation.',
    candidateDayIds: ['2026-10-31'],
    notes: ['Reservations accepted; reserved guests are prioritized when busy.', 'Smoking at seats is allowed.', 'Access page contains contradictory older Sunday/late-hours prose; reconfirm current hours.'],
    sources: [{ label: 'Official homepage / English menu', url: 'https://zidori-nyo.jp/' }, { label: 'Official access and hours', url: 'https://zidori-nyo.jp/access/' }],
    bookingUrl: 'https://zidori-nyo.jp/', mealTags: ['dinner'], checkedOn: '2026-10-16',
  },
];

export function getTokyoResource(id: string): TokyoResource | undefined {
  return tokyoResources.find((resource) => resource.id === id);
}
