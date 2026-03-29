-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Active weather alerts from NWS
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  severity TEXT,
  urgency TEXT,
  headline TEXT,
  description TEXT,
  instruction TEXT,
  area_desc TEXT,
  geometry JSONB,
  onset TIMESTAMPTZ,
  expires TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe places (all types)
-- id is source-prefixed: "fema:12345", "seed:madison-central-library", etc.
CREATE TABLE shelters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity INTEGER,
  is_open BOOLEAN DEFAULT TRUE,
  hours JSONB,
  phone TEXT,
  amenities TEXT[],
  last_verified TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storm reports (confirmed events)
CREATE TABLE storm_reports (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  magnitude TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city TEXT,
  county TEXT,
  reported_at TIMESTAMPTZ,
  source TEXT,
  remark TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hazardous Weather Outlook text products
CREATE TABLE hwo_products (
  id TEXT PRIMARY KEY,
  wfo TEXT NOT NULL,
  product_text TEXT,
  issued_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for shelter proximity queries
CREATE INDEX idx_shelters_location ON shelters USING gist (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);

-- Index for alert expiry lookups
CREATE INDEX idx_alerts_expires ON alerts (expires);

-- Index for storm reports by time
CREATE INDEX idx_storm_reports_reported ON storm_reports (reported_at);

-- Auto-delete expired alerts (cleanup function)
CREATE OR REPLACE FUNCTION prune_expired_alerts() RETURNS void AS $$
  DELETE FROM alerts WHERE expires < NOW() - INTERVAL '1 hour';
$$ LANGUAGE sql;

-- Prune storm reports older than 7 days
CREATE OR REPLACE FUNCTION prune_old_storm_reports() RETURNS void AS $$
  DELETE FROM storm_reports WHERE reported_at < NOW() - INTERVAL '7 days';
$$ LANGUAGE sql;

-- Prune HWO products older than 7 days
CREATE OR REPLACE FUNCTION prune_old_hwo() RETURNS void AS $$
  DELETE FROM hwo_products WHERE issued_at < NOW() - INTERVAL '7 days';
$$ LANGUAGE sql;
