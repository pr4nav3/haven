-- RPC: find nearest open shelters by lat/lng
CREATE OR REPLACE FUNCTION nearest_shelters(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  type TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  amenities TEXT[],
  hours JSONB,
  distance_mi DOUBLE PRECISION
) AS $$
  SELECT
    s.id, s.name, s.type, s.address, s.lat, s.lng, s.phone, s.amenities, s.hours,
    -- Distance in miles (ST_Distance returns meters for geography)
    ST_Distance(
      ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1609.344 AS distance_mi
  FROM shelters s
  WHERE s.is_open = TRUE
  ORDER BY
    ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326) <->
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
