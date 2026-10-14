import type { Place } from '../types/trip';

export interface TokyoPoolActivity {
  id: string;
  title: string;
  kind: 'outing' | 'evening';
  area: string;
  durationLabel: string;
  summary: string;
  routeNote: string;
  places: Place[];
  sources: { label: string; url: string }[];
}

const stop = (id: string, name: string, type: Place['type'], description: string, mapsQuery: string, coordinates: [number, number], extra: Partial<Place> = {}): Place => ({
  id, name, type, description, mapsQuery, coordinates, verification: 'research', ...extra,
});

const hotel = 'Comfort Hotel Tokyo Kiyosumi Shirakawa';
const akihabara = [35.6984, 139.7731] as [number, number];
const tokyoPool: TokyoPoolActivity[] = [
  {
    id: 'akihabara', title: 'Akihabara games + electronics', kind: 'outing', area: 'Akihabara · Kanda', durationLabel: 'about 7 hours door to door',
    summary: 'Arcades and retro games, electronics/anime shops, a relaxed lunch and Kanda Myojin nearby. Shops open at different times, so start mid-morning.',
    routeNote: 'Allow 30–40 minutes each way from the hotel by metro/train; this is a compact east-central Tokyo day, not a cross-city combination.',
    sources: [{ label: 'GO TOKYO · Akihabara', url: 'https://www.gotokyo.org/en/spot/55/' }],
    places: [
      stop('pool-akihabara-out', 'Metro · hotel → Akihabara', 'transit', 'Allow 30–40 minutes door to door, including station walks and one transfer if needed.', 'Akihabara Station Electric Town Exit', akihabara, { startTime: '10:00', durationMinutes: 35, originQuery: hotel, travelMode: 'train' }),
      stop('pool-akihabara-games', 'Arcades + retro games', 'sight', 'Browse game floors and arcades at your own pace; allow about 90 minutes. Confirm the specific shops you most want to visit.', 'Akihabara retro game arcade', akihabara, { startTime: '10:45', durationMinutes: 90 }),
      stop('pool-akihabara-electronics', 'Electronics + anime shop browse', 'sight', 'Choose a small number of priority stores rather than trying to cover every building; allow about two hours.', 'Akihabara Electric Town Tokyo', akihabara, { startTime: '12:30', durationMinutes: 120 }),
      stop('pool-akihabara-lunch', 'Lunch · Akihabara', 'food', 'Flexible ramen, curry or set-meal lunch near the station; use a walk-in choice to avoid queue pressure.', 'Akihabara lunch restaurant', akihabara, { startTime: '14:45', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Tokyo casual dining', priceBand: '€€', role: 'primary' }),
      stop('pool-akihabara-lunch-backup', 'Lunch backup · Akihabara', 'food', 'Nearby walk-in alternative if your first choice has a queue; decide after checking what sounds good.', 'Akihabara curry restaurant', akihabara, { mealContext: 'lunch', cuisine: 'Japanese curry / ramen', role: 'backup', fallback: true }),
      stop('pool-kanda-walk', 'Walk · Akihabara → Kanda Myojin', 'transit', 'Allow about 15 minutes on foot uphill to the shrine.', 'Kanda Myojin Shrine', [35.702, 139.767], { startTime: '15:45', durationMinutes: 15, originQuery: 'Akihabara Station', travelMode: 'walk' }),
      stop('pool-kanda-shrine', 'Kanda Myojin Shrine', 'sight', 'A compact nearby shrine visit; about 30–40 minutes, or skip for more shop time.', 'Kanda Myojin Shrine Tokyo', [35.702, 139.767], { startTime: '16:00', durationMinutes: 40 }),
      stop('pool-akihabara-return', 'Train · Akihabara → hotel', 'transit', 'Allow 30–40 minutes door to door; keep shopping bags manageable on the train.', hotel, [35.682, 139.798], { startTime: '16:45', durationMinutes: 40, originQuery: 'Akihabara Station', travelMode: 'train' }),
    ],
  },
  {
    id: 'shibuya-shopping', title: 'Shoes + clothing shopping', kind: 'outing', area: 'Shibuya · Harajuku', durationLabel: 'about 8 hours door to door',
    summary: 'Make this the dedicated fashion day: Shibuya shoe/streetwear shops, lunch, then Harajuku/Omotesando if you still want more browsing. Crossing/Hachiko are an easy short stop.',
    routeNote: 'Keep to the west-side neighborhoods; allow 35–50 minutes each way from Kiyosumi-Shirakawa, depending on the exact route and crowds.',
    sources: [{ label: 'GO TOKYO · Shibuya shopping', url: 'https://www.gotokyo.org/en/story/guide/shibuya-shop/index.html' }, { label: 'GO TOKYO · Shopping in Tokyo', url: 'https://www.gotokyo.org/en/see-and-do/shopping/index.html' }],
    places: [
      stop('pool-shibuya-out', 'Metro · hotel → Shibuya', 'transit', 'Allow 35–50 minutes door to door from the hotel, plus station-navigation time.', 'Shibuya Station Hachiko Exit', [35.6595, 139.7005], { startTime: '09:30', durationMinutes: 45, originQuery: hotel, travelMode: 'train' }),
      stop('pool-shibuya-crossing', 'Hachiko + Shibuya Scramble', 'sight', 'See the famous crossing and orient yourselves; 30–40 minutes is enough before the shopping focus.', 'Shibuya Scramble Crossing', [35.6595, 139.7005], { startTime: '10:30', durationMinutes: 40 }),
      stop('pool-shibuya-shopping', 'Shoes + streetwear shopping', 'sight', 'Choose a few stores in Shibuya Parco / Center-gai / nearby sneaker shops. Allow about 2.5 hours, with store choices confirmed closer to travel.', 'Shibuya Parco Tokyo', [35.661, 139.7], { startTime: '11:15', durationMinutes: 150 }),
      stop('pool-shibuya-lunch', 'Lunch · Shibuya', 'food', 'Flexible lunch near the shopping area. Pick the style and branch on the day rather than committing to a long queue.', 'Shibuya lunch restaurant', [35.661, 139.7], { startTime: '13:45', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Tokyo casual dining', priceBand: '€€', role: 'primary' }),
      stop('pool-shibuya-lunch-backup', 'Lunch backup · Shibuya', 'food', 'Choose another nearby café or casual restaurant if the first place is busy.', 'Shibuya casual restaurant', [35.661, 139.7], { mealContext: 'lunch', cuisine: 'Japanese / café', role: 'backup', fallback: true }),
      stop('pool-harajuku-transfer', 'JR / walk · Shibuya → Harajuku', 'transit', 'Allow 20–30 minutes door to door, or walk if the weather and energy are good.', 'Harajuku Station', [35.6702, 139.7027], { startTime: '15:00', durationMinutes: 25, originQuery: 'Shibuya Station', travelMode: 'train' }),
      stop('pool-harajuku-browse', 'Harajuku + Omotesando browse', 'sight', 'A flexible final browse for clothing, design and people-watching; keep it to 60–90 minutes.', 'Takeshita Street Harajuku', [35.6702, 139.7027], { startTime: '15:30', durationMinutes: 75 }),
      stop('pool-shibuya-return', 'Metro · Harajuku → hotel', 'transit', 'Allow about 40–50 minutes back to Kiyosumi-Shirakawa.', hotel, [35.682, 139.798], { startTime: '17:00', durationMinutes: 45, originQuery: 'Harajuku Station', travelMode: 'train' }),
    ],
  },
  {
    id: 'costco-kawasaki', title: 'Costco warehouse trip', kind: 'outing', area: 'Kawasaki · Kanagawa', durationLabel: 'about 6–7 hours door to door',
    summary: 'A genuine warehouse run rather than a central-Tokyo attraction. Target Costco Kawasaki, browse and eat there, then return before carrying bulky purchases across the city. Membership is required; verify your card works in Japan.',
    routeNote: 'Plan roughly 60–75 minutes each way by public transport from the hotel, depending on the route and bus connection. Check current access, hours, membership validity and baggage practicality before choosing this.',
    sources: [{ label: 'Costco Japan · Warehouse services', url: 'https://www.costco.co.jp/WarehouseProductsServices' }],
    places: [
      stop('pool-costco-out', 'Train/bus · hotel → Costco Kawasaki', 'transit', 'Allow 60–75 minutes door to door; verify the exact rail/bus route and service on the day.', 'Costco Kawasaki Warehouse', [35.5265, 139.723], { startTime: '09:00', durationMinutes: 70, originQuery: hotel, travelMode: 'train', verification: 'verify-before-trip' }),
      stop('pool-costco-shop', 'Costco Kawasaki Warehouse', 'sight', 'Allow 2–3 hours to shop. Membership is required; verify your membership is accepted in Japan and think about how purchases will travel back on public transport.', 'Costco Kawasaki Warehouse', [35.5265, 139.723], { startTime: '10:30', durationMinutes: 150, verification: 'verify-before-trip' }),
      stop('pool-costco-lunch', 'Food court / lunch · Costco', 'food', 'Convenient lunch at the warehouse if open and available; treat it as flexible rather than a guaranteed restaurant booking.', 'Costco Kawasaki Warehouse', [35.5265, 139.723], { startTime: '13:00', durationMinutes: 45, mealContext: 'lunch', cuisine: 'Costco food court', role: 'primary', verification: 'verify-before-trip' }),
      stop('pool-costco-food-backup', 'Food backup · Kawasaki', 'food', 'If the food court is too busy, find an open casual restaurant near the warehouse; confirm access and hours before relying on it.', 'Kawasaki casual restaurant near Costco', [35.5265, 139.723], { mealContext: 'lunch', cuisine: 'Casual dining', role: 'backup', fallback: true, verification: 'verify-before-trip' }),
      stop('pool-costco-return', 'Train/bus · Costco → hotel', 'transit', 'Allow 60–75 minutes back to the hotel; avoid scheduling another distant activity on this day.', hotel, [35.682, 139.798], { startTime: '14:00', durationMinutes: 70, originQuery: 'Costco Kawasaki Warehouse', travelMode: 'train', verification: 'verify-before-trip' }),
    ],
  },
  {
    id: 'yokohama', title: 'Yokohama harbor + Chinatown', kind: 'outing', area: 'Yokohama', durationLabel: 'about 9 hours door to door',
    summary: 'A varied day trip: waterfront/Minato Mirai, Red Brick Warehouse, then Chinatown for an early dinner. Keep the route to the central harbor so it stays relaxed.',
    routeNote: 'Allow around 45–60 minutes each way from the hotel by rail plus station walks. Check the chosen train and attraction hours; no timed ticket is assumed.',
    sources: [{ label: 'GO TOKYO · Yokohama', url: 'https://www.gotokyo.org/en/destinations/beyond-tokyo/yokohama.html' }],
    places: [
      stop('pool-yokohama-out', 'JR / metro · hotel → Yokohama', 'transit', 'Allow 45–60 minutes door to door; choose the route to Minato Mirai or Sakuragicho based on the first stop.', 'Yokohama Station', [35.466, 139.622], { startTime: '09:00', durationMinutes: 55, originQuery: hotel, travelMode: 'train' }),
      stop('pool-yokohama-harbor', 'Minato Mirai waterfront', 'sight', 'A scenic harbor walk and city-view area; allow about two hours including photo and coffee breaks.', 'Minato Mirai Yokohama', [35.455, 139.632], { startTime: '10:15', durationMinutes: 120 }),
      stop('pool-yokohama-redbrick', 'Yokohama Red Brick Warehouse', 'sight', 'Browse the historic waterfront complex and shops; allow around 75 minutes.', 'Yokohama Red Brick Warehouse', [35.452, 139.642], { startTime: '12:45', durationMinutes: 75 }),
      stop('pool-yokohama-lunch', 'Lunch · Minato Mirai', 'food', 'Choose a flexible lunch near the waterfront; this can be early lunch or a substantial snack before Chinatown.', 'Minato Mirai Yokohama restaurant', [35.455, 139.632], { startTime: '14:00', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Yokohama / Japanese', priceBand: '€€', role: 'primary' }),
      stop('pool-yokohama-chinatown', 'Yokohama Chinatown', 'sight', 'Explore the compact main streets and choose a dumpling/noodle dinner; allow about two hours and avoid over-ordering before the return train.', 'Yokohama Chinatown', [35.443, 139.646], { startTime: '15:30', durationMinutes: 120 }),
      stop('pool-yokohama-dinner', 'Early dinner · Chinatown', 'food', 'Choose one sit-down meal or a few small bites; dinner here replaces a separate Tokyo dinner tonight.', 'Yokohama Chinatown restaurant', [35.443, 139.646], { startTime: '17:30', durationMinutes: 60, mealContext: 'dinner', cuisine: 'Cantonese / Chinese', priceBand: '€€', role: 'primary' }),
      stop('pool-yokohama-return', 'JR · Yokohama → hotel', 'transit', 'Allow 45–60 minutes door to door and check the live service before leaving Chinatown.', hotel, [35.682, 139.798], { startTime: '18:45', durationMinutes: 55, originQuery: 'Yokohama Chinatown', travelMode: 'train' }),
    ],
  },
  {
    id: 'kawagoe', title: 'Kawagoe historic town day trip', kind: 'outing', area: 'Kawagoe · Saitama', durationLabel: 'about 8–9 hours door to door',
    summary: 'Old merchant-town streets, the bell tower and Kashiya Yokocho candy alley, with a relaxed local lunch. A more traditional, lower-intensity alternative to another Tokyo shopping district.',
    routeNote: 'Allow roughly 50–70 minutes each way from the hotel, including transfers; confirm the best rail station and return route before setting out.',
    sources: [{ label: 'GO TOKYO · Kawagoe', url: 'https://www.gotokyo.org/en/destinations/beyond-tokyo/kawagoe.html' }],
    places: [
      stop('pool-kawagoe-out', 'Rail · hotel → Kawagoe', 'transit', 'Allow 50–70 minutes door to door with station transfers; confirm which Kawagoe-area station is best for your chosen route.', 'Kawagoe Station', [35.908, 139.482], { startTime: '08:30', durationMinutes: 60, originQuery: hotel, travelMode: 'train' }),
      stop('pool-kawagoe-kurazukuri', 'Kurazukuri merchant streets', 'sight', 'Walk the historic warehouse-lined streets at an easy pace; allow about two hours with browsing and photos.', 'Kurazukuri Street Kawagoe', [35.923, 139.483], { startTime: '10:00', durationMinutes: 120 }),
      stop('pool-kawagoe-lunch', 'Lunch · Kawagoe', 'food', 'Choose a local set meal or sweet-potato specialty near the old town; allow a relaxed hour.', 'Kawagoe old town lunch', [35.923, 139.483], { startTime: '12:15', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Kawagoe local food', signature: 'Sweet potato specialties', priceBand: '€€', role: 'primary' }),
      stop('pool-kawagoe-lunch-backup', 'Lunch backup · Kawagoe', 'food', 'Use a nearby café or soba shop if your preferred place is full; keep this meal flexible.', 'Kawagoe old town cafe restaurant', [35.923, 139.483], { mealContext: 'lunch', cuisine: 'Soba / café', role: 'backup', fallback: true }),
      stop('pool-kawagoe-belltower', 'Toki no Kane + Kashiya Yokocho', 'sight', 'See the bell tower and browse the small candy street; allow 60–90 minutes, then leave time to walk back toward the station.', 'Toki no Kane Kawagoe', [35.925, 139.484], { startTime: '13:30', durationMinutes: 90 }),
      stop('pool-kawagoe-return', 'Rail · Kawagoe → hotel', 'transit', 'Allow 50–70 minutes door to door; leave the old town before you are tired rather than chasing one more stop.', hotel, [35.682, 139.798], { startTime: '15:30', durationMinutes: 60, originQuery: 'Kawagoe Station', travelMode: 'train' }),
    ],
  },
  {
    id: 'deep-fukagawa', title: 'Deep Fukagawa neighborhood day', kind: 'outing', area: 'Kiyosumi · Monzen-Nakacho', durationLabel: 'about 7 hours, mostly on foot',
    summary: 'A gentle local-day alternative: Kiyosumi Garden, Fukagawa Fudo-do and its scheduled goma ritual, the Edo Museum, and fukagawa-meshi. No long train ride; easy to shorten if you want a rest day.',
    routeNote: 'Most stops are 10–20 minutes apart on foot from your hotel area. Check the ritual session and museum hours for the exact date before choosing this.',
    sources: [{ label: 'Fukagawa Edo Museum · official visitor information', url: 'https://www.kcf.or.jp/fukagawa/outline/' }],
    places: [
      stop('pool-fukagawa-out', 'Walk · hotel → Kiyosumi Garden', 'transit', 'Allow about 15–20 minutes door to door.', 'Kiyosumi Garden Tokyo', [35.681, 139.799], { startTime: '08:40', durationMinutes: 20, originQuery: hotel, travelMode: 'walk' }),
      stop('pool-fukagawa-garden', 'Kiyosumi Garden', 'sight', 'A quiet strolling garden; allow about an hour and check the current opening time/admission.', 'Kiyosumi Garden Tokyo', [35.681, 139.799], { startTime: '09:00', durationMinutes: 60 }),
      stop('pool-fukagawa-temple-walk', 'Walk · garden → Fukagawa Fudo-do', 'transit', 'Allow about 15 minutes on foot through the neighborhood.', 'Fukagawa Fudo-do Tokyo', [35.671, 139.797], { startTime: '10:00', durationMinutes: 15, originQuery: 'Kiyosumi Garden Tokyo', travelMode: 'walk' }),
      stop('pool-fukagawa-temple', 'Fukagawa Fudo-do grounds', 'sight', 'Visit the temple grounds before the scheduled 11:00 ritual; allow about 30 minutes and confirm access.', 'Fukagawa Fudo-do Tokyo', [35.671, 139.797], { startTime: '10:15', durationMinutes: 30, verification: 'verify-before-trip' }),
      stop('pool-fukagawa-goma', 'Fukagawa Fudo-do · goma ritual', 'sight', 'Target the 11:00 fire ritual only after confirming that session is running; allow about 30 minutes.', 'Fukagawa Fudo-do goma fire ritual', [35.671, 139.797], { startTime: '11:00', durationMinutes: 30, verification: 'verify-before-trip' }),
      stop('pool-fukagawa-museum-walk', 'Walk · temple → Edo Museum', 'transit', 'Allow about 15 minutes on foot; leave after the ritual and arrive before the planned entry.', 'Fukagawa Edo Museum Tokyo', [35.684, 139.8], { startTime: '11:30', durationMinutes: 15, originQuery: 'Fukagawa Fudo-do Tokyo', travelMode: 'walk' }),
      stop('pool-fukagawa-museum', 'Fukagawa Edo Museum', 'sight', 'A detailed indoor reconstruction of Edo-era neighborhood life; allow 75–90 minutes and verify opening days.', 'Fukagawa Edo Museum Tokyo', [35.684, 139.8], { startTime: '11:45', durationMinutes: 90 }),
      stop('pool-fukagawa-lunch', 'Lunch · fukagawa-meshi', 'food', 'Try the local clam-rice specialty near Monzen-Nakacho; check the restaurant’s opening day and lunch service.', 'Monzen Nakacho Fukagawa meshi', [35.676, 139.797], { startTime: '13:30', durationMinutes: 60, mealContext: 'lunch', cuisine: 'Tokyo shitamachi', signature: 'Fukagawa-meshi (clam rice)', priceBand: '€€', role: 'primary', verification: 'verify-before-trip' }),
      stop('pool-fukagawa-lunch-backup', 'Lunch backup · Monzen-Nakacho', 'food', 'Nearby soba or set-meal alternative if the specialty restaurant is closed or full.', 'Monzen Nakacho Tokyo lunch restaurant', [35.672, 139.796], { mealContext: 'lunch', cuisine: 'Soba / Japanese set meal', role: 'backup', fallback: true }),
      stop('pool-fukagawa-return', 'Walk/metro · Monzen-Nakacho → hotel', 'transit', 'Return to the nearby hotel for a rest; allow about 15–20 minutes.', hotel, [35.682, 139.798], { startTime: '14:45', durationMinutes: 20, originQuery: 'Monzen Nakacho Tokyo', travelMode: 'walk' }),
    ],
  },
  {
    id: 'izakaya-evening', title: 'Izakaya evening near the hotel', kind: 'evening', area: 'Monzen-Nakacho · Kiyosumi', durationLabel: 'about 2.5–3 hours',
    summary: 'A low-pressure local evening for yakitori or small plates, with a real nearby return instead of a late cross-city bar hop. Choose a place on the day and check last order.',
    routeNote: 'Monzen-Nakacho is close to your hotel; allow 15–25 minutes each way by walking/metro, depending on the chosen restaurant.',
    sources: [{ label: 'GO TOKYO · Tokyo food and izakaya guide', url: 'https://www.gotokyo.org/en/see-and-do/index.html' }],
    places: [
      stop('pool-izakaya-out', 'Walk/metro · hotel → izakaya area', 'transit', 'Allow 15–25 minutes for the selected local restaurant; pick the exact venue and confirm opening hours.', 'Monzen Nakacho Tokyo izakaya', [35.672, 139.796], { startTime: '18:30', durationMinutes: 20, originQuery: hotel, travelMode: 'walk' }),
      stop('pool-izakaya-dinner', 'Izakaya dinner · Monzen-Nakacho', 'food', 'Allow around two hours for shared plates. Confirm whether reservations, cash or smoking rules apply to the chosen venue.', 'Monzen Nakacho Tokyo izakaya', [35.672, 139.796], { startTime: '19:00', durationMinutes: 120, mealContext: 'dinner', cuisine: 'Izakaya / yakitori', signature: 'Small plates to share', priceBand: '€€', role: 'primary', verification: 'verify-before-trip' }),
      stop('pool-izakaya-return', 'Walk/metro · izakaya → hotel', 'transit', 'Return locally; allow 15–25 minutes and check the final train only if using the metro.', hotel, [35.682, 139.798], { startTime: '21:00', durationMinutes: 20, originQuery: 'Monzen Nakacho Tokyo izakaya', travelMode: 'walk' }),
    ],
  },
];

export const tokyoPoolActivities = tokyoPool;
export const tokyoFlexibleDays = [
  { id: '2026-11-04', label: 'Wed 4 Nov · first flex day' },
  { id: '2026-11-07', label: 'Sat 7 Nov · flex day' },
  { id: '2026-11-08', label: 'Sun 8 Nov · flex day' },
];
