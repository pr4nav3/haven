# CrisisConcierge v2 — Technical Plan

## Project Vision

**"I'm caught outside in dangerous weather in Wisconsin — what's the nearest safe place I can reach right now, and how do I get there?"**

A map-first, mobile-friendly web app that combines real-time weather hazards with shelter/safe-place data to help people in Wisconsin find safety during storms, extreme cold, extreme heat, and flooding. Unlike FEMA (which only shows declared-disaster shelters) or Google Maps (which lacks weather overlay + shelter context), CrisisConcierge aggregates *all* types of safe places — from official FEMA shelters to libraries, warming centers, and 24-hour businesses — and cross-references them with active hazard data.

---

## Architecture Overview

**Single-platform approach: Supabase handles everything the backend needs.**

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Postgres │  │ Edge         │  │ pg_cron               │  │
│  │ + pgvector│  │ Functions    │  │ (scheduled ingestion) │  │
│  │          │  │ (Deno)       │  │                       │  │
│  └──────────┘  └──────────────┘  └───────────────────────┘  │
│  ┌──────────┐  ┌──────────────┐                             │
│  │ Auth     │  │ Realtime     │                             │
│  │          │  │ (alerts)     │                             │
│  └──────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  Next.js 15     │  │  Twilio         │
│  Frontend       │  │  (SMS "HELP")   │
│  (Vercel free)  │  │                 │
│  + Mapbox GL JS │  │                 │
└─────────────────┘  └─────────────────┘
```

---

## Free Tier Budget

| Service            | Free Tier Allowance                          | Our Estimated Usage            | Fits? |
|--------------------|----------------------------------------------|--------------------------------|-------|
| **Supabase**       | 500 MB DB, 500K edge fn invocations/mo,      | ~50 MB DB, ~5K invocations/mo  | ✅    |
|                    | 5 GB egress, 50K auth MAUs                   | <1 GB egress, <100 MAUs        |       |
| **Vercel**         | 100 GB bandwidth, 1M fn invocations/mo,      | ~5 GB bandwidth/mo             | ✅    |
|                    | 6,000 build min/mo                           | ~200 builds/mo                 |       |
| **Mapbox**         | 50,000 map loads/mo, 100K geocoding req/mo   | ~2K map loads/mo (early)       | ✅    |
| **Twilio**         | $15.50 free trial credit, then pay-as-you-go | ~$3-5/mo after trial           | ⚠️    |
| **NWS/FEMA APIs**  | Unlimited, free, no API key required          | ~2K requests/day               | ✅    |
| **IEM APIs**       | Free, public                                 | ~500 requests/day              | ✅    |

**Twilio is the only ongoing cost** — roughly $1-2/mo for a phone number + ~$0.01 per SMS exchange. At low volume this is negligible. Everything else stays within free tiers.

**Key risk — Supabase free tier pausing:** Free projects pause after 7 days of inactivity. Mitigations:
- The pg_cron ingestion job itself counts as activity (runs every 30 min)
- Frontend traffic from any user keeps it alive
- Backup: a free UptimeRobot ping every 5 minutes to the Supabase REST endpoint

---

## Data Sources & Ingestion

### Ingestion Architecture

pg_cron (inside Postgres) fires every 30 minutes → triggers a Supabase Edge Function via pg_net HTTP POST → Edge Function fetches external APIs → upserts data to Postgres tables → prunes stale records.

Each data source gets its own Edge Function for isolation and to stay within the 150-second timeout.

### Data Sources (Priority Order)

**Tier 1 — Core (build these first)**

| Source | What It Provides | API | Refresh Rate |
|--------|-----------------|-----|--------------|
| NWS Weather Alerts | Active warnings/watches for WI (tornado, winter storm, flood, heat, etc.) | api.weather.gov/alerts?area=WI | Every 5 min |
| FEMA Shelters | Open emergency shelters (ArcGIS) | gis.fema.gov/arcgis/rest/services | Every 30 min |
| Google Places API* | Libraries, community centers, churches, hospitals near a location | Mapbox/Google Places | On-demand |

*For "always-open" shelter locations (libraries, community centers, etc.), we pre-seed a static dataset for Wisconsin's major municipalities and refresh it infrequently. This doesn't need real-time ingestion — these places don't change often.

**Tier 2 — Enrichment (build after MVP)**

| Source | What It Provides | API | Refresh Rate |
|--------|-----------------|-----|--------------|
| IEM Local Storm Reports | Confirmed tornadoes, hail, wind damage | mesonet.agron.iastate.edu | Every 15 min |
| Hazardous Weather Outlook | Multi-day text forecasts by WFO | mesonet.agron.iastate.edu | Every 60 min |
| 211 Wisconsin | Warming/cooling centers, shelters, human services | 211 NDP Search API (requires registration) | Every 60 min |
| WI 511 Road Closures | Closed/restricted roads (for routing) | 511wi.gov API (dev key required) | Every 15 min |

**Tier 3 — Future/Optional**

| Source | What It Provides | Notes |
|--------|-----------------|-------|
| USGS Stream Gauges | River levels for flood context | Was in v1 but slow; defer |
| NOAA Water Prediction | Flood forecast gauges | Same — defer |
| Community-sourced data | User-reported shelter status | Requires auth + moderation |

### Database Schema (Fresh Start)

```sql
-- Active weather alerts from NWS
CREATE TABLE alerts (
  id TEXT PRIMARY KEY,              -- NWS alert ID
  event TEXT NOT NULL,              -- "Winter Storm Warning", "Tornado Watch", etc.
  severity TEXT,                    -- "Extreme", "Severe", "Moderate", "Minor"
  urgency TEXT,                     -- "Immediate", "Expected", "Future"
  headline TEXT,
  description TEXT,
  instruction TEXT,
  area_desc TEXT,                   -- affected counties/zones
  geometry JSONB,                   -- GeoJSON polygon for map overlay
  onset TIMESTAMPTZ,
  expires TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe places (all types)
CREATE TABLE shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,               -- 'fema', 'warming_center', 'cooling_center',
                                    -- 'library', 'community_center', 'hospital',
                                    -- 'fire_station', 'church', '24hr_business'
  source TEXT NOT NULL,             -- 'fema_arcgis', 'places_seed', '211', 'manual'
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity INTEGER,
  is_open BOOLEAN DEFAULT TRUE,
  hours JSONB,                      -- { "mon": "9-5", "tue": "9-5", ... }
  phone TEXT,
  amenities TEXT[],                 -- ['restrooms', 'water', 'food', 'wifi', 'pets_ok']
  last_verified TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storm reports (confirmed events)
CREATE TABLE storm_reports (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,         -- 'tornado', 'hail', 'wind', 'flood', 'snow'
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
  wfo TEXT NOT NULL,                -- forecast office code
  product_text TEXT,
  issued_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: RAG documents for AI chat (secondary feature)
CREATE TABLE rag_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),           -- pgvector, only if AI feature enabled
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for shelter proximity queries
CREATE INDEX idx_shelters_location ON shelters USING gist (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
```

### Edge Function Structure

```
supabase/functions/
├── ingest-nws-alerts/index.ts     # Fetch NWS alerts for WI
├── ingest-fema-shelters/index.ts  # Fetch FEMA open shelters
├── ingest-storm-reports/index.ts  # Fetch IEM local storm reports
├── ingest-hwo/index.ts            # Fetch hazardous weather outlook
├── sms-handler/index.ts           # Twilio webhook for "HELP" texts
├── nearest-shelter/index.ts       # Given lat/lng, return nearest shelters
└── _shared/                       # Shared types, Supabase client setup
    ├── supabase.ts
    └── types.ts
```

Each ingestion function:
1. Fetches the external API
2. Parses the response
3. Upserts rows into Postgres
4. Deletes expired/stale records
5. Returns a summary (for cron job logging)

### pg_cron Schedule

```sql
-- Set up via Supabase SQL Editor after deploying Edge Functions

-- NWS Alerts: every 5 minutes
SELECT cron.schedule('ingest-nws', '*/5 * * * *', $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/ingest-nws-alerts',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  )
$$);

-- FEMA Shelters: every 30 minutes
SELECT cron.schedule('ingest-fema', '*/30 * * * *', $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/ingest-fema-shelters',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  )
$$);

-- Storm Reports: every 15 minutes
SELECT cron.schedule('ingest-lsr', '*/15 * * * *', $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/ingest-storm-reports',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  )
$$);

-- HWO: every 60 minutes
SELECT cron.schedule('ingest-hwo', '0 * * * *', $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/ingest-hwo',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  )
$$);

-- Cleanup old cron run details (prevent table bloat)
SELECT cron.schedule('cleanup-cron-history', '0 3 * * *', $$
  DELETE FROM cron.job_run_details WHERE end_time < NOW() - INTERVAL '7 days'
$$);
```

---

## SMS "HELP" Feature

### Flow

```
User texts "HELP" to Twilio number
         │
         ▼
Twilio webhook POST → Supabase Edge Function (sms-handler)
         │
         ├─ Parse incoming message
         ├─ If "HELP" or "HELP 53703" (with ZIP):
         │    ├─ Geocode ZIP to lat/lng (or use carrier location hint)
         │    ├─ Query shelters table: nearest 3 open shelters
         │    ├─ Query alerts table: any active alerts for that area
         │    └─ Reply via Twilio SMS:
         │         "⚠️ WINTER STORM WARNING active in Dane County.
         │          Nearest shelters:
         │          1. Madison Public Library (0.3 mi) - Open until 9pm
         │             📍 maps.google.com/?q=43.07,-89.40
         │          2. Salvation Army (0.8 mi) - Open 24hr
         │             📍 maps.google.com/?q=43.06,-89.39
         │          Text HELP <ZIP> anytime for updated info."
         │
         └─ If unrecognized: reply with usage instructions
```

### Twilio Setup

- 1 toll-free number: ~$2.15/mo
- SMS cost: ~$0.0083/msg sent + ~$0.0083/msg received + carrier fees (~$0.003-0.006)
- Total per exchange (receive HELP + send response): ~$0.02-0.03
- A2P 10DLC registration required for production (free for starter tier, allows 3K msgs/day)

### Implementation

The SMS handler is a Supabase Edge Function that:
1. Receives the Twilio webhook POST (with `From`, `Body`, `FromZip` fields)
2. Parses the ZIP code from the message body or falls back to `FromZip`
3. Runs a Postgres function to find nearest shelters within 25 miles
4. Formats a concise SMS response with Google Maps links
5. Returns TwiML XML to Twilio

---

## Frontend

### Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- **Mapbox GL JS** for the map (50K free map loads/mo)
- **Supabase JS client** for data fetching + realtime subscriptions
- **Deployed on Vercel** (free Hobby tier)

### Pages & Features

```
app/
├── page.tsx                    # Main map view (landing page)
├── alerts/page.tsx             # List view of active alerts
├── shelters/[id]/page.tsx      # Shelter detail page
├── about/page.tsx              # About + how to use SMS
├── api/
│   └── nearest/route.ts        # API route: nearest shelters by lat/lng
└── components/
    ├── Map.tsx                  # Mapbox GL JS wrapper
    ├── AlertBanner.tsx          # Top banner showing active alerts
    ├── ShelterCard.tsx          # Shelter info card
    ├── ShelterList.tsx          # Sidebar list of nearby shelters
    ├── FilterBar.tsx            # Filter by shelter type, open now, etc.
    ├── HazardLayer.tsx          # Alert polygon overlay on map
    ├── FindShelterButton.tsx    # One-tap "find nearest safe place"
    └── WeatherPanel.tsx         # Current conditions summary
```

### Core UX Flow

1. **User lands on the app** → full-screen map centered on their location (or Madison, WI default)
2. **Alert banner** at top shows any active NWS alerts for their area (color-coded by severity)
3. **Shelter pins** on the map, color-coded by type (FEMA = red, library = blue, warming center = orange, etc.)
4. **Tap a pin** → slide-up card with name, address, hours, distance, amenities, "Navigate" button (opens Google/Apple Maps)
5. **"Find Nearest Shelter" button** (prominent, always visible) → zooms to closest open shelter, shows route
6. **Filter sidebar** → filter by type, "open now" toggle, accessibility, pets allowed
7. **Alert tap** → shows alert detail with affected area highlighted on map

### Map Layers

| Layer | Source | Style |
|-------|--------|-------|
| Weather alert polygons | alerts table (GeoJSON) | Semi-transparent fill, color by severity |
| Shelter markers | shelters table | Categorized icons by type |
| Storm reports | storm_reports table | Small circles, color by event type |
| User location | Browser Geolocation API | Blue pulsing dot |

### Realtime Updates

Use Supabase Realtime to subscribe to changes on the `alerts` table. When a new alert is inserted or an existing one expires, the map and banner update automatically without page refresh.

```typescript
const channel = supabase
  .channel('alerts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' },
    (payload) => {
      // Update map layers and alert banner
    }
  )
  .subscribe()
```

---

## LLM / RAG (Secondary Feature — Phase 2)

**Not in MVP.** The AI chat feature is deferred to Phase 2. When implemented:

- Keep the pgvector extension and `rag_docs` table
- Use OpenAI `text-embedding-3-small` for embeddings (cheapest option)
- Store embeddings only for HWO text products and alert descriptions
- Expose as a "Ask about conditions" chat panel (not the main interface)
- Set `SKIP_EMBEDDINGS=true` by default; enable per-environment
- Consider switching to a free embedding model (e.g., Supabase's built-in `gte-small` if available)

---

## Development Phases

### Phase 1 — Foundation (Weeks 1-2)
- [ ] Create fresh Supabase project
- [ ] Set up database schema (tables, indexes, RLS policies)
- [ ] Enable pg_cron and pg_net extensions
- [ ] Write + deploy Edge Functions: `ingest-nws-alerts`, `ingest-fema-shelters`
- [ ] Set up pg_cron schedules for Tier 1 sources
- [ ] Verify data is flowing into tables
- [ ] Seed Wisconsin shelters table with static data (libraries, community centers)

### Phase 2 — Frontend MVP (Weeks 3-4)
- [ ] Initialize Next.js 15 project with Tailwind + TypeScript
- [ ] Integrate Mapbox GL JS with shelter markers + alert polygons
- [ ] Build AlertBanner, ShelterCard, FilterBar components
- [ ] Implement "Find Nearest Shelter" with geolocation
- [ ] Connect Supabase Realtime for live alert updates
- [ ] Deploy to Vercel

### Phase 3 — SMS + Enrichment (Weeks 5-6)
- [ ] Set up Twilio account + phone number
- [ ] Write `sms-handler` Edge Function
- [ ] Register A2P 10DLC for SMS compliance
- [ ] Deploy Tier 2 ingestion: storm reports, HWO, 211 data
- [ ] Add storm report markers to the map
- [ ] Add "About" page with SMS instructions

### Phase 4 — Polish + AI (Weeks 7-8)
- [ ] Add 511 road closure data (route safety context)
- [ ] Implement RAG chat as secondary feature
- [ ] Add offline/PWA support (cache shelter data for no-connectivity use)
- [ ] Performance optimization, accessibility audit
- [ ] User testing with Wisconsin residents

---

## What We're Carrying Forward from v1

These aren't copy-pasteable (Node/Lambda → Deno/Edge Functions), but the logic transfers:

| v1 Adapter | Reusable Logic |
|------------|---------------|
| nws.ts | API URL structure, alert field mapping, severity parsing |
| shelters.ts | FEMA ArcGIS query format, shelter field mapping |
| hwo.ts | IEM URL pattern, WFO list for Wisconsin, text parsing |
| iem-lsr.ts | GeoJSON endpoint URL, storm report type mapping |
| rag.ts | Embedding approach, vector similarity query pattern |
| types.ts | TypeScript interfaces (adapted for new schema) |

**What we're NOT carrying forward:**
- AWS Lambda handler + esbuild pipeline (replaced by Supabase Edge Functions)
- Fastify server (replaced by Supabase REST + Edge Functions)
- Node.js runtime code (rewriting for Deno)
- The commented-out adapters (USGS, NWPS, 511) — deferred to later phases

---

## Key Decisions & Tradeoffs

1. **Supabase-only backend vs. multi-service**: Simpler, cheaper, one dashboard. Tradeoff: tied to Supabase's free tier limits and Deno runtime.

2. **Mapbox over Google Maps**: More generous free tier (50K loads vs. Google's $200 credit which is ~28K loads). Better customization for dark/crisis themes. Tradeoff: less familiar to some users.

3. **Static shelter seeding over real-time Places API**: Libraries, community centers, and fire stations don't change locations. Seeding once and verifying quarterly is cheaper and more reliable than live API calls. Tradeoff: data can go stale (hours change, places close).

4. **Twilio over free alternatives**: WhatsApp Business API is cheaper but less universal. SMS works on every phone without internet. Tradeoff: only ongoing cost (~$3-5/mo).

5. **LLM as Phase 2**: Keeps MVP focused, eliminates OpenAI dependency for launch, avoids "GPT wrapper" perception. Tradeoff: no natural-language Q&A at launch.

---

## Open Questions

- **211 API access**: Requires registration with the 211 National Data Platform. Need to apply and get API keys. Fallback: scrape 211wisconsin.communityos.org or manually curate WI warming center data.
- **Shelter verification**: How do we confirm a library/community center is actually open during an emergency? Possible: cross-reference with active NWS alert + known operating hours.
- **PWA / offline**: Critical for disaster scenarios where connectivity is lost. Service worker caching of shelter locations is high priority.
- **Scaling beyond WI**: The architecture is state-agnostic — NWS, FEMA, and 211 all work nationally. But the shelter seed data would need per-state curation.
