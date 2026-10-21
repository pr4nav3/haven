-- Location-aware RPCs for the frontend and SMS handler.

-- 1. nearest_shelters v2: optional type filter and distance cap.
--    Signature change: the old 3-arg form is replaced; callers pass named args.
DROP FUNCTION IF EXISTS nearest_shelters(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);

CREATE OR REPLACE FUNCTION nearest_shelters(
  p_lat    DOUBLE PRECISION,
  p_lng    DOUBLE PRECISION,
  p_limit  INTEGER DEFAULT 5,
  p_types  TEXT[]  DEFAULT NULL,   -- e.g. ARRAY['fema','library']; NULL = any
  p_max_mi DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
  id          TEXT,
  name        TEXT,
  type        TEXT,
  source      TEXT,
  address     TEXT,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  phone       TEXT,
  amenities   TEXT[],
  hours       JSONB,
  distance_mi DOUBLE PRECISION
) AS $$
  SELECT
    s.id, s.name, s.type, s.source, s.address, s.lat, s.lng, s.phone, s.amenities, s.hours,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1609.344 AS distance_mi
  FROM shelters s
  WHERE s.is_open = TRUE
    AND (p_types IS NULL OR s.type = ANY(p_types))
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_max_mi * 1609.344
    )
  ORDER BY
    ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326) <->
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- 2. alerts_at_point: active alerts whose polygon contains the point.
--    Alerts with no geometry (zone-based) are included when p_include_zone_alerts
--    is true, since we cannot yet resolve the user's zone; the client can show
--    them with lower prominence.
CREATE OR REPLACE FUNCTION alerts_at_point(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_include_zone_alerts BOOLEAN DEFAULT FALSE
)
RETURNS SETOF alerts AS $$
  SELECT a.*
  FROM alerts a
  WHERE (a.expires IS NULL OR a.expires > NOW())
    AND (
      (a.geometry IS NOT NULL
        AND ST_Contains(
          ST_SetSRID(ST_GeomFromGeoJSON(a.geometry::text), 4326),
          ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
        ))
      OR (p_include_zone_alerts AND a.geometry IS NULL)
    )
  ORDER BY
    CASE a.severity
      WHEN 'Extreme' THEN 0 WHEN 'Severe' THEN 1
      WHEN 'Moderate' THEN 2 WHEN 'Minor' THEN 3 ELSE 4
    END,
    a.expires ASC;
$$ LANGUAGE sql STABLE;

-- Expression index so ST_Contains does not re-parse every alert polygon.
CREATE INDEX IF NOT EXISTS idx_alerts_geom
  ON alerts USING gist (
    (ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326))
  )
  WHERE geometry IS NOT NULL;
