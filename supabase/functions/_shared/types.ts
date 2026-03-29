/** Row shape for the `alerts` table */
export interface AlertRow {
  id: string;
  event: string;
  severity: string | null;
  urgency: string | null;
  headline: string | null;
  description: string | null;
  instruction: string | null;
  area_desc: string | null;
  geometry: Record<string, unknown> | null;
  onset: string | null;
  expires: string | null;
  updated_at?: string;
}

/** Row shape for the `shelters` table */
export interface ShelterRow {
  id: string;
  name: string;
  type: string;
  source: string;
  address: string | null;
  lat: number;
  lng: number;
  capacity: number | null;
  is_open: boolean;
  hours: Record<string, string> | null;
  phone: string | null;
  amenities: string[];
  last_verified: string | null;
  updated_at?: string;
}

/** Row shape for the `storm_reports` table */
export interface StormReportRow {
  id: string;
  event_type: string;
  magnitude: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  county: string | null;
  reported_at: string | null;
  source: string | null;
  remark: string | null;
  updated_at?: string;
}

/** Row shape for the `hwo_products` table */
export interface HwoProductRow {
  id: string;
  wfo: string;
  product_text: string | null;
  issued_at: string | null;
  updated_at?: string;
}
