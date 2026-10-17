import type { Place } from '../types/trip';
import { tokyoMoreActivities } from './tokyoMore';

export interface TokyoPoolActivity {
  id: string;
  title: string;
  kind: 'outing' | 'evening';
  categoryId: TokyoPoolCategoryId;
  area: string;
  durationLabel: string;
  summary: string;
  routeNote: string;
  places: Place[];
  sources: { label: string; url: string }[];
  weatherFit?: 'indoors' | 'outdoors' | 'mixed';
  themes?: ('food' | 'history' | 'art' | 'gardens' | 'shopping' | 'views' | 'local')[];
  planningCautions?: string[];
  unavailableDates?: { dayId: string; reason: string }[];
  bookingActions?: TokyoPoolBookingAction[];
}

export interface TokyoPoolBookingAction {
  id: string;
  item: string;
  priority: 'required' | 'recommended' | 'research';
  deadline: string;
  destination: string;
  purchaseUrl?: string;
  purchaseLabel?: string;
  referenceUrl?: string;
  referenceLabel?: string;
  notes: string;
}

export type TokyoPoolCategoryId = 'neighborhood' | 'shopping-gaming' | 'day-trip' | 'local-easy' | 'culture' | 'waterfront' | 'special-purpose' | 'evening';

export interface TokyoPoolCategory {
  id: TokyoPoolCategoryId;
  label: string;
  activities: TokyoPoolActivity[];
}

const stop = (id: string, name: string, type: Place['type'], description: string, mapsQuery: string, coordinates: [number, number], extra: Partial<Place> = {}): Place => ({
  id, name, type, description, mapsQuery, coordinates, verification: 'research', ...extra,
});

const hotel = 'Comfort Hotel Tokyo Kiyosumi Shirakawa';
const akihabara = [35.6984, 139.7731] as [number, number];
const tokyoPool: TokyoPoolActivity[] = [
  {
    id: 'akihabara', title: 'Akihabara games + electronics', kind: 'outing', categoryId: 'shopping-gaming', area: 'Tokyo neighborhood · Akihabara · Kanda', durationLabel: 'about 7½ hours door to door',
    summary: 'Best for games and electronics: arcades, retro games, a relaxed lunch and nearby Kanda Myojin. Choose a few priority shops; opening times vary, so start mid-morning.',
    routeNote: 'Allow 30–40 minutes each way from the hotel by metro/train; this is a compact east-central Tokyo day, not a cross-city combination.',
    sources: [{ label: 'GO TOKYO · Akihabara', url: 'https://www.gotokyo.org/en/spot/55/' }, { label: 'Gyukatsu Ichi Ni San · official site', url: 'https://gyukatsu123.studio.site/' }, { label: 'Tonkatsu Wako · Yodobashi Akiba store', url: 'https://wako-group.co.jp/shop/detai/shop_1176/' }],
    places: [
      stop('pool-akihabara-out', 'Metro · hotel → Akihabara', 'transit', 'Allow 30–40 minutes door to door, including station walks and one transfer if needed.', 'Akihabara Station Electric Town Exit', akihabara, { startTime: '10:00', durationMinutes: 35, originQuery: hotel, travelMode: 'train' }),
      stop('pool-akihabara-games', 'Arcades + retro games', 'sight', 'Browse game floors and arcades at your own pace; allow about 90 minutes. Confirm the specific shops you most want to visit.', 'Akihabara retro game arcade', [35.6988, 139.7719], { startTime: '10:45', durationMinutes: 90 }),
      stop('pool-akihabara-electronics', 'Electronics + anime shop browse', 'sight', 'Choose a small number of priority stores rather than trying to cover every building; allow about two hours.', 'Akihabara Electric Town Tokyo', [35.6982, 139.7744], { startTime: '12:30', durationMinutes: 120 }),
      stop('pool-akihabara-lunch', 'Lunch · Gyukatsu Ichi Ni San', 'food', 'Named gyukatsu option near Akihabara Station. Check current opening hours and queue on the day; this is a suggested stop, not a reservation.', 'Gyukatsu Ichi Ni San Akihabara', [35.6972, 139.7736], { startTime: '14:45', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Gyukatsu (beef cutlet)', priceBand: '€€', role: 'primary', sourceUrl: 'https://gyukatsu123.studio.site/', sourceLabel: 'Gyukatsu Ichi Ni San · official site' }),
      stop('pool-akihabara-lunch-backup', 'Lunch backup · Tonkatsu Wako, Yodobashi Akiba', 'food', 'A specific, nearby fallback inside Yodobashi Akiba. Its current store listing gives service until 23:00 (last order 22:00), so it fits the planned 14:45 lunch; verify holiday changes and queue on the day.', 'Tonkatsu Wako Yodobashi Akiba', [35.6985, 139.7742], { mealContext: 'lunch', cuisine: 'Tonkatsu (Japanese pork cutlet)', role: 'backup', sourceUrl: 'https://wako-group.co.jp/shop/detai/shop_1176/', sourceLabel: 'Tonkatsu Wako · official store page' }),
      stop('pool-kanda-walk', 'Walk · Akihabara → Kanda Myojin', 'transit', 'Allow about 15 minutes on foot uphill to the shrine.', 'Kanda Myojin Shrine', [35.7015, 139.7675], { startTime: '15:45', durationMinutes: 15, originQuery: 'Akihabara Station', travelMode: 'walk' }),
      stop('pool-kanda-shrine', 'Kanda Myojin Shrine', 'sight', 'A compact nearby shrine visit; about 30–40 minutes, or skip for more shop time.', 'Kanda Myojin Shrine Tokyo', [35.702, 139.767], { startTime: '16:00', durationMinutes: 40 }),
      stop('pool-akihabara-return', 'Train · Akihabara → hotel', 'transit', 'Allow 30–40 minutes door to door; keep shopping bags manageable on the train.', hotel, [35.68219, 139.799637], { startTime: '16:45', durationMinutes: 40, originQuery: 'Akihabara Station', travelMode: 'train' }),
    ],
  },
  {
    id: 'shibuya-shopping', title: 'Shoes + clothing shopping', kind: 'outing', categoryId: 'shopping-gaming', area: 'Tokyo neighborhood · Shibuya · Harajuku', durationLabel: 'about 8¼ hours door to door',
    summary: 'Best for shoes and clothing: focus on a few Shibuya stores, then browse Harajuku/Omotesando only if you still have energy. Hachiko and the crossing are a short orientation stop.',
    routeNote: 'Keep to the west-side neighborhoods; allow 35–50 minutes each way from Kiyosumi-Shirakawa, depending on the exact route and crowds.',
    sources: [{ label: 'GO TOKYO · Shibuya shopping', url: 'https://www.gotokyo.org/en/story/guide/shibuya-shop/index.html' }, { label: 'GO TOKYO · Shopping in Tokyo', url: 'https://www.gotokyo.org/en/see-and-do/shopping/index.html' }],
    places: [
      stop('pool-shibuya-out', 'Metro · hotel → Shibuya', 'transit', 'Allow 35–50 minutes door to door from the hotel, plus station-navigation time.', 'Shibuya Station Hachiko Exit', [35.6581, 139.7017], { startTime: '09:30', durationMinutes: 45, originQuery: hotel, travelMode: 'train' }),
      stop('pool-shibuya-crossing', 'Hachiko + Shibuya Scramble', 'sight', 'See the famous crossing and orient yourselves; 30–40 minutes is enough before the shopping focus.', 'Shibuya Scramble Crossing', [35.6595, 139.7005], { startTime: '10:30', durationMinutes: 40 }),
      stop('pool-shibuya-shopping', 'Shoes + streetwear shopping', 'sight', 'Choose a few stores in Shibuya Parco / Center-gai / nearby sneaker shops. Allow about 2.5 hours, with store choices confirmed closer to travel.', 'Shibuya Parco Tokyo', [35.6615, 139.6984], { startTime: '11:15', durationMinutes: 150 }),
      stop('pool-shibuya-lunch', 'Lunch · Shibuya PARCO restaurant floors', 'food', 'A directory-backed cluster of restaurants inside Shibuya PARCO, close to the shopping route. Browse the current floor directory and pick a venue that is open; no specific restaurant or table is assumed.', 'Shibuya PARCO restaurants', [35.6619, 139.6993], { startTime: '13:45', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Restaurant-floor cluster', priceBand: '€€', role: 'primary', sourceUrl: 'https://shibuya.parco.jp/floor/', sourceLabel: 'Shibuya PARCO · floor directory' }),
      stop('pool-shibuya-lunch-backup', 'Lunch backup · Tanaka Soba, Shibuya PARCO', 'food', 'Named ramen fallback on the same 7F restaurant floor, so switching does not add a detour. Check current hours and queue; this is not a reservation.', 'Tanaka Soba Shibuya PARCO', [35.6596, 139.6994], { mealContext: 'lunch', cuisine: 'Kitakata-style ramen', role: 'backup', sourceUrl: 'https://shibuya.parco.jp/shop/detail/?cd=025732', sourceLabel: 'Shibuya PARCO · Tanaka Soba listing' }),
      stop('pool-harajuku-transfer', 'JR / walk · Shibuya → Harajuku', 'transit', 'Allow 20–30 minutes door to door, or walk if the weather and energy are good.', 'Harajuku Station', [35.6702, 139.7025], { startTime: '15:00', durationMinutes: 25, originQuery: 'Shibuya Station', travelMode: 'train' }),
      stop('pool-harajuku-browse', 'Harajuku + Omotesando browse', 'sight', 'A flexible final browse for clothing, design and people-watching; keep it to 60–90 minutes.', 'Takeshita Street Harajuku', [35.6717, 139.7032], { startTime: '15:30', durationMinutes: 75 }),
      stop('pool-shibuya-return', 'Metro · Harajuku → hotel', 'transit', 'Allow about 40–50 minutes back to Kiyosumi-Shirakawa.', hotel, [35.68219, 139.799637], { startTime: '17:00', durationMinutes: 45, originQuery: 'Harajuku Station', travelMode: 'train' }),
    ],
  },
  {
    id: 'costco-kawasaki', title: 'Costco warehouse trip', kind: 'outing', categoryId: 'special-purpose', area: 'Special-purpose outing · Kawasaki', durationLabel: 'about 8 hours door to door',
    summary: 'Best if Costco is a priority, not as a sightseeing day: shop Costco Kawasaki and plan for bulky bags. Membership is required; Costco Japan says Gold Star membership works worldwide, but confirm your exact active card. Treat the food court as conditional, not your only meal plan.',
    routeNote: 'This is a deliberately simple out-and-back via Kawasaki Station: allow about 50 minutes hotel→station, then roughly 30 minutes by bus plus the short walk to the warehouse. Allow about 30–40 minutes back to the station, with extra wait-time buffer. These are planning estimates, not a November 2026 timetable; check the live bus route and service before assigning, and consider a taxi if you expect bulky purchases.',
    sources: [{ label: 'Costco Japan · Gold Star membership', url: 'https://www.costco.co.jp/c/GOLDSTAR-PRIMARY-CARD/p/83' }, { label: 'Costco · Kawasaki Warehouse', url: 'https://www.costco.com/warehouse-locations/kawasaki-kawasaki-city-kanagawa-863.html' }, { label: 'Kawasaki City · bus routes to Rinkō Police Station', url: 'https://www.city.kawasaki.jp/840/page/0000019840.html' }, { label: 'Kawasaki City Bus · route map', url: 'https://www.city.kawasaki.jp/820/cmsfiles/contents/0000008/8524/20251201_S.pdf' }, { label: 'Kawasaki More’s · restaurants', url: 'https://kawasaki-mores.jp/restaurantcafe/' }, { label: 'Tonchin · Kawasaki More’s store', url: 'https://kawasaki-mores.jp/floor/detail/?cd=000295' }],
    places: [
      stop('pool-costco-train-out', 'Train · hotel → Kawasaki Station', 'transit', 'Planning allowance about 50 minutes door to door, including station access. Confirm the route from Kiyosumi-Shirakawa on the day.', 'Kawasaki Station', [35.5308, 139.6984], { startTime: '09:00', durationMinutes: 50, originQuery: hotel, travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-costco-bus-out', 'Bus + walk · Kawasaki Station → Costco', 'transit', 'From Kawasaki Station, use a city-bus service via Rinkō Police Station; Costco is a short walk from that stop. Allow about 30 minutes on the vehicle/walk plus time to find the stop and wait. Check the current route, stop and timetable before travel.', 'Costco Kawasaki Warehouse', [35.5258, 139.7223], { startTime: '10:00', durationMinutes: 30, originQuery: 'Kawasaki Station', travelMode: 'bus', verification: 'verify-before-trip' }),
      stop('pool-costco-shop', 'Costco Kawasaki Warehouse', 'sight', 'Allow 2–3 hours to shop. Membership is required. Large purchases can be awkward on local buses and trains; keep the shop list portable or consider a taxi back to Kawasaki Station.', 'Costco Kawasaki Warehouse', [35.5265, 139.723], { startTime: '10:45', durationMinutes: 150, verification: 'verify-before-trip' }),
      stop('pool-costco-lunch', 'Conditional lunch · Costco Kawasaki food court', 'food', 'This is on-site, but only use it if the warehouse food court is operating and accessible under your membership that day. Do not rely on it as the guaranteed meal; otherwise leave the warehouse and use the Kawasaki Station fallback after the return bus.', 'Costco Kawasaki Warehouse food court', [35.5269, 139.7234], { startTime: '13:15', durationMinutes: 45, mealContext: 'lunch', cuisine: 'Costco food court', role: 'primary', sourceUrl: 'https://www.costco.com/warehouse-locations/kawasaki-kawasaki-city-kanagawa-863.html', sourceLabel: 'Costco · Kawasaki Warehouse', verification: 'verify-before-trip' }),
      stop('pool-costco-return', 'Bus · Costco → Kawasaki Station', 'transit', 'Allow about 30–40 minutes including the walk and bus wait. If you skip the conditional warehouse food court, this leg ends at Kawasaki Station for the named late-lunch backup.', 'Kawasaki Station bus terminal', [35.5308, 139.6984], { startTime: '14:15', durationMinutes: 40, originQuery: 'Costco Kawasaki Warehouse', travelMode: 'bus', verification: 'verify-before-trip' }),
      stop('pool-costco-food-backup', 'Late lunch backup · Tonchin, Kawasaki More’s', 'food', 'Named restaurant at Kawasaki Station, used after the direct return bus—not beside Costco and not an on-site stop. If the Costco food court is inaccessible, use this late-lunch fallback; verify the store’s current hours and last order before travel.', 'Tonchin Kawasaki More’s', [35.5304, 139.6987], { startTime: '15:00', durationMinutes: 45, mealContext: 'lunch', cuisine: 'Tokyo-style tonkotsu ramen', role: 'backup', sourceUrl: 'https://kawasaki-mores.jp/floor/detail/?cd=000295', sourceLabel: 'Kawasaki More’s · Tonchin store page', verification: 'verify-before-trip' }),
      stop('pool-costco-hotel-return', 'Train · Kawasaki Station → hotel', 'transit', 'Allow about 60–75 minutes back to the hotel after the station lunch fallback. If you eat at Costco instead, skip the backup and take a suitable earlier train.', hotel, [35.68219, 139.799637], { startTime: '16:00', durationMinutes: 70, originQuery: 'Kawasaki Station', travelMode: 'train', verification: 'verify-before-trip' }),
    ],
  },
  {
    id: 'yokohama', title: 'Yokohama harbor + Chinatown', kind: 'outing', categoryId: 'day-trip', area: 'Full day trip · Yokohama', durationLabel: 'about 10¾ hours door to door',
    summary: 'Best for a full harbor day: Minato Mirai, Red Brick Warehouse, then Chinatown for an early dinner. This is the longest pool outing; keep to the central waterfront and skip a stop if you want an easier pace.',
    routeNote: 'Allow around 45–60 minutes each way from the hotel by rail plus station walks. Check the chosen train and attraction hours; no timed ticket is assumed.',
    sources: [{ label: 'GO TOKYO · Yokohama', url: 'https://www.gotokyo.org/en/destinations/beyond-tokyo/yokohama.html' }],
    places: [
      stop('pool-yokohama-out', 'JR / metro · hotel → Yokohama', 'transit', 'Allow 45–60 minutes door to door; choose the route to Minato Mirai or Sakuragicho based on the first stop.', 'Yokohama Station', [35.466, 139.622], { startTime: '09:00', durationMinutes: 55, originQuery: hotel, travelMode: 'train' }),
      stop('pool-yokohama-harbor', 'Minato Mirai waterfront', 'sight', 'A scenic harbor walk and city-view area; allow about two hours including photo and coffee breaks.', 'Minato Mirai Yokohama', [35.455, 139.632], { startTime: '10:15', durationMinutes: 120 }),
      stop('pool-yokohama-redbrick', 'Yokohama Red Brick Warehouse', 'sight', 'Browse the historic waterfront complex and shops; allow around 75 minutes.', 'Yokohama Red Brick Warehouse', [35.452, 139.642], { startTime: '12:45', durationMinutes: 75 }),
      stop('pool-yokohama-lunch', 'Lunch · Red Brick Warehouse food options', 'food', 'A convenient cluster of cafés and restaurants inside the Red Brick Warehouse complex, directly on the waterfront route. Browse the current tenant list and choose an open venue; no particular restaurant is assumed.', 'Yokohama Red Brick Warehouse restaurants', [35.4526, 139.6425], { startTime: '14:00', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Waterfront restaurant/café cluster', priceBand: '€€', role: 'primary', sourceUrl: 'https://www.yokohama-akarenga.jp/floorguide/', sourceLabel: 'Yokohama Red Brick Warehouse · official floor guide' }),
      stop('pool-yokohama-lunch-backup', 'Lunch backup · Kiyoken, Red Brick Warehouse', 'food', 'A named, practical alternative inside the same food court, so it does not add a cross-city detour. The venue’s current listing shows daily service 11:00–21:00; confirm day-of changes.', 'Kiyoken Yokohama Red Brick Warehouse', [35.4526, 139.6425], { mealContext: 'lunch', cuisine: 'Yokohama shumai and local Chinese dishes', role: 'backup', sourceUrl: 'https://www.yokohama-akarenga.jp/cafe/shop02-16/', sourceLabel: 'Yokohama Red Brick Warehouse · Kiyoken listing' }),
      stop('pool-yokohama-chinatown', 'Yokohama Chinatown', 'sight', 'Explore the compact main streets and choose a dumpling/noodle dinner; allow about two hours and avoid over-ordering before the return train.', 'Yokohama Chinatown', [35.443, 139.646], { startTime: '15:30', durationMinutes: 120 }),
      stop('pool-yokohama-dinner', 'Early dinner · Manchinro Honten', 'food', 'A named Yokohama Chinatown Cantonese restaurant on the planned route. Check the current branch hours, menu and availability before setting out; no reservation is assumed.', 'Manchinro Honten Yokohama Chinatown', [35.4438, 139.6458], { startTime: '17:30', durationMinutes: 60, mealContext: 'dinner', cuisine: 'Cantonese', priceBand: '€€€', role: 'primary', sourceUrl: 'https://www.chinatown.or.jp/', sourceLabel: 'Yokohama Chinatown · official area directory' }),
      stop('pool-yokohama-dinner-backup', 'Dinner backup · Shatenki Nigouten', 'food', 'A second named Chinatown option if Manchinro is full or does not suit you. Verify current hours and availability; this is a walk-in alternative, not a confirmed booking.', 'Shatenki Nigouten Yokohama Chinatown', [35.4438, 139.6458], { mealContext: 'dinner', cuisine: 'Chinese · rice porridge and home-style dishes', priceBand: '€€', role: 'backup', sourceUrl: 'https://www.chinatown.or.jp/', sourceLabel: 'Yokohama Chinatown · official area directory' }),
      stop('pool-yokohama-return', 'JR · Yokohama → hotel', 'transit', 'Allow 45–60 minutes door to door and check the live service before leaving Chinatown.', hotel, [35.68219, 139.799637], { startTime: '18:45', durationMinutes: 55, originQuery: 'Yokohama Chinatown', travelMode: 'train' }),
    ],
  },
  {
    id: 'kawagoe', title: 'Kawagoe historic town day trip', kind: 'outing', categoryId: 'day-trip', area: 'Full day trip · Kawagoe', durationLabel: 'about 8 hours door to door',
    summary: 'Best for an old-town stroll: merchant streets, the bell tower and candy alley with a local lunch. Compact once there, but allow about an hour each way on trains and station transfers.',
    routeNote: 'Allow roughly 50–70 minutes each way from the hotel, including transfers; confirm the best rail station and return route before setting out.',
    sources: [{ label: 'GO TOKYO · Kawagoe', url: 'https://www.gotokyo.org/en/destinations/beyond-tokyo/kawagoe.html' }],
    places: [
      stop('pool-kawagoe-out', 'Rail · hotel → Kawagoe', 'transit', 'Allow 50–70 minutes door to door with station transfers; confirm which Kawagoe-area station is best for your chosen route.', 'Kawagoe Station', [35.908, 139.482], { startTime: '08:30', durationMinutes: 60, originQuery: hotel, travelMode: 'train' }),
      stop('pool-kawagoe-kurazukuri', 'Kurazukuri merchant streets', 'sight', 'Walk the historic warehouse-lined streets at an easy pace; allow about two hours with browsing and photos.', 'Kurazukuri Street Kawagoe', [35.923, 139.483], { startTime: '10:00', durationMinutes: 120 }),
      stop('pool-kawagoe-lunch', 'Lunch · Akira Una', 'food', 'Named eel-rice option in the old-town area. Confirm the current service hours and availability, and keep time for the walk between sights.', 'Akira Una Kawagoe', [35.922, 139.482], { startTime: '12:15', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Unagi (eel)', signature: 'Eel rice', priceBand: '€€€', role: 'primary', sourceUrl: 'https://www.gotokyo.org/en/destinations/beyond-tokyo/kawagoe.html', sourceLabel: 'GO TOKYO · Kawagoe area guide' }),
      stop('pool-kawagoe-lunch-backup', 'Lunch backup · Monzoan', 'food', 'Named local meal alternative in Kawagoe’s old-town area. Check the current opening day/hours and whether walk-ins are available; the map link is for locating the restaurant, not a booking.', 'Monzoan Kawagoe', [35.924, 139.484], { mealContext: 'lunch', cuisine: 'Japanese local dining', role: 'backup', sourceUrl: 'https://www.gotokyo.org/en/destinations/beyond-tokyo/kawagoe.html', sourceLabel: 'GO TOKYO · Kawagoe area guide' }),
      stop('pool-kawagoe-belltower', 'Toki no Kane + Kashiya Yokocho', 'sight', 'See the bell tower and browse the small candy street; allow 60–90 minutes, then leave time to walk back toward the station.', 'Toki no Kane Kawagoe', [35.925, 139.484], { startTime: '13:30', durationMinutes: 90 }),
      stop('pool-kawagoe-return', 'Rail · Kawagoe → hotel', 'transit', 'Allow 50–70 minutes door to door; leave the old town before you are tired rather than chasing one more stop.', hotel, [35.68219, 139.799637], { startTime: '15:30', durationMinutes: 60, originQuery: 'Kawagoe Station', travelMode: 'train' }),
    ],
  },
  {
    id: 'kawaguchiko', title: 'Kawaguchiko + Mount Fuji views', kind: 'outing', categoryId: 'day-trip', area: 'Full day trip · Fuji Five Lakes', durationLabel: 'about 12 hours door to door',
    summary: 'A scenic, weather-dependent Fuji day: direct limited-express train to Kawaguchiko, a flat lakeside visit to Oishi Park, local hōtō lunch and a short lake cruise. Fuji visibility is never guaranteed; skip the extra lake activity if the train/bus connections feel tight.',
    routeNote: 'This is a long day with roughly four hours on the direct Fuji Excursion alone, plus hotel–Shinjuku and local-bus legs. Times below are planning blocks, not a promised November 2026 timetable: check JR East and Fujikyu, reserve the limited express when sales open, and shift the local plan around the confirmed trains.',
    sources: [{ label: 'JR East · Fuji Excursion route and train reservations', url: 'https://www.jreast.co.jp/en/multi/traininformation/azusa_kaiji/index.html' }, { label: 'Fujikyu Bus · Kawaguchiko sightseeing-bus routes, schedules and fares', url: 'https://bus.fujikyu.co.jp/en/fujitour/kawaguchiko/' }, { label: 'Houtou Laboratory · official restaurant and access', url: 'https://fuji.creative-r.com/en/pages/hoto-labo' }, { label: 'Yamanashi Tourism · Hoto Fudo listing', url: 'https://www.yamanashi-kankou.jp/kankou/eat/p3_0111.html' }],
    bookingActions: [
      { id: 'fuji-excursion-outbound', item: 'Fuji Excursion · reserve Shinjuku → Kawaguchiko seats', priority: 'required', deadline: 'Before this day · check the date-specific timetable and reservation window', destination: 'Shinjuku → Kawaguchiko', purchaseUrl: 'https://www.jreast.co.jp/en/multi/traininformation/azusa_kaiji/index.html', purchaseLabel: 'JR East · Fuji Excursion information', notes: 'Choose and reserve the outward limited-express seats for this date. Confirm the date-specific timetable and reservation window; this planner does not hold seats.' },
      { id: 'fuji-excursion-return', item: 'Fuji Excursion · reserve Kawaguchiko → Shinjuku seats', priority: 'required', deadline: 'Before this day · choose a return with a generous buffer', destination: 'Kawaguchiko → Shinjuku', purchaseUrl: 'https://www.jreast.co.jp/en/multi/traininformation/azusa_kaiji/index.html', purchaseLabel: 'JR East · Fuji Excursion information', notes: 'Choose and reserve the return limited-express seats for this date, allowing a connection buffer. Confirm the date-specific timetable; the placeholder time is only a planning window.' },
    ],
    places: [
      stop('pool-kawaguchiko-hotel-out', 'Metro · hotel → Shinjuku Station', 'transit', 'Allow about 60–75 minutes door to door including station walks. Start early enough to reach the reserved train platform without rushing.', 'Shinjuku Station', [35.6896, 139.7006], { startTime: '07:00', durationMinutes: 70, originQuery: hotel, travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-train-out', 'Limited express · Shinjuku → Kawaguchiko', 'transit', 'The Fuji Excursion runs direct in about 1 hour 50 minutes to 2 hours. Limited-express seats need advance planning; check the date-specific timetable and reservation window before assigning this outing.', 'Kawaguchiko Station', [35.4982, 138.7689], { startTime: '08:15', durationMinutes: 120, originQuery: 'Shinjuku Station', travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-bus-oishi', 'Red Line bus · station → Oishi Park', 'transit', 'Use the Kawaguchiko sightseeing bus (Red Line) to Oishi Park; check the live route, timetable, queue and return options before committing to a departure.', 'Oishi Park Kawaguchiko', [35.522, 138.746], { startTime: '10:30', durationMinutes: 35, originQuery: 'Kawaguchiko Station', travelMode: 'bus', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-oishi', 'Oishi Park + north-shore lakeside', 'sight', 'Flat lakeside scenery and an open view toward Mount Fuji on clear days. Allow about an hour for the park, photos and a relaxed shoreline stroll; the November view depends on weather.', 'Oishi Park Kawaguchiko', [35.522, 138.746], { startTime: '11:10', durationMinutes: 60 }),
      stop('pool-kawaguchiko-lunch', 'Lunch · Houtou Laboratory Kawaguchiko', 'food', 'Named local hōtō restaurant near the north shore, with an official English site and online meal booking. Allow time for the bus/walk from Oishi Park, and confirm opening/service on your chosen date.', 'Houtou Laboratory Kawaguchiko', [35.5244, 138.7468], { startTime: '12:15', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Yamanashi hōtō noodles', signature: 'Seafood hōtō', priceBand: '€€', role: 'primary', sourceUrl: 'https://fuji.creative-r.com/en/pages/hoto-labo', sourceLabel: 'Houtou Laboratory · official restaurant site', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-lunch-backup', 'Lunch backup · Hoto Fudo, Kawaguchi Main Store', 'food', 'Named hōtō alternative on the north-shore side. Yamanashi tourism lists it about 15 minutes by bus from Kawaguchiko Station; check the selected branch, current service and queue before choosing it.', 'Hoto Fudo Kawaguchi Main Store Fujikawaguchiko', [35.5317, 138.7668], { mealContext: 'lunch', cuisine: 'Yamanashi hōtō noodles', role: 'backup', sourceUrl: 'https://www.yamanashi-kankou.jp/kankou/eat/p3_0111.html', sourceLabel: 'Yamanashi Tourism · Hoto Fudo listing', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-bus-station', 'Red Line bus · north shore → Kawaguchiko Station', 'transit', 'Return toward the station and lake pier. Allow a connection buffer; buses can be busy and the lakeside route is traffic-sensitive.', 'Kawaguchiko Station', [35.4982, 138.7689], { startTime: '13:20', durationMinutes: 35, originQuery: 'Oishi Park Kawaguchiko', travelMode: 'bus', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-cruise', 'Optional · Lake Kawaguchi sightseeing cruise', 'optional', 'A short boat ride from the station-side pier if weather, visibility and the return-train buffer allow. Treat this as the first thing to skip if connections are delayed; verify operating status on the day.', 'Kawaguchiko Sightseeing Boat Pier', [35.5062, 138.765], { startTime: '14:10', durationMinutes: 30, verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-return-train', 'Limited express · Kawaguchiko → Shinjuku', 'transit', 'Choose a confirmed return train with a generous buffer. The placeholder time is only a planning window; check the date-specific timetable and reserve seats before assigning this day.', 'Shinjuku Station', [35.6896, 139.7006], { startTime: '16:00', durationMinutes: 120, originQuery: 'Kawaguchiko Station', travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-kawaguchiko-hotel-return', 'Metro · Shinjuku → hotel', 'transit', 'Allow about 60–75 minutes door to door after the return train. Keep dinner simple near the hotel after this full day.', hotel, [35.68219, 139.799637], { startTime: '18:05', durationMinutes: 70, originQuery: 'Shinjuku Station', travelMode: 'train', verification: 'verify-before-trip' }),
    ],
  },
  {
    id: 'deep-fukagawa', title: 'Deep Fukagawa neighborhood day', kind: 'outing', categoryId: 'local-easy', area: 'Easy local day · Kiyosumi · Monzen-Nakacho', durationLabel: 'about 6½ hours, mostly on foot',
    summary: 'Best for an easy, nearby day: Kiyosumi Garden, Fukagawa Fudo-do, the Edo Museum and local clam rice. No long train ride; skip the ritual or museum if you want a lighter rest day.',
    routeNote: 'Most stops are 10–20 minutes apart on foot from your hotel area. Check the ritual session and museum hours for the exact date before choosing this.',
    sources: [{ label: 'Fukagawa Edo Museum · official visitor information', url: 'https://www.kcf.or.jp/fukagawa/outline/' }],
    places: [
      stop('pool-fukagawa-out', 'Walk · hotel → Kiyosumi Garden', 'transit', 'Allow about 15–20 minutes door to door.', 'Kiyosumi Garden Tokyo', [35.6807, 139.7987], { startTime: '08:40', durationMinutes: 20, originQuery: hotel, travelMode: 'walk' }),
      stop('pool-fukagawa-garden', 'Kiyosumi Garden', 'sight', 'A quiet strolling garden; allow about an hour and check the current opening time/admission.', 'Kiyosumi Garden Tokyo', [35.681, 139.799], { startTime: '09:00', durationMinutes: 60 }),
      stop('pool-fukagawa-temple-walk', 'Walk · garden → Fukagawa Fudo-do', 'transit', 'Allow about 15 minutes on foot through the neighborhood.', 'Fukagawa Fudo-do Tokyo', [35.6709, 139.7971], { startTime: '10:00', durationMinutes: 15, originQuery: 'Kiyosumi Garden Tokyo', travelMode: 'walk' }),
      stop('pool-fukagawa-temple', 'Fukagawa Fudo-do grounds', 'sight', 'Visit the temple grounds before the scheduled 11:00 ritual; allow about 30 minutes and confirm access.', 'Fukagawa Fudo-do Tokyo', [35.6712, 139.7969], { startTime: '10:15', durationMinutes: 30, verification: 'verify-before-trip' }),
      stop('pool-fukagawa-goma', 'Fukagawa Fudo-do · goma ritual', 'sight', 'Target the 11:00 fire ritual only after confirming that session is running; allow about 30 minutes.', 'Fukagawa Fudo-do goma fire ritual', [35.6716, 139.7963], { startTime: '11:00', durationMinutes: 30, verification: 'verify-before-trip' }),
      stop('pool-fukagawa-museum-walk', 'Walk · temple → Edo Museum', 'transit', 'Allow about 15 minutes on foot; leave after the ritual and arrive before the planned entry.', 'Fukagawa Edo Museum Tokyo', [35.6836, 139.7995], { startTime: '11:30', durationMinutes: 15, originQuery: 'Fukagawa Fudo-do Tokyo', travelMode: 'walk' }),
      stop('pool-fukagawa-museum', 'Fukagawa Edo Museum', 'sight', 'A detailed indoor reconstruction of Edo-era neighborhood life; allow 75–90 minutes and verify opening days.', 'Fukagawa Edo Museum Tokyo', [35.684, 139.8], { startTime: '11:45', durationMinutes: 90 }),
      stop('pool-fukagawa-lunch', 'Lunch · Fukagawajuku Hachiman', 'food', 'Named local restaurant for fukagawa-meshi (clam rice) within the neighborhood route. Check its current service hours and availability before choosing this pool day; no booking is assumed.', 'Fukagawajuku Hachiman Tokyo', [35.676, 139.797], { startTime: '13:30', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Tokyo shitamachi', signature: 'Fukagawa-meshi (clam rice)', priceBand: '€€', role: 'primary', sourceUrl: 'https://www.fukagawajuku.com/', sourceLabel: 'Fukagawajuku · official restaurant site', verification: 'verify-before-trip' }),
      stop('pool-fukagawa-lunch-backup', 'Lunch backup · Monzen Chaya', 'food', 'A named neighborhood alternative, but it is reported closed on Mondays. Check its current opening day and lunch service; if closed, choose an open nearby place in person rather than relying on this backup.', 'Monzen Chaya Fukagawa Tokyo', [35.672, 139.796], { mealContext: 'lunch', cuisine: 'Fukagawa local dining', role: 'backup', sourceUrl: 'https://www.gotokyo.org/en/destinations/eastern-tokyo/index.html', sourceLabel: 'GO TOKYO · Eastern Tokyo area guide', verification: 'verify-before-trip' }),
      stop('pool-fukagawa-return', 'Walk/metro · Monzen-Nakacho → hotel', 'transit', 'Return to the nearby hotel for a rest; allow about 15–20 minutes.', hotel, [35.68219, 139.799637], { startTime: '14:45', durationMinutes: 20, originQuery: 'Monzen Nakacho Tokyo', travelMode: 'walk' }),
    ],
  },
  {
    id: 'asakusa-ueno', title: 'Asakusa old town + Ueno museums', kind: 'outing', categoryId: 'culture', area: 'Tokyo culture day · Asakusa · Ueno', durationLabel: 'about 8 hours door to door',
    summary: 'Senso-ji and Nakamise in the morning, Kappabashi kitchen street, a tempura lunch, then choose one Ueno museum or a park walk. Skip the museum if crowds or walking add up.',
    routeNote: 'Compact east-Tokyo routing from Kiyosumi-Shirakawa. Check the selected museum’s closure day and entry hours; no timed ticket is assumed.',
    sources: [{ label: 'GO TOKYO · Asakusa', url: 'https://www.gotokyo.org/en/destinations/eastern-tokyo/asakusa/index.html' }, { label: 'Tokyo National Museum · visitor information', url: 'https://www.tnm.jp/modules/r_free_page/index.php?id=113' }],
    places: [
      stop('pool-asakusa-out', 'Metro · hotel → Asakusa', 'transit', 'Allow 35–45 minutes door to door including station walks.', 'Asakusa Station Tokyo', [35.7118, 139.7977], { startTime: '08:45', durationMinutes: 40, originQuery: hotel, travelMode: 'train' }),
      stop('pool-asakusa-sensoji', 'Senso-ji + Nakamise', 'sight', 'Visit temple grounds and browse the approach before the busiest part of the day.', 'Senso-ji Temple Tokyo', [35.7148, 139.7967], { startTime: '09:30', durationMinutes: 90 }),
      stop('pool-asakusa-kappabashi-walk', 'Walk · Senso-ji → Kappabashi', 'transit', 'Allow about 15 minutes on foot between the temple approach and kitchenware street.', 'Kappabashi Dougu Street Tokyo', [35.711, 139.789], { startTime: '11:00', durationMinutes: 15, originQuery: 'Senso-ji Temple Tokyo', travelMode: 'walk' }),
      stop('pool-asakusa-kappabashi', 'Kappabashi kitchen street', 'sight', 'Browse a focused stretch of the cookware district; it is a distinctive shopping stop, not a must-see-every-shop route.', 'Kappabashi Dougu Street Tokyo', [35.711, 139.789], { startTime: '11:15', durationMinutes: 45 }),
      stop('pool-asakusa-lunch-walk', 'Walk · Kappabashi → tempura lunch', 'transit', 'Allow about 15 minutes on foot to the selected Asakusa lunch choice.', 'Daikokuya Tempura Asakusa', [35.7128, 139.7962], { startTime: '12:00', durationMinutes: 15, originQuery: 'Kappabashi Dougu Street Tokyo', travelMode: 'walk' }),
      stop('pool-asakusa-lunch', 'Lunch · Daikokuya Tempura', 'food', 'Long-running Asakusa tempura restaurant. Check same-day hours and queue; no reservation is assumed.', 'Daikokuya Tempura Asakusa', [35.7128, 139.7962], { startTime: '12:30', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Asakusa tempura', signature: 'Tempura rice bowl', priceBand: '€€', role: 'primary', sourceUrl: 'https://www.tempura.co.jp/', sourceLabel: 'Daikokuya · official site', verification: 'verify-before-trip' }),
      stop('pool-asakusa-lunch-backup', 'Lunch backup · Asakusa Imahan', 'food', 'Nearby sukiyaki alternative if the tempura queue is long. Check current hours and menu prices.', 'Asakusa Imahan Main Store', [35.7122, 139.7965], { mealContext: 'lunch', cuisine: 'Sukiyaki · Japanese beef', role: 'backup', sourceUrl: 'https://imahan-tukudani.com/english/', sourceLabel: 'Asakusa Imahan · official site', verification: 'verify-before-trip' }),
      stop('pool-asakusa-ueno-transfer', 'Metro · Asakusa → Ueno', 'transit', 'Allow about 25 minutes station-to-station plus access walks.', 'Ueno Park Tokyo', [35.7156, 139.7745], { startTime: '13:45', durationMinutes: 25, originQuery: 'Asakusa Station Tokyo', travelMode: 'train' }),
      stop('pool-ueno-park-museum', 'Ueno Park · choose one museum', 'sight', 'Allow about 90 minutes for one selected museum, or replace it with a park walk. Check venue closure dates in advance.', 'Tokyo National Museum Ueno', [35.7188, 139.7765], { startTime: '14:30', durationMinutes: 90, verification: 'verify-before-trip' }),
      stop('pool-asakusa-return', 'Metro · Ueno → hotel', 'transit', 'Allow 35–45 minutes door to door; return earlier if the day runs long.', hotel, [35.68219, 139.799637], { startTime: '16:15', durationMinutes: 40, originQuery: 'Ueno Station Tokyo', travelMode: 'train' }),
    ],
  },
  {
    id: 'shinjuku-green', title: 'Shinjuku Gyoen + city views', kind: 'outing', categoryId: 'neighborhood', area: 'Tokyo neighborhood · Shinjuku', durationLabel: 'about 7¼ hours door to door',
    summary: 'A slower city-and-garden day: Shinjuku Gyoen, nearby lunch, then the free Metropolitan Government observatory if open. One garden and one view, without overpacking the day.',
    routeNote: 'Allow 35–50 minutes each way from the hotel. Confirm Shinjuku Gyoen closure/admission and observatory hours before assigning this day.',
    sources: [{ label: 'Shinjuku Gyoen · official visitor information', url: 'https://www.env.go.jp/garden/shinjukugyoen/english/index.html' }, { label: 'Tokyo Metropolitan Government observatories', url: 'https://www.yokoso.metro.tokyo.lg.jp/en/tenbou/' }],
    places: [
      stop('pool-shinjuku-out', 'Metro · hotel → Shinjuku Gyoen', 'transit', 'Allow 40–50 minutes door to door including station navigation.', 'Shinjuku Gyoen National Garden Tokyo', [35.6852, 139.7101], { startTime: '09:00', durationMinutes: 45, originQuery: hotel, travelMode: 'train' }),
      stop('pool-shinjuku-garden', 'Shinjuku Gyoen National Garden', 'sight', 'Stroll one or two garden areas at an easy pace; check the official calendar for closure day and entry hours.', 'Shinjuku Gyoen National Garden', [35.6852, 139.7101], { startTime: '10:00', durationMinutes: 120, verification: 'verify-before-trip' }),
      stop('pool-shinjuku-lunch', 'Lunch · Shinjuku Takashimaya', 'food', 'Practical restaurant cluster by the station; browse the current directory and choose an open venue.', 'Shinjuku Takashimaya restaurants', [35.6857, 139.702], { startTime: '12:30', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Restaurant cluster', role: 'primary', sourceUrl: 'https://www.takashimaya.co.jp/shinjuku/floor/', sourceLabel: 'Shinjuku Takashimaya · floor guide', verification: 'verify-before-trip' }),
      stop('pool-shinjuku-lunch-backup', 'Lunch backup · Southern Terrace', 'food', 'Nearby multi-restaurant cluster if the first choice is busy; use its directory to select an open option.', 'Shinjuku Southern Terrace restaurants', [35.6877, 139.7008], { mealContext: 'lunch', cuisine: 'Restaurant cluster', role: 'backup', sourceUrl: 'https://www.southernterrace.jp/restaurant/', sourceLabel: 'Southern Terrace · restaurant directory', verification: 'verify-before-trip' }),
      stop('pool-shinjuku-observatory-transfer', 'Walk · Shinjuku → city observatory', 'transit', 'Allow about 20 minutes on foot, or use local transit if tired.', 'Tokyo Metropolitan Government Building', [35.6895, 139.6917], { startTime: '13:45', durationMinutes: 20, originQuery: 'Shinjuku Station Tokyo', travelMode: 'walk' }),
      stop('pool-shinjuku-observatory', 'Tokyo Metropolitan Government observatory', 'sight', 'Free city view if open; check the official calendar and visibility. Skip if busy.', 'Tokyo Metropolitan Government Building observatory', [35.6895, 139.6917], { startTime: '14:15', durationMinutes: 60, verification: 'verify-before-trip' }),
      stop('pool-shinjuku-return', 'Metro · Shinjuku → hotel', 'transit', 'Allow about 40–50 minutes door to door.', hotel, [35.68219, 139.799637], { startTime: '15:30', durationMinutes: 45, originQuery: 'Shinjuku Station Tokyo', travelMode: 'train' }),
    ],
  },
  {
    id: 'odaiba-bay', title: 'Odaiba waterfront + one museum', kind: 'outing', categoryId: 'waterfront', area: 'Tokyo bay day · Odaiba', durationLabel: 'about 7 hours door to door',
    summary: 'An easy bay-side walk with one indoor attraction of your choice. Keep it weather-flexible; choose the science museum or another venue, not a packed list of timed attractions.',
    routeNote: 'Allow 45–60 minutes each way by metro/Yurikamome. Check current opening days and any timed-entry requirements; no tickets are assumed.',
    sources: [{ label: 'GO TOKYO · Odaiba', url: 'https://www.gotokyo.org/en/destinations/southern-tokyo/odaiba/index.html' }, { label: 'Miraikan · visitor information', url: 'https://www.miraikan.jst.go.jp/en/visit/' }],
    places: [
      stop('pool-odaiba-out', 'Rail · hotel → Odaiba', 'transit', 'Allow 45–60 minutes door to door, including transfers and station walks.', 'Daiba Station Tokyo', [35.625, 139.775], { startTime: '09:00', durationMinutes: 55, originQuery: hotel, travelMode: 'train' }),
      stop('pool-odaiba-waterfront', 'Odaiba waterfront promenade', 'sight', 'Flat, open-air bay walk with views across Rainbow Bridge; shorten this if weather is poor.', 'Odaiba Seaside Park Tokyo', [35.629, 139.776], { startTime: '10:00', durationMinutes: 75 }),
      stop('pool-odaiba-museum', 'Choose one indoor attraction', 'sight', 'Choose Miraikan or another currently open bay-area venue; allow around two hours and check entry rules.', 'Miraikan National Museum of Emerging Science Tokyo', [35.619, 139.776], { startTime: '11:30', durationMinutes: 120, verification: 'verify-before-trip' }),
      stop('pool-odaiba-lunch-walk', 'Walk · museum → waterfront dining', 'transit', 'Allow 15 minutes for the walk to the chosen mall/restaurant cluster.', 'Aqua City Odaiba', [35.628, 139.775], { startTime: '13:30', durationMinutes: 15, originQuery: 'Miraikan National Museum of Emerging Science Tokyo', travelMode: 'walk' }),
      stop('pool-odaiba-lunch', 'Lunch · Aqua City Odaiba', 'food', 'Restaurant cluster beside the waterfront; browse its current directory and pick an open venue.', 'Aqua City Odaiba restaurants', [35.628, 139.775], { startTime: '13:45', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Restaurant cluster', role: 'primary', sourceUrl: 'https://www.aquacity.jp/en/shop/', sourceLabel: 'Aqua City Odaiba · shop directory', verification: 'verify-before-trip' }),
      stop('pool-odaiba-lunch-backup', 'Lunch backup · DiverCity Tokyo Plaza', 'food', 'Nearby indoor food options if Aqua City is crowded; check the current store directory.', 'DiverCity Tokyo Plaza restaurants', [35.625, 139.776], { mealContext: 'lunch', cuisine: 'Food court and restaurants', role: 'backup', sourceUrl: 'https://mitsui-shopping-park.com/divercity-tokyo/en/shopguide/', sourceLabel: 'DiverCity · shop guide', verification: 'verify-before-trip' }),
      stop('pool-odaiba-station-walk', 'Walk · Odaiba dining → station', 'transit', 'Allow about 15 minutes to return to the Yurikamome/metro station after lunch.', 'Daiba Station Tokyo', [35.625, 139.775], { startTime: '14:45', durationMinutes: 15, originQuery: 'Aqua City Odaiba', travelMode: 'walk' }),
      stop('pool-odaiba-return', 'Rail · Odaiba → hotel', 'transit', 'Allow 45–60 minutes door to door; leave before the evening commute for an easier ride.', hotel, [35.68219, 139.799637], { startTime: '15:00', durationMinutes: 55, originQuery: 'Daiba Station Tokyo', travelMode: 'train' }),
    ],
  },
  {
    id: 'tsukiji-ginza', title: 'Tsukiji food market + Ginza shopping', kind: 'outing', categoryId: 'neighborhood', area: 'Tokyo neighborhood · Tsukiji · Ginza', durationLabel: 'about 8¾ hours door to door',
    summary: 'A food-and-shopping day with an early Tsukiji Outer Market visit, then a relaxed walk into Ginza for department stores, stationery, design shops and cafés. Market stalls can close early or sell out; arrive in the morning and bring cash as a backup.',
    routeNote: 'From Kiyosumi-Shirakawa, allow 35–50 minutes to Tsukiji by subway and station walks. Tsukiji and Ginza are an easy walk between districts; return from Ginza by metro in roughly 30–40 minutes. This is a central-Tokyo outing, not a second long day trip.',
    sources: [{ label: 'GO TOKYO · Tsukiji Outer Market', url: 'https://www.gotokyo.org/en/spot/65/index.html' }, { label: 'GO TOKYO · Ginza guide', url: 'https://www.gotokyo.org/en/destinations/central-tokyo/ginza/' }],
    places: [
      stop('pool-tsukiji-out', 'Metro · hotel → Tsukiji Outer Market', 'transit', 'Allow 35–50 minutes including station access; go in the morning while more stalls are operating.', 'Tsukiji Outer Market Tokyo', [35.6654, 139.7707], { startTime: '08:30', durationMinutes: 45, originQuery: hotel, travelMode: 'train' }),
      stop('pool-tsukiji-market', 'Tsukiji Outer Market · browse + breakfast bites', 'sight', 'Explore a small selection of food and kitchenware stalls; allow about 90 minutes. Opening days and individual stall hours vary, so check the market’s official notices and bring cash as a backup.', 'Tsukiji Outer Market Tokyo', [35.6654, 139.7707], { startTime: '09:30', durationMinutes: 90, verification: 'verify-before-trip' }),
      stop('pool-tsukiji-ginza-walk', 'Walk · Tsukiji → Ginza', 'transit', 'Allow about 20 minutes on foot; take a rest or use local transit if your legs need it.', 'Ginza 4-chome Crossing Tokyo', [35.6717, 139.765], { startTime: '11:15', durationMinutes: 20, originQuery: 'Tsukiji Outer Market Tokyo', travelMode: 'walk' }),
      stop('pool-ginza-shopping', 'Ginza · department stores + back streets', 'sight', 'Choose two or three priorities—such as Ginza Six, stationery, boutiques or the main street—rather than trying to cover the whole district.', 'Ginza Six Tokyo', [35.6695, 139.7648], { startTime: '11:45', durationMinutes: 150 }),
      stop('pool-ginza-lunch', 'Lunch · Ginza restaurant streets', 'food', 'Pick an open restaurant or department-store dining floor after browsing; check the current venue directory and weekend queues. No restaurant or reservation is assumed.', 'Ginza restaurants Tokyo', [35.6702, 139.7649], { startTime: '14:15', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Ginza restaurant choice', role: 'primary', sourceUrl: 'https://www.gotokyo.org/en/destinations/central-tokyo/ginza/', sourceLabel: 'GO TOKYO · Ginza guide' }),
      stop('pool-ginza-lunch-backup', 'Lunch backup · Tsukiji Outer Market', 'food', 'If Ginza is too busy, return toward Tsukiji for an open stall or casual restaurant; check the day’s operating hours before relying on a particular shop.', 'Tsukiji Outer Market restaurants Tokyo', [35.6654, 139.7707], { mealContext: 'lunch', cuisine: 'Market stalls and casual Japanese dining', role: 'backup', sourceUrl: 'https://www.gotokyo.org/en/spot/65/index.html', sourceLabel: 'GO TOKYO · Tsukiji Outer Market', verification: 'verify-before-trip' }),
      stop('pool-ginza-return', 'Metro · Ginza → hotel', 'transit', 'Allow about 35–45 minutes door to door; use the nearest station for your final shopping stop.', hotel, [35.68219, 139.799637], { startTime: '16:30', durationMinutes: 45, originQuery: 'Ginza Station Tokyo', travelMode: 'train' }),
    ],
  },
  {
    id: 'koenji-vintage', title: 'Koenji vintage + record shops', kind: 'outing', categoryId: 'shopping-gaming', area: 'Tokyo neighborhood · Koenji', durationLabel: 'about 8½ hours door to door',
    summary: 'A relaxed west-Tokyo browse for vintage clothing, independent shops, records and cafés, with an early dinner option if you want to stay out. It is more local and alternative than the big-brand shopping in Shibuya; choose a few streets and shops rather than planning a store-by-store march.',
    routeNote: 'Allow around 45–60 minutes each way from the hotel by subway/JR, including transfers and station walks. Shops are spread around Koenji Station and some open later in the day, so use the morning for a café or neighborhood walk and check individual shop hours.',
    sources: [{ label: 'GO TOKYO · Koenji', url: 'https://www.gotokyo.org/en/destinations/western-tokyo/koenji/index.html' }, { label: 'GO TOKYO · Tokyo shopping guide', url: 'https://www.gotokyo.org/en/see-and-do/shopping/index.html' }],
    places: [
      stop('pool-koenji-out', 'Rail · hotel → Koenji', 'transit', 'Allow 45–60 minutes door to door with a transfer and station walks; check a live route for the selected day.', 'Koenji Station Tokyo', [35.7054, 139.6499], { startTime: '09:30', durationMinutes: 55, originQuery: hotel, travelMode: 'train' }),
      stop('pool-koenji-coffee', 'Coffee + neighborhood start', 'sight', 'Take a slow start near the station; select a café that is open rather than relying on a specific venue before shop hours are confirmed.', 'Koenji Station cafes Tokyo', [35.7054, 139.6499], { startTime: '10:30', durationMinutes: 45 }),
      stop('pool-koenji-shopping', 'Vintage clothing + independent shops', 'sight', 'Browse the Koenji shotengai and side streets for vintage clothing and small independent shops. Keep purchases manageable for the train ride back.', 'Koenji vintage clothing shops Tokyo', [35.7054, 139.6499], { startTime: '11:30', durationMinutes: 150 }),
      stop('pool-koenji-lunch', 'Lunch · Koenji neighborhood', 'food', 'Choose an open curry, ramen or set-meal restaurant near the shopping streets; opening days and queues vary, so keep this flexible.', 'Koenji restaurants Tokyo', [35.7054, 139.6499], { startTime: '14:15', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Local café, curry or Japanese set meal', role: 'primary', sourceUrl: 'https://www.gotokyo.org/en/destinations/western-tokyo/koenji/index.html', sourceLabel: 'GO TOKYO · Koenji area guide' }),
      stop('pool-koenji-lunch-backup', 'Lunch backup · Koenji Station area', 'food', 'Stay near Koenji Station and pick another open casual restaurant if the first choice has a queue; this fallback avoids an extra cross-city trip.', 'Koenji Station restaurants Tokyo', [35.7054, 139.6499], { mealContext: 'lunch', cuisine: 'Casual restaurant cluster', role: 'backup', sourceUrl: 'https://www.gotokyo.org/en/destinations/western-tokyo/koenji/index.html', sourceLabel: 'GO TOKYO · Koenji area guide' }),
      stop('pool-koenji-records', 'Records + final shotengai browse', 'sight', 'Use the remaining time for record shops or a second pass through the shopping streets; individual store hours may start late.', 'Koenji record stores Tokyo', [35.7054, 139.6499], { startTime: '15:30', durationMinutes: 75, verification: 'verify-before-trip' }),
      stop('pool-koenji-return', 'JR · Koenji → hotel', 'transit', 'Allow about 50–60 minutes door to door; avoid carrying bulky shopping at rush hour.', hotel, [35.68219, 139.799637], { startTime: '17:00', durationMinutes: 55, originQuery: 'Koenji Station Tokyo', travelMode: 'train' }),
    ],
  },
  {
    id: 'teamlab-toyosu', title: 'teamLab Planets + Toyosu', kind: 'outing', categoryId: 'waterfront', area: 'Tokyo bay day · Toyosu', durationLabel: 'about 6 hours door to door',
    summary: 'A focused immersive-art experience paired with an easy Toyosu waterfront lunch. Buy a timed admission ticket in advance if you choose this option; the visit is barefoot/water-based in parts, so check the venue guidance and wear practical clothing.',
    routeNote: 'Toyosu is close to your hotel: allow roughly 25–40 minutes by subway/Yurikamome and station walks. The official access guide recommends the rail stations rather than depending on public buses, which can be congested. This is a half-day-plus outing, not a full Odaiba day.',
    sources: [{ label: 'teamLab Planets · official ticket store and visitor guide', url: 'https://teamlabplanets.dmm.com/en/guide' }, { label: 'teamLab Planets · official access guide', url: 'https://teamlabplanets.dmm.com/en/guide/access_method' }],
    bookingActions: [{ id: 'teamlab-ticket', item: 'teamLab Planets · buy a timed admission ticket', priority: 'required', deadline: 'Before this day · choose an available entry slot', destination: 'teamLab Planets TOKYO, Toyosu', purchaseUrl: 'https://teamlabplanets.dmm.com/en/guide', purchaseLabel: 'teamLab Planets · official visitor guide and ticket store', notes: 'Buy an official timed ticket for the chosen date and entry slot. Check current visitor guidance; this planner does not book admission.' }],
    places: [
      stop('pool-teamlab-out', 'Metro / Yurikamome · hotel → Toyosu', 'transit', 'Allow 25–40 minutes door to door; use rail rather than relying on a public bus, and check the live route.', 'teamLab Planets TOKYO Toyosu', [35.6492, 139.7894], { startTime: '09:15', durationMinutes: 35, originQuery: hotel, travelMode: 'train' }),
      stop('pool-teamlab-visit', 'teamLab Planets TOKYO', 'sight', 'Allow about 2½ hours for entry, the immersive route and changing areas. Buy an official timed ticket in advance and check current visitor guidance; dates and entry slots are not booked by this planner.', 'teamLab Planets TOKYO Toyosu', [35.6492, 139.7894], { startTime: '10:00', durationMinutes: 150, sourceUrl: 'https://teamlabplanets.dmm.com/en/guide', sourceLabel: 'teamLab Planets · official visitor guide', verification: 'verify-before-trip' }),
      stop('pool-teamlab-lunch-walk', 'Walk · teamLab Planets → Toyosu lunch', 'transit', 'Allow around 15 minutes to reach the selected Toyosu restaurant cluster; check current access and weather.', 'Urban Dock LaLaport Toyosu', [35.6552, 139.789], { startTime: '12:45', durationMinutes: 15, originQuery: 'teamLab Planets TOKYO Toyosu', travelMode: 'walk' }),
      stop('pool-teamlab-lunch', 'Lunch · Urban Dock LaLaport Toyosu', 'food', 'Choose an open restaurant from the current center directory; this keeps lunch close to the venue without assuming a specific booking.', 'Urban Dock LaLaport Toyosu restaurants', [35.6552, 139.789], { startTime: '13:15', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Toyosu restaurant cluster', role: 'primary', sourceUrl: 'https://mitsui-shopping-park.com/lalaport/toyosu/en/shopguide/', sourceLabel: 'LaLaport Toyosu · shop guide' }),
      stop('pool-teamlab-lunch-backup', 'Lunch backup · Toyosu Station area', 'food', 'If the mall is busy, choose another open restaurant near Toyosu Station before heading back; check current hours on the day.', 'Toyosu Station restaurants Tokyo', [35.6552, 139.795], { mealContext: 'lunch', cuisine: 'Casual restaurant cluster', role: 'backup', sourceUrl: 'https://mitsui-shopping-park.com/lalaport/toyosu/en/shopguide/', sourceLabel: 'LaLaport Toyosu · shop guide', verification: 'verify-before-trip' }),
      stop('pool-teamlab-return', 'Rail · Toyosu → hotel', 'transit', 'Allow about 30–40 minutes door to door, including station walks.', hotel, [35.68219, 139.799637], { startTime: '14:30', durationMinutes: 35, originQuery: 'Urban Dock LaLaport Toyosu', travelMode: 'train' }),
    ],
  },
  {
    id: 'hakone-gora', title: 'Hakone Open-Air Museum day trip', kind: 'outing', categoryId: 'day-trip', area: 'Full day trip · Hakone · Gora', durationLabel: 'about 11¾ hours door to door',
    summary: 'A scenic, art-focused alternative day trip: ride to Hakone-Yumoto, continue by mountain railway to Gora, and spend the main visit at the Hakone Open-Air Museum. Keep the loop simple rather than trying to add Lake Ashi and every ropeway stop; weather or service disruption can make a reduced Gora-only day more comfortable.',
    routeNote: 'Allow about 45–60 minutes from the hotel to Shinjuku, then around 75–90 minutes on a reserved Odakyu Romancecar to Hakone-Yumoto; the Hakone Tozan mountain train takes roughly 40–45 minutes onward to Gora. Return the same way, allowing about 3 hours from Gora to the hotel including transfers. Times are planning allowances, not a November 2026 timetable. Check service status and reserve the Romancecar; the Hakone Freepass may suit the area transport, but compare the current fare and inclusions before buying.',
    sources: [{ label: 'Odakyu · Romancecar and Hakone access', url: 'https://www.odakyu.jp/english/transport/timetable/' }, { label: 'Hakone Open-Air Museum · official visitor information', url: 'https://www.hakone-oam.or.jp/en/' }, { label: 'Odakyu · Hakone Freepass', url: 'https://www.odakyu.jp/english/passes/hakone/' }],
    bookingActions: [
      { id: 'romancecar-outbound', item: 'Romancecar · reserve Shinjuku → Hakone-Yumoto seats', priority: 'required', deadline: 'Before this day · check date-specific connections and seat availability', destination: 'Shinjuku → Hakone-Yumoto', purchaseUrl: 'https://www.odakyu.jp/english/transport/timetable/', purchaseLabel: 'Odakyu · Romancecar timetable and Hakone access', notes: 'Choose and reserve the outward Romancecar seats for this date. Confirm connections and availability; this planner does not hold seats.' },
      { id: 'romancecar-return', item: 'Romancecar · reserve Hakone-Yumoto → Shinjuku seats', priority: 'required', deadline: 'Before this day · choose a suitable return and keep a buffer', destination: 'Hakone-Yumoto → Shinjuku', purchaseUrl: 'https://www.odakyu.jp/english/transport/timetable/', purchaseLabel: 'Odakyu · Romancecar timetable and Hakone access', notes: 'Choose and reserve a suitable return Romancecar, leaving time for the mountain railway and transfers. Confirm the date-specific timetable; do not depend on a last train.' },
    ],
    places: [
      stop('pool-hakone-out', 'Rail · hotel → Shinjuku → Hakone-Yumoto', 'transit', 'Allow about 2½ hours door to door using a reserved Romancecar from Shinjuku; confirm date-specific connections and seat availability.', 'Hakone-Yumoto Station', [35.2324, 139.1069], { startTime: '07:30', durationMinutes: 150, originQuery: hotel, travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-hakone-mountain-rail', 'Hakone Tozan Railway · Yumoto → Gora', 'transit', 'Allow about 45 minutes for the mountain railway plus connection time; check service status before setting out.', 'Gora Station Hakone', [35.2507, 139.0489], { startTime: '10:15', durationMinutes: 45, originQuery: 'Hakone-Yumoto Station', travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-hakone-museum', 'Hakone Open-Air Museum', 'sight', 'Allow about 2–2½ hours for the outdoor sculpture grounds and indoor galleries. Wear comfortable shoes and check current opening/admission information.', 'Hakone Open-Air Museum', [35.2478, 139.0513], { startTime: '11:15', durationMinutes: 150, sourceUrl: 'https://www.hakone-oam.or.jp/en/', sourceLabel: 'Hakone Open-Air Museum · official visitor information', verification: 'verify-before-trip' }),
      stop('pool-hakone-lunch', 'Lunch · Gora area', 'food', 'Choose an open restaurant near Gora after the museum; check operating days and allow for a queue rather than relying on a specific small venue.', 'Gora Station restaurants Hakone', [35.2507, 139.0489], { startTime: '14:00', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Hakone local restaurant choice', role: 'primary', sourceUrl: 'https://www.hakone-oam.or.jp/en/', sourceLabel: 'Hakone Open-Air Museum · access and visitor guide' }),
      stop('pool-hakone-lunch-backup', 'Lunch backup · Hakone-Yumoto Station area', 'food', 'If Gora options are closed or busy, use an open casual restaurant near Hakone-Yumoto on the return; leave enough time for the train connection.', 'Hakone-Yumoto Station restaurants', [35.2324, 139.1069], { mealContext: 'lunch', cuisine: 'Station-area casual dining', role: 'backup', sourceUrl: 'https://www.odakyu.jp/english/transport/timetable/', sourceLabel: 'Odakyu · Hakone rail access', verification: 'verify-before-trip' }),
      stop('pool-hakone-gora-stroll', 'Gora · short garden or town stroll', 'optional', 'Optional 30–45 minute nearby stroll only if the museum visit and return connection leave comfortable time; skip first if tired or service is delayed.', 'Gora Park Hakone', [35.2492, 139.0474], { startTime: '15:15', durationMinutes: 45, verification: 'verify-before-trip' }),
      stop('pool-hakone-return', 'Rail · Gora → Hakone-Yumoto → Shinjuku → hotel', 'transit', 'Allow about 3 hours door to door, including mountain railway, Romancecar and Tokyo rail transfer. Reserve a suitable return and keep a buffer; do not depend on a last train.', hotel, [35.68219, 139.799637], { startTime: '16:15', durationMinutes: 180, originQuery: 'Gora Station Hakone', travelMode: 'train', verification: 'verify-before-trip' }),
    ],
  },
  {
    id: 'izakaya-evening', title: 'Izakaya evening near the hotel', kind: 'evening', categoryId: 'evening', area: 'Optional evening · Monzen-Nakacho', durationLabel: 'about 2½–3 hours',
    summary: 'Optional local dinner to pair with any flex day: Kyushu seafood, motsunabe and shared plates, then a nearby return instead of a late cross-city bar hop. Restaurant hours, last order and reservation availability can change; confirm for the chosen date.',
    routeNote: 'Monzen-Nakacho is close to your hotel; allow 15–25 minutes each way by walking/metro, depending on the chosen restaurant.',
    sources: [{ label: 'GO TOKYO · Tokyo food and izakaya guide', url: 'https://www.gotokyo.org/en/see-and-do/index.html' }],
    places: [
      stop('pool-izakaya-out', 'Walk/metro · hotel → izakaya area', 'transit', 'Allow 15–25 minutes for the selected local restaurant; pick the exact venue and confirm opening hours.', 'Monzen Nakacho Tokyo izakaya', [35.6725, 139.7964], { startTime: '18:30', durationMinutes: 20, originQuery: hotel, travelMode: 'walk' }),
      stop('pool-izakaya-dinner', 'Izakaya dinner · Kimuraya Honten Monzen-Nakacho', 'food', 'Named nearby izakaya serving Kyushu seafood and motsunabe. Check the official site for hours, last order and reservation availability for the selected date; these operational details may change.', 'Kimuraya Honten Monzen Nakacho Tokyo', [35.6718, 139.7967], { startTime: '19:00', durationMinutes: 120, mealContext: 'dinner', cuisine: 'Izakaya · Kyushu seafood and motsunabe', signature: 'Hakata motsunabe', priceBand: '€€', role: 'primary', sourceUrl: 'https://kimurayahonten-monzennakacho.com/', sourceLabel: 'Kimuraya Honten Monzen-Nakacho · official venue site', verification: 'verify-before-trip' }),
      stop('pool-izakaya-dinner-backup', 'Dinner backup · Torafugu-tei Monzen-Nakacho', 'food', 'A distinct nearby sit-down alternative for fugu and Japanese hot pot, a short walk from Monzen-Nakacho Station. Its official listing gives evening service daily; check the menu, latest hours and whether you want a fugu-focused meal.', 'Torafugu-tei Monzen Naka-cho Tokyo', [35.6723, 139.7962], { mealContext: 'dinner', cuisine: 'Fugu · Japanese hot pot', priceBand: '€€€', role: 'backup', sourceUrl: 'https://www.wokuni.jp/en/monzennakachou/outline/', sourceLabel: 'Torafugu-tei · official Monzen-Nakacho listing', verification: 'verify-before-trip' }),
      stop('pool-izakaya-return', 'Walk/metro · izakaya → hotel', 'transit', 'Return locally; allow 15–25 minutes and check the final train only if using the metro.', hotel, [35.68219, 139.799637], { startTime: '21:00', durationMinutes: 20, originQuery: 'Monzen Nakacho Tokyo izakaya', travelMode: 'walk' }),
    ],
  },
];

// Describes the main visits, not a forecast. Keep the original pool annotated so
// the new routes can be filtered alongside the previously researched options.
const existingMetadata: Record<string, Pick<TokyoPoolActivity, 'weatherFit' | 'themes'>> = {
  akihabara: { weatherFit: 'mixed', themes: ['shopping', 'local', 'food', 'history'] },
  'shibuya-shopping': { weatherFit: 'mixed', themes: ['shopping', 'local', 'food'] },
  'costco-kawasaki': { weatherFit: 'indoors', themes: ['shopping', 'food'] },
  yokohama: { weatherFit: 'mixed', themes: ['views', 'shopping', 'food', 'local'] },
  kawagoe: { weatherFit: 'outdoors', themes: ['history', 'food', 'local'] },
  kawaguchiko: { weatherFit: 'mixed', themes: ['views', 'food', 'local'] },
  'deep-fukagawa': { weatherFit: 'mixed', themes: ['gardens', 'history', 'food', 'local'] },
  'asakusa-ueno': { weatherFit: 'mixed', themes: ['history', 'art', 'shopping', 'food'] },
  'shinjuku-green': { weatherFit: 'mixed', themes: ['gardens', 'views', 'shopping'] },
  'odaiba-bay': { weatherFit: 'mixed', themes: ['views', 'art', 'shopping'] },
  'tsukiji-ginza': { weatherFit: 'mixed', themes: ['food', 'shopping', 'local'] },
  'koenji-vintage': { weatherFit: 'mixed', themes: ['shopping', 'local', 'food'] },
  'teamlab-toyosu': { weatherFit: 'indoors', themes: ['art', 'food', 'views'] },
  'hakone-gora': { weatherFit: 'mixed', themes: ['art', 'views', 'gardens'] },
  'izakaya-evening': { weatherFit: 'indoors', themes: ['food', 'local'] },
};
for (const activity of tokyoPool) Object.assign(activity, existingMetadata[activity.id]);

tokyoPool.push(...tokyoMoreActivities);

export const tokyoPoolActivities = tokyoPool;
const categoryDefinitions: Omit<TokyoPoolCategory, 'activities'>[] = [
  { id: 'neighborhood', label: 'Tokyo neighborhoods' },
  { id: 'shopping-gaming', label: 'Shopping + gaming' },
  { id: 'day-trip', label: 'Optional day trips' },
  { id: 'local-easy', label: 'Easy local day' },
  { id: 'culture', label: 'Culture + museums' },
  { id: 'waterfront', label: 'Waterfront + indoor option' },
  { id: 'special-purpose', label: 'Special-purpose outing' },
  { id: 'evening', label: 'Evening add-on' },
];
/** Stable category groups for a compact, expandable activity-board presentation. */
export const tokyoPoolCategories: TokyoPoolCategory[] = categoryDefinitions
  .map((category) => ({ ...category, activities: tokyoPool.filter((activity) => activity.categoryId === category.id) }))
  .filter((category) => category.activities.length > 0);

export interface TokyoFlexibleDay {
  id: string;
  label: string;
  /** Pool ideas are choices only; nothing is scheduled until the couple assigns it. */
  outing: null;
  evening: null;
}

export const tokyoFlexibleDays: TokyoFlexibleDay[] = [
  { id: '2026-11-01', label: 'Sun 1 Nov · open Tokyo day', outing: null, evening: null },
  { id: '2026-11-04', label: 'Wed 4 Nov · open Tokyo day', outing: null, evening: null },
  { id: '2026-11-06', label: 'Fri 6 Nov · open Tokyo day', outing: null, evening: null },
  { id: '2026-11-07', label: 'Sat 7 Nov · open Tokyo day', outing: null, evening: null },
  { id: '2026-11-08', label: 'Sun 8 Nov · open Tokyo day', outing: null, evening: null },
  { id: '2026-11-09', label: 'Mon 9 Nov · open Tokyo day', outing: null, evening: null },
  { id: '2026-11-10', label: 'Tue 10 Nov · open Tokyo day', outing: null, evening: null },
];
