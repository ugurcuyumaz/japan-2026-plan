export type ItemType = 'sight' | 'food' | 'optional' | 'transit' | 'stay' | 'booking' | 'note';
export type BookingState = 'not-needed' | 'research' | 'recommended' | 'required' | 'booked';
export type Verification = 'confirmed' | 'verify-before-trip' | 'research';
export type MealContext = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drinks';

export interface Place {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  coordinates?: [latitude: number, longitude: number];
  mapsQuery: string;
  bookingState?: BookingState;
  bookingNote?: string;
  cuisine?: string;
  signature?: string;
  mealContext?: MealContext;
  priceBand?: '€' | '€€' | '€€€';
  fallback?: boolean;
  estimatedCostJPY?: number;
  sourceDocument?: string;
  verification: Verification;
  role?: 'primary' | 'backup';
  travelMode?: 'walk' | 'train' | 'bus' | 'taxi' | 'flight' | 'ferry';
  travelNote?: string;
}

export interface TripDay {
  id: string;
  date: string;
  weekday: string;
  base: string;
  title: string;
  summary: string;
  region: 'north' | 'tokyo';
  keyDay: boolean;
  pacing: 'light' | 'balanced' | 'full';
  tags: string[];
  seasonNote: string;
  tiredPlan?: string;
  rainPlan?: string;
  dailyEstimateJPY?: { low: number; high: number };
  places: Place[];
}

export interface Stay {
  id: string;
  city: string;
  dates: string;
  nights: number;
  property: string;
  status: BookingState;
  privateBath?: boolean;
  note: string;
  coordinates: [number, number];
  costEUR?: number;
  includedInTripNights?: boolean;
  conflict?: boolean;
}

export interface Booking {
  id: string;
  item: string;
  date: string;
  priority: 'required' | 'recommended' | 'research';
  status: 'unbooked' | 'booked' | 'verify';
  deadline: string;
  estimatedCostJPY?: number;
  destination: string;
  mapsQuery?: string;
  notes: string;
  dayId?: string;
}

export interface BudgetCategory {
  id: string;
  label: string;
  low: number;
  centre: number;
  high: number;
  confirmed: number;
  note?: string;
}

export interface OpenItem {
  id: string;
  label: string;
  kind: 'booking' | 'stay' | 'food' | 'transport' | 'practical';
  priority: 'high' | 'medium' | 'low';
  relatedDate?: string;
  relatedId?: string;
  action: string;
}
