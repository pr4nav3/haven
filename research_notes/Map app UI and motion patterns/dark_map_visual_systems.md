# Dark-Mode Map Visual Systems: Palettes, Roads, Routes, Markers, Typography, Glass Overlays

Research date: 2026-10-21. Scope: concrete, developer-applicable values for a premium minimalist dark map on MapLibre/Mapbox plus HTML overlays. Keyless/free basemaps prioritized; Mapbox documented as the premium option.

Method note: wherever possible, values below were pulled directly from the public style JSON / source (CARTO Dark Matter, OpenFreeMap `dark`, Stadia Alidade Smooth Dark, Protomaps `dark`/`black`/`grayscale` flavors, Google's night-mode style array). Mapbox Dark v11 and Mapbox Standard "night" JSON is token-gated and could not be fetched; Uber's and Apple's map styles are closed and no primary design docs with color values were found. Those are flagged as gaps rather than guessed.

---

## Key Question 1: Exact or close hex values and layer treatments of the top dark map styles, and which is closest to the "Uber at night" look

### Takeaway
Four fully-inspectable free dark styles exist with public JSON: CARTO Dark Matter (near-black `#0e0e0e` land, slate-blue `#2C353C` water, blue-gray roads), OpenFreeMap `dark` (`rgb(12,12,12)` land, roads that are *darker* than the casing, near-monochrome), Stadia Alidade Smooth Dark (lighter `hsl(0,0%,20%)` land, `#222` water, faint tinted parks), and Protomaps `dark`/`black` flavors (`#1f1f1f`/`#141414` earth, `#31353f`/`#333333` water, gray road ramp `#333 -> #3d3d3d -> #474747`). Of these, Protomaps `dark` (slightly warm-neutral grays, visible road hierarchy, muted blue-gray water) and CARTO Dark Matter (blue-gray roads on near-black) are the closest "Uber at night" analogues; OpenFreeMap `dark` is the most austere/minimal. No primary source with Uber's actual map hex values was found.

### Cited Findings

**CARTO Dark Matter (free, no key for the GL style; vector tiles via CARTO basemaps)**
- Background `#0e0e0e`; landcover (wood/grass/recreation) and parks are the *same* `#0e0e0e` (parks are effectively invisible; nature reserves at opacity 0.7 at z6 to 0.9 at z9); water `#2C353C`; waterway lines `rgba(63,90,109,1)` width 0.5 at z8, 1 at z9, 2 at z15, 3 at z16; buildings transparent until z15.5, then `building-top` fill `rgba(57,57,57,1)` with outline `#0e0e0e`, opacity 0 at z13 to 1 at z16 — [CARTO basemap-styles dark-matter.json](https://raw.githubusercontent.com/CartoDB/basemap-styles/master/mapboxgl/dark-matter.json)
- Motorway fill `rgba(73,73,73,1)`, width z10:1, z12:2, z13:3, z14:5, z15:7, z16:9, z17:11, z18:20; motorway casing `#1a1a1a` at z5 to `#232323` at z12, width z6:0.5, z11:3, z13:5, z15:9, z18:22. Primary fill `rgba(83,86,102,1)` (blue-gray), width z10:0.3, z13:2, z14:4, z15:6, z16:8, z17:12, z18:16; casing `#1a1a1a`/`#232323`. Minor fill `rgba(65,71,88,1)`, width z15:3, z16:4, z17:8, z18:12 — [CARTO dark-matter.json](https://raw.githubusercontent.com/CartoDB/basemap-styles/master/mapboxgl/dark-matter.json)
- Labels: Montserrat (Regular/Medium/Italic) with Open Sans / Noto Sans fallbacks. City labels `rgba(211,228,236,1)` with halo `#222` width 1, size z8:14 to z14:22; towns `rgba(204,208,228,1)`; primary road names `rgba(189,189,189,1)` halo `#111`, size z14:10, z16:11, z18:12; minor road names `rgba(181,180,180,1)`; sea names deliberately dim `#3c3c3c`; country labels fade from `rgba(157,157,157,1)` at z3 to `rgba(112,112,112,1)` at z6 — [CARTO dark-matter.json](https://raw.githubusercontent.com/CartoDB/basemap-styles/master/mapboxgl/dark-matter.json)

**OpenFreeMap `dark` (fully keyless, public style URL `https://tiles.openfreemap.org/styles/dark`)**
- Background `rgb(12,12,12)`; water fill and waterway `rgb(27,27,29)`; `landuse_park` `rgb(32,32,32)`; buildings from z12: fill `rgb(10,10,10)` with outline `rgb(27,27,29)` (buildings are darker than land, an "etched" look) — [OpenFreeMap dark style](https://tiles.openfreemap.org/styles/dark)
- Roads are an inverted treatment: motorway casing `rgba(60,60,60,0.8)` (width exponential base 1.4: z5.8:0, z6:3, z20:40) with motorway inner `#000` from z6 (width z4:2, z6:1.3, z20:30). Major road casing `rgba(60,60,60,0.8)` (base 1.3: z10:3, z20:23), inner `hsl(0,0%,7%)` (z10:2, z20:20). Minor roads `#181818` opacity 0.9 (base 1.55: z13:1.8, z20:20). Paths `rgb(27,27,29)` dashed [1.5,1.5] — [OpenFreeMap dark style](https://tiles.openfreemap.org/styles/dark)
- Labels: Noto Sans Regular, uppercase, place labels `rgb(101,101,101)` with halo `rgba(0,0,0,0.7)` width 1, blur 1; city large 14px, others 10px; motorway refs `hsl(0,0%,37%)`; other road names `rgba(80,78,78,1)` halo black; boundaries `hsl(0,0%,21%)` dashed [2,2] (state) and `hsl(0,0%,23%)` (country); rail `rgb(35,35,35)` with `rgb(12,12,12)` dashes — [OpenFreeMap dark style](https://tiles.openfreemap.org/styles/dark)

**Stadia Alidade Smooth Dark (free tier with key for hosted; style JSON publicly readable)**
- Background `hsl(0,0%,20%)` (`#333`) — notably lighter than the near-black styles; water and waterways `#222`; parks `hsla(109,41%,55%,8%)` and `landcover_park` `hsla(120,23%,55%,8%)` (very faint green tint, opacity 0 at z8 to 0.8 at z12); wood `hsla(120,23%,59%,10%)`; residential `hsla(60,8%,22%,20%)`; buildings from z12 fill `hsl(95,5%,22%)` outline `hsla(0,0%,40%,50%)` — [Stadia alidade_smooth_dark.json](https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json)
- Roads: motorway inner `hsla(60,1%,16%,90%)` (base 1.4: z4:2, z6:1.3, z20:25), casing `hsla(0,0%,30%,80%)` (z5.8:0, z6:3, z20:30); major inner `hsla(60,1%,16%,90%)` (base 1.3: z10:2, z20:18), casing `hsla(0,0%,30%,80%)` (z10:3, z20:20); minor `hsl(0,0%,32%)` at z13 to `hsl(0,0%,30%)` at z16 (base 1.55: z13:1, z18:8), opacity 0.9, no casing — [Stadia alidade_smooth_dark.json](https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json)
- Labels use a custom "Stadia" font family (Regular/Semibold/Bold/Italic). Major road names `#ccc` 13px uppercase, halo `hsl(0,0%,20%)` width 2; other roads `#aaa` 12px; cities `#9aa2ac` (cool gray) halo width 1; countries `#d4d4dc` to `#c4c4c4` Semibold uppercase halo `hsl(0,0%,15%)` width 1.4; POIs `#aaa` halo `#333`; water names `#999` Stadia Italic — [Stadia alidade_smooth_dark.json](https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json)

**Protomaps basemaps `dark` flavor (free with Protomaps API key or self-hosted PMTiles; open source, generated from a `Flavor` object)**
- Full `dark` flavor: background `#34373d`, earth `#1f1f1f`, park_a `#1c2421`, park_b `#192a24`, wood `#202121`, water `#31353f`, buildings `#111111`, pedestrian `#1e1e1e`, runway/pier `#333333`, hospital `#252424`, industrial `#222222` — [protomaps/basemaps flavors.ts](https://raw.githubusercontent.com/protomaps/basemaps/main/styles/src/flavors.ts)
- `dark` roads: other/minor_service/minor_b `#333333`; minor_a/link/major `#3d3d3d`; highway `#474747`; all casings `#1f1f1f` (same as earth, i.e. casing = gap-to-land); tunnels `#292929` with `#141414` casing; railway `#000000`; boundaries `#5b6374` (muted blue-gray) — [protomaps/basemaps flavors.ts](https://raw.githubusercontent.com/protomaps/basemaps/main/styles/src/flavors.ts)
- `dark` labels: minor road labels `#525252` halo `#1f1f1f`; major road labels `#666666`; city `#7a7a7a` halo `#212121`; subplace `#525252`; state `#3d3d3d`; country `#5c5c5c`; ocean `#717784`. POI accent set (used for icon/label tints): blue `#4299BB`, green `#30C573`, lapis `#2B5CEA`, pink `#EF56BA`, red `#F2567A`, slategray `#93939F`, tangerine `#F19B6E`, turquoise `#00C3D4`. Landcover: forest `rgba(28,41,37,1)`, grassland `rgba(30,41,31,1)`, urban `rgba(28,28,28,1)`, farmland `rgba(31,36,32,1)`, scrub `rgba(34,36,30,1)` — [protomaps/basemaps flavors.ts](https://raw.githubusercontent.com/protomaps/basemaps/main/styles/src/flavors.ts)
- `black` flavor (data-viz, flatter): background `#2b2b2b`, earth `#141414`, water `#333333`, buildings `#0a0a0a`, parks `#181818`, other roads `#1f1f1f`, major/highway `#292929`, casings `#141414`, boundaries `#707070`, city label `#999999`, country `#707070`, road labels `#525252`/`#5c5c5c` halo `#141414` — [protomaps/basemaps flavors.ts](https://raw.githubusercontent.com/protomaps/basemaps/main/styles/src/flavors.ts)
- Protomaps ships five flavors (light, dark, white, grayscale, black); white/grayscale/black are "intended for data visualization," light/dark are general-purpose with POI icons; each flavor has a pre-rendered spritesheet — [Protomaps themes docs](https://docs.protomaps.com/basemaps/themes)

**Google Maps (reference night palette, and the modern dark scheme)**
- Google's canonical "Night Mode" styled-map array: base geometry `#242f3e`; label stroke `#242f3e`; label fill `#746855`; locality labels `#d59563`; POI labels `#d59563`; parks `#263c3f` with labels `#6b9a76`; roads `#38414e` with stroke `#212a37` and labels `#9ca5b3`; highways `#746855` with stroke `#1f2835` and labels `#f3d19c`; transit `#2f3948`; water `#17263c` with labels `#515c6d` — [Google Maps JS night-mode example](https://developers.google.com/maps/documentation/javascript/examples/style-array)
- Modern JS API: `colorScheme: ColorScheme.DARK` (or `FOLLOW_SYSTEM`), set only at map creation, roadmap/terrain only; custom Map-ID styling applies only to the light scheme — [Google Map color scheme docs](https://developers.google.com/maps/documentation/javascript/mapcolorscheme)
- Google's 2023 palette shift moved roads from tan to grays, freeways to darker gray with blue undertones, parks to lighter mint; former Google Maps designer Elizabeth Laraki criticized it as colder and "computer generated," and a commenter noted active vs alternate routes looked too similar in night mode — [Map Room Blog](https://www.maproomblog.com/2023/11/thoughts-on-google-maps-new-design-from-a-former-google-maps-designer/); [9to5Google](https://9to5google.com/2023/11/25/android-auto-google-maps-new-colors/)

**Mapbox (premium option)**
- Mapbox Dark v11 (`mapbox://styles/mapbox/dark-v11`) is described as "a minimal, dark-colored basemap for data visualizations and night-mode interfaces" built on Streets v8 / Terrain v2 / Bathymetry v2, labeled "Classic style — no longer maintained"; Mapbox recommends Standard for new projects; full JSON is only available via the token-gated Styles API — [Mapbox Dark reference](https://docs.mapbox.com/map-styles/reference/dark.md)
- Mapbox Standard exposes `lightPreset` with values `dawn`, `day`, `dusk`, `night` (default `day`), set via `config.basemap` at load or via the `imports` config, changeable at runtime; custom layers need `*-emissive-strength` (0 to 1) to render correctly under Standard's 3D lighting — [Mapbox Standard styles guide](https://docs.mapbox.com/map-styles/guides/standard-styles/)
- Historic Mapbox Streets typography: "our font family of choice is DIN" (2016) — [Mapbox blog](https://blog.mapbox.com/mapbox-streets-for-gl-4710a6e1a14f)

**MapTiler dark styles (free tier with key)**
- MapTiler ships dark variants of Basic, Streets, Outdoor and Dataviz; Dataviz Dark "is based on black and dark grey colors" (`MapStyle.DATAVIZ.DARK` in the SDK); Streets Dark colors are "tuned for night-time navigation"; an OpenStreetMap Dark style was released Jan 2026 with a fully redesigned palette rather than an inversion — [MapTiler dark](https://maptiler.com/maps/dark); [MapTiler Dataviz](https://www.maptiler.com/maps/dataviz/); [MapTiler OSM Dark news](https://www.maptiler.com/news/2026/01/openstreetmap-dark-the-community-favorite-now-optimized-for-the-night/)

**Apple Maps dark**
- Only secondary coverage found. In the iOS 15 betas Apple "made some roads thicker, made water lighter and less saturated, darkened buildings, and changed areas of interest from brown to purple-ish" in dark mode — [Justin O'Beirne, iOS 15 beta 3](https://justinobeirne.com/ios-15-beta3-cartography-changes). Users on MacRumors said the iOS 12-era night mode was bluer and the newer dark style can be "bland" in regions without new map data — [MacRumors thread](https://spy.macrumors.com/threads/the-ios14-apple-maps-thread.2237669/page-5)

**Uber**
- Uber's dark-mode engineering post describes "Platform Colors" theme tokens (e.g. `?textPrimary`), a linter that flags hard-coded hex, and a dev plugin to toggle Auto/Light/Dark/System; it never mentions the map and gives no hex values — [Uber blog: From Light to Dark](https://www.uber.com/blog/from-light-to-dark-the-story-behind-dark-mode/)
- Base Web (Uber's open-source React system) added a Map Marker component; third-party write-ups of Uber's dark tokens are explicitly unofficial — [Motiff Base overview](https://motiff.com/design-system-wiki/design-systems-overview/uber-base-design-system); [superdesign Uber write-up](https://superdesign.dev/blog/uber-design-system)

### Inferences
- Structural pattern shared by every premium dark style: land is a near-neutral dark gray in the `#0e0e0e`–`#1f1f1f` band (Stadia is the outlier at `#333`), water is only 1–3 steps lighter *and* slightly blue (`#2C353C`, `#31353f`, `#17263c`), parks are either invisible (CARTO) or an 8–10% alpha green tint (Stadia) or a 2–4 step green-shifted gray (Protomaps `#1c2421`), and buildings are either darker than land (OpenFreeMap `#0a0a0a`, Protomaps `#111`) or a light-gray extrusion top that fades in z13–z16 (CARTO). This "buildings darker than ground" trick is the cheapest way to get the premium etched look.
- Road hierarchy on dark maps is carried by lightness steps of roughly 10 units (Protomaps: `#333` -> `#3d3d3d` -> `#474747`) with casings at the land color, so roads read as light strokes separated by dark gaps. OpenFreeMap inverts this (black road on gray casing) which is the most minimal but loses hierarchy at low zoom.
- For an "Uber at night" look start from Protomaps `dark` or CARTO Dark Matter and (a) lift the road ramp slightly (`#3a3a3a`/`#444`/`#505050`), (b) keep water at a desaturated blue-gray around `#2a3038`, (c) keep labels in the `#7a7a7a`–`#bdbdbd` range with 1px land-colored halos, (d) make buildings a touch darker than land with a 1px outline at land+4.
- Label density: all four free styles use 9–10px for minor roads/suburbs, 10–12px primary roads, 14px+ large cities, and progressively dim country labels at mid zooms (CARTO drops country text from `#9d9d9d` to `#707070` between z3 and z6) — i.e. they *reduce contrast* rather than hide labels as zoom increases.

### Gaps
- Mapbox Dark v11 and Mapbox Standard `night` exact hex values: style JSON is token-gated and no primary doc publishes the palette. Third-party "Mapbox dark palette" pages (skills.cat / mcpservers.org) list `#1a1a1a` background, `#0d47a1` water, `#3a3a3a` roads but those read as illustrative templates, not the shipped style. Fetch `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=...` to confirm.
- Uber's actual in-app map palette and Apple Maps dark-mode hex values: no primary source. Any comparison to "Uber at night" is by visual analogy only.
- Current Mapbox `text-font` stacks for dark-v11 (believed to be DIN Pro variants based on the 2016 blog) could not be confirmed from a current source.

---

## Key Question 2: Which free MapLibre-compatible styles look best dark, and how hard are they to customize

### Takeaway
OpenFreeMap `dark` is the only truly keyless hosted option and is the most minimal; Protomaps `dark`/`black` are the most *programmatically* customizable (spread a `Flavor` object and override single colors); CARTO Dark Matter JSON is MIT-ish-open and hand-editable in Maputnik; Stadia and MapTiler need a free-tier key. Customization difficulty ranks: Protomaps (easiest, typed object) < Maputnik on OpenFreeMap/CARTO JSON (moderate, ~200+ layers) < MapTiler Customize (GUI, vendor-locked) < Mapbox Studio (premium, richest).

### Cited Findings
- OpenFreeMap `dark` is served at a public style URL with no key and its JSON is inspectable (background `rgb(12,12,12)`, Noto Sans Regular fonts, roughly 10px uppercase labels) — [OpenFreeMap dark style](https://tiles.openfreemap.org/styles/dark)
- Protomaps: "the Flavor TypeScript interface is the preferred way to customize"; override with ES6 spread, e.g. `let flavor = {...namedFlavor("light"), buildings:"red"}`; styles are generated from Flavor objects via `@protomaps/basemaps` with MapLibre GL JS as the preferred library; each flavor has pre-rendered sprites (townspots, highway shields, POIs for light/dark only) — [Protomaps themes docs](https://docs.protomaps.com/basemaps/themes)
- Protomaps' GitHub repo contains generator source, not hosted endpoints; hosted use needs a free API key with the flavor in the URL — [plan4better basemap guide](https://www.plan4better.de/en/post/where-to-find-basemaps)
- Protomaps styles can be "generated from their code or styled in Maputnik"; Maputnik is a free open-source visual style editor — [plan4better basemap guide](https://www.plan4better.de/en/post/where-to-find-basemaps)
- CARTO Dark Matter MapLibre/Mapbox-GL JSON is published in the open `basemap-styles` repo — [CARTO basemap-styles](https://raw.githubusercontent.com/CartoDB/basemap-styles/master/mapboxgl/dark-matter.json)
- Stadia's Alidade Smooth Dark style JSON is publicly readable at `tiles.stadiamaps.com/styles/alidade_smooth_dark.json` and uses a proprietary "Stadia" font family — [Stadia style JSON](https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json)
- MapTiler: dark variants of Basic/Streets/Outdoor/Dataviz, switchable "with a single line of code using the MapTiler SDK" (`MapStyle.DATAVIZ.DARK`) — [MapTiler dark](https://maptiler.com/maps/dark); [MapTiler SDK map styles](https://docs.maptiler.com/sdk-js/api/map-styles/)
- Mapbox Dark v11 can be restyled at runtime with `setPaintProperty`/`setLayoutProperty` or cloned in Mapbox Studio; Standard uses a configuration API instead of direct layer edits — [Mapbox Dark reference](https://docs.mapbox.com/map-styles/reference/dark.md)

### Inferences
- Recommended keyless baseline for a premium minimal dark map: OpenFreeMap `dark` as the tile source, but override its label color (`rgb(101,101,101)` is too dim for sunlight) and road inner color (pure `#000` motorways make routes hard to read) via `map.setPaintProperty` after load, or fork the JSON in Maputnik.
- If you can accept a free API key or self-host PMTiles, Protomaps `dark` with a 10–15 line Flavor override is the lowest-effort path to a bespoke look (change `earth`, `water`, `highway`, `major`, `city_label`, `buildings`).
- Stadia's "Stadia" font and MapTiler styles are vendor-hosted glyphs; swapping to Inter requires self-hosting a glyph PBF set (e.g. via `font-maker`/OpenMapTiles fonts) — practical note, not sourced.

### Gaps
- No side-by-side published comparison or benchmark of these dark styles' visual quality; "best-looking" is a judgment. No source quantified layer counts or edit effort.
- MapTiler Customize tool specifics (export of style JSON, licensing of customized styles) not verified.

---

## Key Question 3: Route line recipes (width, color, casing, glow) used by Uber, Citymapper, Apple, Google, and known reproductions

### Takeaway
The only vendor-published concrete route recipe found is Mapbox Navigation's: main route `#56A8FB` with casing `#2F7AC6`, alternates `#999999` with casing `#666666`, round caps/joins, casing width = 1.2x route width, widths driven by a linear zoom interpolate, plus optional `line-blur`-based glow layers underneath. Uber, Citymapper, Apple, and Google route styling values are not publicly documented; the general MapLibre pattern is three stacked line layers (glow -> casing -> fill).

### Cited Findings
- Mapbox Navigation iOS route styling example: main route `#56A8FB` (`rgb(0.337, 0.659, 0.984)`), main casing `#2F7AC6` (`rgb(0.184, 0.478, 0.776)`), alternative route `#999999`, alternative casing `#666666`; `lineJoin`/`lineCap` `.round`; width via `lineWidthExpression()` (multiplier 1.0) and casing `lineWidthExpression(1.2)`, both `interpolate(linear, zoom, RouteLineWidthByZoomLevel * multiplier)` — [Mapbox iOS route lines styling](https://docs.mapbox.com/ios/navigation/v2/examples/route-lines-styling/)
- Mapbox Navigation Android exposes `routeLineBlurEnabled`, `routeLineBlurOpacity`, `routeLineBlurWidth`, `applyTrafficColorsToRouteLineBlur`, `displaySoftGradientForTraffic` (default false), `softGradientTransition`, `lineDepthOcclusionFactor` (0–1), and `fadingConfig` (null = fully opaque at all zooms); blur maps to the `line-blur` paint property — [Mapbox Android RouteLineViewDynamicOptionsBuilder](https://docs.mapbox.com/android/navigation/api/coreframework/3.21.13/ui-maps/com.mapbox.navigation.ui.maps.route.line.model/-mapbox-route-line-view-dynamic-options-builder/index.html)
- Mapbox Android `RouteLineColorResources` defines `routeDefaultColor`, `routeCasingColor`, low/moderate/heavy/severe congestion colors, `routeClosureColor`, `restrictedRoadColor`, `routeLineTraveledColor`, `alternativeRoute*` and `inactiveRouteLeg*` variants, and `blurColor`; "the default route line color and the low/unknown traffic congestion color are the same"; default congestion bands 0–39 low, 40–59 moderate, 60–79 heavy, 80–100 severe — [Mapbox Android RouteLineColorResources](https://docs.mapbox.com/android/navigation/api/coreframework/3.21.13/ui-maps/com.mapbox.navigation.ui.maps.route.line.model/-route-line-color-resources/index.html)
- MapLibre casing pattern: "add a slightly wider dark line underneath for a casing effect" (casing layer first, main line on top); `lineBlur` and round caps ("drawn beyond the endpoint of the line at a radius of one-half of the line's width") are the relevant line-layer properties — [MapLibre Flutter line layer](https://maplibre.org/flutter-maplibre-gl/layers/line-layer/); [maplibre-react-native LineLayer](https://github.com/maplibre/maplibre-react-native/blob/HEAD/docs/LineLayer.md)
- MapTiler SDK has a polyline helper example demonstrating outline/glow/blur on NY subway lines (MapTiler-specific API) — [MapTiler polyline blur example](https://docs.maptiler.com/sdk-js/examples/helper-polyline-blur/)
- Google Maps night-mode criticism: "the active and alternate routes look too similar in night mode" — [9to5Google](https://9to5google.com/2023/11/25/android-auto-google-maps-new-colors/)
- Mapbox Standard requires `line-emissive-strength`-style settings (0–1) on custom layers or they will be darkened by the night lighting — [Mapbox Standard guide](https://docs.mapbox.com/map-styles/guides/standard-styles/)

### Inferences
- A MapLibre reproduction of the Mapbox/Uber-class look (recipe synthesized from the sources above; exact numbers are recommendations, not vendor defaults):
  - `route-glow`: line, `line-color` = accent, `line-opacity` 0.25–0.35, `line-blur` 8–12, `line-width` = fill width x 2.5–3, `line-cap`/`line-join` round. Placed lowest.
  - `route-casing`: `line-color` = darker accent (e.g. `#2F7AC6` for `#56A8FB`, i.e. ~35% darker same hue) or `rgba(0,0,0,0.6)` on very dark basemaps, `line-width` = fill x 1.2 (Mapbox ratio) to x1.5.
  - `route-fill`: `line-color` accent, width `["interpolate",["linear"],["zoom"],10,3,13,4,16,6,19,10,22,14]` (shape mirrors Mapbox's linear zoom interpolate; values are a reasonable starting point and must be tuned).
  - Alternates: `#999999`/`#666666` at 70–80% of main width (Mapbox pairing).
  - Traveled portion: desaturated gray with `line-gradient` on a `lineMetrics: true` source for the "eaten" effect.
  - On Mapbox Standard night, set `line-emissive-strength: 1` on all three layers so the route stays bright.
- Blue (`#56A8FB`) is the industry default route hue because it sits far from the red/amber alert hues and from any green park tint; on near-black basemaps a lighter, less saturated blue reads better than a pure `#007AFF`.

### Gaps
- No public documentation of Uber's, Citymapper's, Apple's, or Google's shipped route widths, casing, or glow values; Google's and Apple's route blues are only observable in-app.
- No notable CodePen/GitHub "route glow" reproduction was found via search (results were Mapbox SDK docs only); the MapLibre `line-blur` approach is documented but no named example repo was located.
- Mapbox's `RouteLineWidthByZoomLevel` default numeric table was referenced but not shown on the fetched page.

---

## Key Question 4: Proven glassmorphic card recipes with exact CSS, and when they hurt mobile performance

### Takeaway
Josh Comeau's recipe is the most rigorous public one: `backdrop-filter: blur(16px)` (12px for a calmer look) plus a 0.5–0.6 alpha background tint, a 200%-height child with `overflow:hidden`/`mask-image` so the blur samples pixels *near* the edge, an optional 6px "glass edge" sibling with `blur(8px) brightness(120%)`, and `saturate(120–140%)` to counter blur's desaturation, all wrapped in `@supports`. Performance guidance from practitioner sources: cap at 2–3 glass surfaces per viewport, 8–15px blur, never animate a blurred element, reduce or disable on touch devices and under `prefers-reduced-transparency`.

### Cited Findings
- Core problem: `backdrop-filter` samples only pixels directly behind the element; fix by moving the blur to an absolutely positioned child at `height: 200%` with `backdrop-filter: blur(16px)` and clipping via `overflow: hidden` (Chrome 142+) or `mask-image: linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)` plus `pointer-events: none` — [Josh Comeau, backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/)
- Flicker fix at the top edge: `background: linear-gradient(to bottom, hsl(0deg 0% 0%) 0%, transparent 50%)` on the backdrop, using the site's real background color — [Josh Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)
- Glass thickness: blur 12px vs 16px; semi-opaque tint on the container at ~0.5–0.6 alpha, e.g. `background: hsl(0deg 0% 100% / 0.5)` — [Josh Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)
- Glassy edge: sibling with `--thickness: 6px; transform: translateY(100%); backdrop-filter: blur(8px) brightness(120%); mask-image: linear-gradient(to bottom, black 0, black var(--thickness), transparent var(--thickness))` — [Josh Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)
- Saturation: `.backdrop { backdrop-filter: blur(8px) brightness(90%) saturate(140%); } .backdrop-edge { backdrop-filter: blur(6px) brightness(110%) saturate(120%); }`; "increased saturation can help reduce the muddiness"; >97% browser support (caniuse, Oct 2026); wrap in `@supports (backdrop-filter: blur(16px))` with a near-opaque fallback; rounded corners via SVG `mask-image: url(#frostyGlassMask)`; Firefox bug with `position: sticky` + ancestor `overflow` + `border-radius` — [Josh Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)
- "Blurring averages colors together, and averaging colors drains saturation out of them," hence adding `saturate()` and a light tint so the element reads as a surface — [DEV: Liquid glass on the web](https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07)
- `backdrop-filter` set to anything other than `none` creates a new stacking context — [web.dev backdrop-filter](https://web.dev/articles/backdrop-filter)
- Performance: "limit glass elements to 2-3 per viewport, avoiding animation on blurred elements, using will-change: backdrop-filter sparingly, and testing on mid-range devices"; blur 8–15px suggested — [OpenReplay glassmorphic UI](https://blog.openreplay.com/create-glassmorphic-ui-css/)
- Mobile: "consider reducing blur radius or disabling effects entirely" on touch devices, and honor `prefers-reduced-transparency` — [OpenReplay backdrop-filter](https://blog.openreplay.com/creating-blurred-backgrounds-css-backdrop-filter/)
- Anecdotal: stacking >2 blurred panels on mid-range Android "can tank scrolling performance down to 15 FPS" (single unverified claim) — [uxmagic glassmorphism](https://uxmagic.ai/blog/what-is-glassmorphism); a WordPress glass plugin disabled its scroll-driven reflection on mobile because stacked animating panels stuttered — [WordPress plugin changelog](https://wordpress.org/plugins/?p=338914)

### Inferences
- A dark-map-specific glass card (synthesized; values are recommendations consistent with the cited sources): `background: rgba(18,18,20,0.55); backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: same; border: 1px solid rgba(255,255,255,0.08); border-top-color: rgba(255,255,255,0.14); border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);`. Over a dark basemap the tint must be *dark* (not white) or the card goes gray and loses the map; the 1px top highlight stands in for Comeau's brightness-boosted "edge."
- Optional film-grain noise: a tiny repeating PNG/SVG `feTurbulence` at 3–5% opacity in a `::after` pseudo-element, `mix-blend-mode: overlay` — common practice to hide banding on large dark gradients; no measured source found.
- A moving map under a blurred sheet is the worst case for `backdrop-filter`: every map frame forces re-blur. Keep the always-visible bottom sheet at blur <= 12px, make the map canvas `will-change`-free, and drop to a solid `rgba(18,18,20,0.92)` while the map is being dragged or during sheet animations (toggle a class on `movestart`/`moveend`).

### Gaps
- No controlled benchmark (FPS/GPU time) for `backdrop-filter` over a WebGL map canvas on mobile; the 15 FPS figure is a single uncorroborated blog claim.
- Comeau's article does not discuss performance; the "2–3 per viewport" rule is practitioner advice, not measured.

---

## Key Question 5: Accent colors crisis/safety products use for primary actions, and what color research says about red vs orange vs amber for urgency on dark backgrounds

### Takeaway
Shipped safety products use a severity ramp (Citizen: green minor / yellow avoid / red emergency on a dark map; Android Safety Center: traffic-light with Material red for serious). Research consistently ranks red as the strongest urgency signal (fast-blink red rated highest; red > orange on danger scales), with orange associated with impulsivity and amber/yellow hard to distinguish from orange. Material's dark-theme guidance is to desaturate/lighten saturated accents (error `#B00020` -> `#CF6679` via 40% white overlay) to reach 4.5:1 on dark surfaces. No study directly compares red/orange/amber on dark backgrounds.

### Cited Findings
- Citizen's redesign: "a dark map that sprouts red dots wherever new emergencies are reported"; "the main map will remain dark"; incidents "coded by severity: green for minor advisories, yellow for situations to avoid, and red for emergencies where someone is likely to get hurt" — [AIGA Eye on Design](https://eyeondesign.aiga.org/do-crime-tracking-apps-have-a-design-problem/)
- Android Safety Center uses a traffic-light scheme with red for serious issues drawn from the Material palette — [Android Safety Center UI](https://source.android.com/docs/security/safety-center/customize-ui?authuser=1)
- LED notification study: urgency perception was highest for red at high blink frequency, and participants chose red as the best color to indicate urgency — [Springer, color and blink frequency of LED notifications](https://www.springerprofessional.de/the-color-and-blink-frequency-of-led-notification-lights-and-sma/2171326)
- Traffic-light/danger association study: red ranked above orange on a danger scale; yellow and orange were harder to separate than red and green — [White Rose eprints](https://eprints.whiterose.ac.uk/id/eprint/123161/)
- Duan, Rhodes & Cheung (2018): red backgrounds produced a high-arousal pattern (faster, more accurate), orange tended to produce high impulsivity; chroma significantly affected response time and error rate — [Regensburg epub](https://epub.uni-regensburg.de/33832/)
- Multitasking display thesis: participants echoed concerns about red backgrounds' association with urgency; gray was the preferred background — [University of Dayton thesis](https://ecommons.udayton.edu/graduate_theses/7560)
- Material dark theme: saturated colors fail WCAG 4.5:1 on dark surfaces; baseline uses the 200 tone of primary; error `#B00020` becomes `#CF6679` by overlaying 40% white to meet AA; accents should be light desaturated pastels or used sparingly when vivid; start surfaces at `#121212` with translucent white elevation overlays — [Material Design dark theme](https://m2.material.io/design/color/dark-theme)
- Sunlight: a CityStrides user found dark-mode maps "harder to read" in bright sun, especially thin purple lines, while another praised the same "dark black background + purple / blue" contrast — [CityStrides community](https://community.citystrides.com/t/dark-mode-for-supporters/26979?page=2)
- Two distinct dark goals: a low-contrast "night" style to avoid dazzling drivers vs a high-contrast "dark" style usable in sunlight, plus OLED battery savings; one style may not serve both — [CoMaps issue wiki](https://zff.dev/comaps/om-issues-wiki/issues/688)
- Outdoor display engineering: real-world contrast after reflections is far below datasheet values; ~5:1 is the floor for acceptable readability, ~10:1 "well readable"; sunlight-readable displays need >=1000 cd/m2 — [Riverdi sunlight-readable displays](https://riverdi.com/blog/sunlight-readable-displays-the-most-important-parameters-of-outdoor-lcd-displays-you-need-to-know); [UCF photonics 2024](https://lcd.creol.ucf.edu/Publications/2024/photonics-11-578-2024.pdf)
- Uber's dark-mode team verified text legibility and that icons/images "didn't blend into the background" (early builds had near-invisible status-bar icons) but published no contrast ratios — [Uber blog](https://www.uber.com/blog/from-light-to-dark-the-story-behind-dark-mode/)

### Inferences
- For a safety app's single primary action on a near-black UI: use red for *emergency* only, lifted/desaturated per Material (`#CF6679`-class or a coral like Protomaps' `#F2567A`) so it passes 4.5:1 on `#121212`–`#1f1f1f`; reserve amber/orange for "caution" tiers, and keep the navigation/route blue (`#56A8FB`-class) and status green (`#30C573`-class) far from red so severity tiers don't collide. Protomaps' dark-flavor POI set (`#F2567A` red, `#F19B6E` tangerine, `#30C573` green, `#4299BB` blue) is an already-tuned accent set for `#1f1f1f` land.
- Because orange and amber are perceptually hard to separate (White Rose study), do not use both as adjacent severity tiers; pick one.
- Sunlight readability on a dark map is driven by stroke/label contrast, not the background: raise label color to >= `#bdbdbd` on `#0e0e0e` land, make the route fill at least 4px at z15+ with a dark casing, avoid thin saturated purple/blue hairlines, and consider auto-switching to a high-contrast "dark day" variant or a light style when ambient light is high (no mobile-web ambient-light API is reliably available; use time-of-day/system theme as proxy).

### Gaps
- No peer-reviewed study comparing red vs orange vs amber urgency specifically on dark backgrounds with luminance control; amber is typically folded into yellow-orange.
- No official hex values for Citizen, Noonlight, Life360, or other safety apps' primary action colors.
- No controlled measurements of dark vs light map readability on OLED phones in direct sunlight; evidence is anecdotal.

---

## Supplementary: Typography over dark maps

### Takeaway
Shipped dark basemaps use Montserrat (CARTO), Noto Sans (OpenFreeMap), a proprietary "Stadia" family (Stadia), DIN historically (Mapbox); Uber's UI uses proprietary Uber Move/UberMoveText (transit-signage inspired); UI-layer choices like Inter, SF, Geist, Söhne are app-chrome fonts rather than basemap glyph stacks. Cartography references favor sans-serifs (Inter, Roboto, Helvetica, Open Sans) for small-size screen legibility, with hierarchy from size/weight/color mattering as much as the face.

### Cited Findings
- CARTO Dark Matter labels: Montserrat Regular/Medium (+Italic for water) with Open Sans, Noto Sans Regular fallbacks — [CARTO dark-matter.json](https://raw.githubusercontent.com/CartoDB/basemap-styles/master/mapboxgl/dark-matter.json)
- OpenFreeMap dark labels: Noto Sans Regular, uppercase place and road names — [OpenFreeMap dark style](https://tiles.openfreemap.org/styles/dark)
- Stadia Alidade Smooth Dark: "Stadia Regular/Semibold/Bold/Italic" font stack — [Stadia style JSON](https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json)
- Mapbox Streets original: "our font family of choice is DIN" — [Mapbox blog 2016](https://blog.mapbox.com/mapbox-streets-for-gl-4710a6e1a14f)
- Uber Move (2018) is "inspired by transportation fonts (think road signs and subways)" and built for legibility across languages; it is proprietary, with Inter or system-ui suggested as substitutes by third parties — [Engadget](https://www.engadget.com/2018-09-12-uber-new-typeface.html); [Uber 2018 redesign](https://www.uber.com/careers/design/work/2018-redesign); [hagicode Uber design notes (unofficial)](https://design.hagicode.com/designs/uber/DESIGN.md)
- Cartography guidance: sans-serifs (Helvetica, Inter, Roboto, Open Sans) are "cleaner, more modern, more legible at small sizes" and the safer choice for contemporary maps; hierarchy via size, weight, color matters as much as the face — [atlas.co typography in maps](https://atlas.co/courses/gis-basics/typography-in-maps/); [UCGIS GIS&T BoK Typography](https://gistbok-ltb.ucgis.org/current/concept/CV-03-010)

### Inferences
- Practical pairing: Inter (or system `-apple-system`/SF on iOS) for HTML overlays with `font-feature-settings: "tnum"` for distances/ETAs, and either the basemap's own glyphs (Noto Sans on OpenFreeMap) or self-hosted Inter glyph PBFs for labels. Inter/SF/Geist are chosen for maps because of tall x-height, open apertures, and distinguishable `Il1` at 10–12px over noisy backgrounds — this rationale is consistent with the cartography sources but not stated by them for these specific faces.
- Label recipe seen across the dark styles: 9–10px uppercase minor labels with `letter-spacing` ~0.05–0.1em, 1px halo at land color (sometimes `rgba(0,0,0,0.7)` with 1px blur), text in the `#7a7a7a`–`#d4d4dc` band, never pure white.

### Gaps
- No primary source explains *why* Mapbox/Apple/Google chose DIN/SF/Roboto for map labels; Apple Maps' and Google Maps' map-label typefaces were not confirmed by any retrieved source.
- Söhne and Geist usage on shipped map products was not found in any source.
