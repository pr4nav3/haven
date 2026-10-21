# Cinematic map animation techniques: MapLibre GL JS vs Mapbox GL JS (as of Oct 2026)

Scope: camera choreography, route draw-in, pulsing markers, 3D/terrain/sky/globe, label tuning, clustering, mobile 60fps, React wrappers, keyless tile/style sources, and free routing APIs. All version numbers are flagged; anything I could not verify is listed under Gaps.

---

## Key question 1: State of MapLibre GL JS vs Mapbox GL JS v3 in 2026; which effects are Mapbox-only and what are the MapLibre equivalents?

### Takeaway
MapLibre GL JS is at 6.15.0 (ESM-only, WebGL2-required since 6.0) and has native globe, sky/atmosphere/fog, terrain, line-gradient, camera roll, and a fast feature-state path; Mapbox GL JS v3 (examples currently ship v3.33.0) remains the premium option for the Standard style with light presets (dawn/day/dusk/night), 3D lighting on fill-extrusions (flood light, ambient occlusion, emissive strength), and the `line-trim-offset`/`line-trim-color`/`line-trim-fade-range` route-vanish properties, none of which exist in MapLibre.

### Cited Findings

**MapLibre GL JS versions and features**
- Latest MapLibre GL JS release in the CHANGELOG is 6.15.0; 6.0 made the distribution ESM-only, removed WebGL1 (WebGL2 required), removed `setData`'s second parameter, made `styleimagemissing` notify-only, made `Map` compose `Camera` instead of extend it, and targeted ES2022 — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- 6.0 replaced string-indexed feature-state storage with arrays, "up to 3.4x faster"; 6.13 sped up symbol layout; 6.15 sped up tile loading; 6.10 sped up triangulation — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- 6.x globe: center can reach the poles (6.13); atmosphere fades with camera altitude (6.11); sky shows in globe view (6.10); sky properties can read global state (6.11) — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- 6.x terrain: `symbol-height-offset` and `symbol-height-anchor` (6.6); DEM picking via CPU raycast (6.6); `terrainSkirtLength` (6.0); `renderToTerrainTile` for custom layers (6.13) — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- 6.x misc: `globalState` map option (6.14); global-state expressions in sky, light, projection type (6.1); `getClusterOptions` (6.1); `flyTo` fixed to honor `offset`/`around` under `prefers-reduced-motion` (6.14); `aroundCenter` deprecated in favor of `dragRotate` options (6.15); `setRTLTextPlugin` deprecated (6.9) — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- MapLibre 5.0 (announced Jan 2025) introduced globe projection with merged atmosphere/sky, vertical perspective projection, camera roll and pitch above 90 degrees, WebGL2 dual-stack, and `on()` returning a `Subscription`; `queryTerrainElevation` returns actual altitude — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md); [MapLibre newsletter Dec 2024](https://maplibre.org/news/2025-01-05-maplibre-newsletter-december-2024/)
- 5.x additions useful for motion work: data-driven `line-dasharray` (5.8); `line-gradient` combined with `line-dasharray` (5.9); `color-relief` layer (5.6); time control API and `transformConstrain` (5.10); MapLibre Tiles (MLT) support (5.12); GeoJSON `updateData` and worker performance improvements (5.13, 5.14); global-state layer visibility (5.15); `reduceMotion` map option (5.12); ES2020 compatibility and memory-leak fixes incl. capped tile texture pool (5.21); data-driven `line-cap`/`line-miter-limit`/`line-round-limit` (5.22); marker opacity numbers and a "covered" CSS class under terrain/globe (5.23); fog computation skipped at zero opacity, halo+glyph in one pass (5.24) — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md); [OSM website bump 5.11 to 5.12](https://lists.openstreetmap.org/pipermail/rails-dev/2025-November/045046.html); [OSM website bump 5.14 to 5.15](https://lists.openstreetmap.org/pipermail/rails-dev/2025-December/046257.html)
- MapLibre 5.0 disabled fog rendering for Terrain3D on globe because it was unsupported — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- MapLibre sky/fog is a style-root property, not a layer, set via `map.setSky({...})`; the fog-related properties only take visible effect with 3D terrain ("The base color for the fog. Requires 3D terrain"); current property names are `sky-color`, `horizon-color`, `fog-color`, `sky-horizon-blend`, `horizon-fog-blend`, `fog-ground-blend`, `atmosphere-blend`; older examples used `horizon-blend`/`fog-blend`; the spec labels the feature experimental — [MapLibre style spec: sky](https://www.maplibre.org/maplibre-style-spec/sky/); [MapLibre Flutter globe/terrain/sky guide](https://maplibre.org/flutter-maplibre-gl/advanced/globe-terrain-sky/)
- `setSky`, `setTerrain`, `setProjection` are discarded on style change and must be re-run from the style-loaded callback; suggested pattern: `atmosphere-blend` as an interpolate on zoom fading from 1 at low zoom to 0 at zoom 12 — [MapLibre Flutter guide](https://maplibre.org/flutter-maplibre-gl/advanced/globe-terrain-sky/)
- Jawg example pattern: add a `raster-dem` source, `setTerrain({source, exaggeration: 1.5})`, then `setSky` inside a one-time load handler — [Jawg: Sky, Fog, Terrain](https://www.jawg.io/docs/integration/maplibre-gl-js/sky-fog-terrain/)
- MapLibre `fadeDuration` map option: "duration of the fade-in/fade-out animation for label collisions after initial map load, in milliseconds", affects all symbol layers, default 300 ms; does not affect runtime style transitions or raster cross-fade; `crossSourceCollisions` default true — [MapLibre MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions)

**Mapbox GL JS v3**
- Mapbox GL JS v3 examples currently load `v3.33.0` from the CDN — [Mapbox: Animate a line](https://docs.mapbox.com/mapbox-gl-js/example/animate-a-line/); [Mapbox: free camera path](https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/)
- v3: Mapbox Standard is the default style when none is passed; `map.setConfigProperty('basemap', ...)` with `showPlaceLabels`, `showRoadLabels`, `showPointOfInterestLabels`, `showTransitLabels`, `lightPreset`, `font`; light presets day/dusk/dawn/night; slots `bottom`/`middle`/`top`; experimental `AmbientLight`/`DirectionalLight`; new fill-extrusion ambient occlusion, flood light, vertical scale; `line-emissive-strength`; new expressions `hsl`, `hsla`, `random`, `measureLight`, `config`, `raster-value`, `distance`; `icon-image-cross-fade`; WebGL 2 mandatory; during globe/terrain rendering layers may be rearranged — [Mapbox: Migrate to v3](https://docs.mapbox.com/mapbox-gl-js/guides/migrate-to-v3/)
- `map.setConfigProperty('basemap', 'lightPreset', 'dusk')` switches the preset at runtime; `show3dObjects` toggles all 3D layers including shadows, ambient occlusion and flood lights; custom layers need an `emissive-strength` (0 to 1) to look right under dusk/night lighting — [Mapbox Standard style guide](https://docs.mapbox.com/map-styles/standard/guides); [Standard styles](https://docs.mapbox.com/map-styles/guides/standard-styles/)
- Mapbox-only line properties (style spec): `line-trim-offset` (array of two numbers in [0,1], default [0,0], GeoJSON source required, GL JS >= 2.9.0); `line-trim-color` (experimental, default transparent, transitionable, GL JS >= 3.6.0); `line-trim-fade-range` (experimental, [0,0] default, fades blend trim color into `line-color`/`line-gradient`, GL JS >= 3.6.0); `line-emissive-strength` (basic >= 3.0.0, data-driven >= 3.17.0); `line-z-offset` (layout, meters, GL JS >= 3.5.0, requires `line-elevation-reference`, not supported with globe) — [Mapbox style spec: layers](https://docs.mapbox.com/style-spec/reference/layers/)
- `line-gradient` in Mapbox requires a GeoJSON source with `lineMetrics: true`, supports GL JS >= 0.45.0, is disabled by `line-pattern`, and data-driven styling is not supported in any SDK — [Mapbox style spec: layers](https://docs.mapbox.com/style-spec/reference/layers/)
- Mapbox-only fill-extrusion lighting: `fill-extrusion-ambient-occlusion-intensity` (0 to 1, default 0, "around 0.3 is typical"), `-ambient-occlusion-radius` (default 3, legacy light only), `-ambient-occlusion-wall-radius`, `-ambient-occlusion-ground-radius` (default 3 m), `-ambient-occlusion-ground-attenuation` (default 0.69), `fill-extrusion-emissive-strength` (feature-state supported, data-driven >= 3.8.0), `fill-extrusion-flood-light-color` (default #ffffff), `-flood-light-intensity` (0 to 1, default 0), `-flood-light-ground-radius` (evaluated once per tile; feature-state styling deprecated), `-flood-light-wall-radius`, `-flood-light-ground-attenuation` (default 0.69), `fill-extrusion-vertical-scale` (experimental, GL JS >= 3.0.0) — [Mapbox style spec: layers](https://docs.mapbox.com/style-spec/reference/layers/)
- Mapbox pricing: GL JS free tier up to 50,000 monthly map loads, then $5.00 per 1,000 for 50,001 to 100,000; a map load is counted "every time Mapbox GL JS initializes on a webpage"; Directions API free up to 100,000 monthly requests, then $2.00 per 1,000 for 100,001 to 500,000 — [Mapbox pricing](https://www.mapbox.com/pricing)

### Inferences
- Feature parity map for this project:
  - Route vanish / trim: Mapbox `line-trim-offset` + `line-trim-color` + `line-trim-fade-range` (v3.6+). MapLibre equivalent: animate `line-gradient` with a `step` on `["line-progress"]` (works in both libraries) or re-slice the geometry with turf `lineSliceAlong` and `setData`.
  - Light presets / 3D lighting: Mapbox Standard only. MapLibre equivalent: author a dark style (OpenFreeMap Dark, Protomaps "dark"/"black" flavor, VersaTiles "eclipse") and fake lighting with zoom-interpolated `fill-extrusion-color` and `fill-extrusion-opacity`.
  - Sky/fog/globe: both have them. MapLibre's fog only renders with terrain enabled, and in 5.0 fog on globe+terrain was disabled, so a flat dark city map in MapLibre should not rely on fog for mood.
  - Terrain, 3D buildings, clustering, feature-state, flyTo/easeTo, free camera (`getFreeCameraOptions`/`setFreeCameraOptions`, `lookAtPoint`), roll: available in both.
- MapLibre 6's ESM-only + ES2022 target reduces bundle size but requires bundler worker configuration (see React section) and modern browser targets.

### Gaps
- I did not find a Mapbox GL JS (JavaScript) example page animating `line-trim-offset`; every search hit was Android SDK docs. The property exists in the GL JS style spec (>= 2.9.0) but a verified JS snippet is missing; the pattern should be `map.setPaintProperty('route', 'line-trim-offset', [0, progress])` on each frame, but this is my inference, not a cited example.
- MapLibre CHANGELOG was only read to the 5.21 section; 5.1 to 5.3 and the exact 5.0.0 release date were not read. The 6.15.0 release date is not stated in the CHANGELOG text.
- I did not verify whether MapLibre has an equivalent of Mapbox's `line-z-offset`/`line-elevation-reference` for routes draped over terrain.

---

## Key question 2: Techniques and best open-source examples for route draw-in and camera flythrough (with code)

### Takeaway
The canonical patterns are (a) Mapbox's "Animate a line" (append coordinates each rAF frame and `setData`), (b) the Mapbox Impact Tools "journey animation sequence" (reveal with a `step` on `line-progress` inside `line-gradient`, camera driven by FreeCamera + turf `along` + lerp), and (c) Mapbox's "free camera path" example (camera position from one LineString, `lookAtPoint` from another, `MercatorCoordinate.fromLngLat(..., altitude)`); all of these port to MapLibre except `line-trim-*`.

### Cited Findings

**Camera choreography: flyTo / easeTo parameters**
- `flyTo` options (MapLibre, same algorithm as Mapbox): `curve` default 1.42 ("Higher values exaggerate zooming, lower values approach `Map.easeTo`, and `1` gives circular motion"); `speed` default 1.2 "screenfuls per second" relative to `curve` (if set, `screenSpeed` is ignored); `screenSpeed` is average speed in screenfuls/second assuming linear timing; `maxDuration` in ms; `minZoom` caps zoom-out of the arc; `padding` — [MapLibre FlyToOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FlyToOptions/)
- `AnimationOptions`: `duration` (ms), `easing` (function 0..1 -> 0..1), `offset` (PointLike, target center offset from container center), `animate` (false = no animation), `essential` (true = ignore reduced-motion preference), `freezeElevation` (default false; for 3D keeps camera at constant height above sea level, zoom recalculated after) — [MapLibre AnimationOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/AnimationOptions/)
- Map option limits: `pitch` 0 to 85 (default `maxPitch` 85), `maxZoom` default 22, `bearing` in degrees counter-clockwise from north — [Mapbox Map API](https://docs.mapbox.com/mapbox-gl-js/api/map/)
- Continuous orbit: `map.rotateTo((timestamp / 100) % 360, { duration: 0 })` inside `requestAnimationFrame`, started with `rotateCamera(0)` on a map with `pitch: 45` (approx. 10 degrees/sec) — [Mapbox: Animate camera around a point](https://docs.mapbox.com/mapbox-gl-js/example/animate-camera-around-point/)

**Free camera flythrough (Mapbox docs example, ports to MapLibre)**
- Example uses a target route (what the camera looks at) and a separate camera route, `turf.lineDistance()` precomputed, `animationDuration = 80000`, `cameraAltitude = 4000`, map `pitch: 65`, `bearing: -180`, `interactive: false`, terrain exaggeration 1.5, Mapbox GL JS v3.33.0 — [Mapbox: free camera path](https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/)
- Core loop:
  ```js
  function frame(time) {
    if (!start) start = time;
    const phase = (time - start) / animationDuration;
    if (phase > 1) setTimeout(() => { start = 0.0; }, 1500);
    const alongRoute  = turf.along(turf.lineString(targetRoute), routeDistance * phase).geometry.coordinates;
    const alongCamera = turf.along(turf.lineString(cameraRoute), cameraRouteDistance * phase).geometry.coordinates;
    const camera = map.getFreeCameraOptions();
    camera.position = mapboxgl.MercatorCoordinate.fromLngLat({lng: alongCamera[0], lat: alongCamera[1]}, cameraAltitude);
    camera.lookAtPoint({lng: alongRoute[0], lat: alongRoute[1]});
    map.setFreeCameraOptions(camera);
    requestAnimationFrame(frame);
  }
  ```
  — [Mapbox: free camera path](https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/)
- A second docs example ("Animate the camera around a point with 3D terrain") uses a `lerp` helper inside a rAF loop with FreeCamera — [Mapbox: free camera point](https://docs.mapbox.com/mapbox-gl-js/example/free-camera-point/)

**Mapbox blog: "Building Cinematic Route Animations with MapboxGL" (Impact Tools)**
- Route reveal uses `line-gradient` with a `step` on `line-progress`:
  ```js
  const animationPhase = (currentTime - startTime) / duration;
  map.setPaintProperty("line", "line-gradient", ["step", ["line-progress"], "yellow", animationPhase, "rgba(0, 0, 0, 0)"]);
  ```
  — [Mapbox blog: cinematic route animations](https://www.mapbox.com/blog/building-cinematic-route-animations-with-mapboxgl)
- Camera follow: `turf.lineDistance(path)` then `turf.along(path, pathDistance * animationPhase)` for the leading edge; altitude and pitch held constant; bearing `startBearing - animationPhase * 200`; camera position computed by trigonometry offsetting the target by bearing and `altitude / tan(pitch)` (approximate 70 km/deg lon, 110 km/deg lat, "only accurate for France"); target smoothed with lerp `(1 - amt) * start + amt * end` to avoid jerks at sharp turns; intro fly-in is a custom globe-to-track transition rather than `flyTo()`; `line-trim-offset` is not used — [Mapbox blog: cinematic route animations](https://www.mapbox.com/blog/building-cinematic-route-animations-with-mapboxgl)
- Code lives in `github.com/mapbox/impact-tools` (folder `journey-animation-sequence`, with `js/fly-in-and-rotate.js` and `js/animate-path.js`, `runme.js`, GeoJSON stages in `data/`, steps sequenced with async/await; query params `prod`, `square` 1080x1080) — [mapbox/impact-tools journey-animation-sequence](https://github.com/mapbox/impact-tools/tree/master/journey-animation-sequence); [Mapbox blog](https://www.mapbox.com/blog/building-cinematic-route-animations-with-mapboxgl)
- Video export: capture on `render` event, advance time by 1000/60 ms per frame, `gl.readPixels` into mp4-encoder; reference `debug/video-export.html` in mapbox-gl-js — [Mapbox blog](https://www.mapbox.com/blog/building-cinematic-route-animations-with-mapboxgl)

**Line draw-in by incremental coordinates (official examples)**
- Mapbox "Animate a line": empty LineString `coordinates: [[0,0]]`, layer with `line-cap: round`, `line-join: round`, `line-width: 5`, `line-opacity: 0.8`; each frame pushes a coordinate and calls `map.getSource('line').setData(geojson)`; handles pause via `cancelAnimationFrame` and `visibilitychange` to reset `startTime` ("requestAnimationFrame also pauses on hidden tabs by default") — [Mapbox: Animate a line](https://docs.mapbox.com/mapbox-gl-js/example/animate-a-line/)
- MapLibre ships the same "animate a line" example and an "animate a point along a route" example that uses Turf to move a point along the line's length — [MapLibre: animate a line](https://maplibre.org/maplibre-gl-js/docs/examples/animate-a-line/); [MapLibre: animate a point along a route](https://maplibre.org/maplibre-gl-js/docs/examples/animate-a-point-along-a-route/)
- MapLibre official gradient example colors a line by distance from start with `line-gradient` and `line-progress` — [MapLibre: gradient line](https://maplibre.org/maplibre-gl-js/docs/examples/line-gradient/)
- `line-progress` is 0 at the line start and 1 at the end and can only be used in `line-gradient` — [MapLibre Native line-progress](https://maplibre.org/maplibre-native/android/api/-map-libre%20-native%20-android/org.maplibre.android.style.expressions/-expression/line-progress.html)
- Community: a Val Town project wraps a "sliding line-gradient" effect for MapLibre/Mapbox with no other dependencies — [val.town ml-line-animation](https://www.val.town/x/pql/ml-line-animation)

**Turf helpers**
- `turf.lineSliceAlong(line, startDist, stopDist, {units: 'kilometers'})` returns `Feature<LineString>`; standalone package `@turf/line-slice-along` (v7.4.0 docs) — [Turf lineSliceAlong](https://turfjs.org/docs/api/lineSliceAlong)
- `turf.along(line, distance)` returns the point at a distance along the line; `turf.lineDistance`/`length` gives total length — [Mapbox: free camera path](https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/)

**Other showcases / React-oriented examples**
- Remotion docs: MapLibre + Turf pattern where the camera zooms out from one city and follows a line to another; recommends `npm i --save-exact maplibre-gl @turf/turf`, turning off built-in interaction and fade animations for frame-accurate rendering — [Remotion maps](https://www.remotion.dev/docs/maps)
- RouteVideo (React, Vite, MapLibre, Turf, Remotion) notes: update sources per frame with `setData()` and move the camera with `jumpTo()` or `calculateCameraOptionsFromTo()` rather than MapLibre's easing — [skills.cat routevideo](https://skills.cat/skills/equilibriumpress/routevideo)
- MapTiler SDK (a MapLibre extension, needs a MapTiler key): `AnimatedRouteLayer` with animated color transitions, optional camera following, playback controls; "3D cinematic path" example with a camera that follows the journey; June 2026 post lists prologue/epilogue camera moves and waypoint markers — [MapTiler animated route](https://docs.maptiler.com/sdk-js/examples/animated-route/); [MapTiler cinematic path](https://docs.maptiler.com/sdk-js/examples/3d-js-cinematic-path/); [MapTiler AnimatedRouteLayer API](https://docs.maptiler.com/sdk-js/api-reference/classes/AnimatedRouteLayer/); [MapTiler news June 2026](https://www.maptiler.com/news/2026/06/animated-routes-on-maps)
- flightcn `FlightRoute` shadcn-style React component built on maplibre-gl + `@turf/great-circle` + `@turf/bearing` (install requires a 21st.dev key) — [21st.dev FlightRoute](https://21st.dev/@ridemountainpig/components/flightcn-flight-route.md)

### Inferences
- Recommended MapLibre route-reveal recipe for React: fetch route once, add GeoJSON source with `lineMetrics: true`, add two line layers (a dim "casing" full route and a bright "progress" layer), and in a rAF loop call `map.setPaintProperty('route-progress', 'line-gradient', ['step', ['line-progress'], color, phase, 'rgba(0,0,0,0)'])`. This avoids re-tessellating geometry each frame (unlike `setData`) and is GPU-cheap; the trade-off is a hard edge, which can be softened by using `interpolate` with a short ramp (phase - 0.02 to phase).
- For a glowing leading edge, combine the gradient step with `turf.along(route, length * phase)` to drive a pulsing symbol/circle at the head, and `easeTo({center: head, duration: 0})` or FreeCamera for follow-cam.
- Use `flyTo` with `curve` ~1.2 to 1.42 and `speed` ~0.8 to 1.2 for the intro, `easeTo` with a custom cubic easing for pitch/bearing reveals, and `essential: true` only for non-decorative moves so `prefers-reduced-motion` is honored.

### Gaps
- No verified GitHub repo for a pure-MapLibre 3D flythrough showcase was found; the strongest open code is Mapbox's impact-tools (Mapbox token required) and the Remotion/RouteVideo patterns.
- I did not fetch the raw source of `fly-in-and-rotate.js`/`animate-path.js`, so their exact durations, altitude and pitch constants are not recorded.
- No Awwwards/Codrops map-specific articles surfaced in searches; not covered.

---

## Key question 3: Pulsing user-location dot, destination marker pulse, 3D buildings, clustering, label tuning, and 60fps on mobile

### Takeaway
The official pattern for a pulsing dot in both libraries is a runtime canvas image implementing `StyleImageInterface` (`onAdd`/`render` returning true + `map.triggerRepaint()`) used by a symbol layer, which stays on the GPU path; HTML `Marker`s with CSS keyframes are fine for one or two markers but scale poorly. 3D buildings are a `fill-extrusion` layer inserted before the first symbol layer; clusters use `cluster: true` + `getClusterExpansionZoom` + `easeTo`.

### Cited Findings

**Pulsing dot**
- MapLibre/Mapbox "Add an animated icon": define an object with `width`, `height`, `data`, `onAdd` (create an offscreen canvas + 2D context) and `render` (compute phase from `performance.now()`, draw expanding translucent outer circle and solid inner circle, copy pixels into `data`, call `map.triggerRepaint()`, return `true`); register with `map.addImage('pulsing-dot', pulsingDot, {pixelRatio: 2})`, add a GeoJSON point source and a symbol layer with `icon-image: 'pulsing-dot'` — [MapLibre: add an animated icon](https://maplibre.org/maplibre-gl-js/docs/examples/add-image-animated/); [Mapbox: add-image-animated](https://docs.mapbox.com/mapbox-gl-js/example/add-image-animated)
- MapLibre 5.23 added numeric `Marker` opacity and a "covered" CSS class when a marker is occluded by terrain or globe — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- Mapbox performance guidance: use symbol layers for 100+ markers (GPU-accelerated) and clustering for 10,000+ features; avoid HTML markers at scale; reuse popup instances — [Mapbox web performance patterns (skill doc)](https://mcpservers.org/de/agent-skills/mapbox/mapbox-web-performance-patterns)

**3D buildings (fill-extrusion)**
- MapLibre example uses source `openfreemap` at `https://tiles.openfreemap.org/planet`, `source-layer: 'building'`, layer `3d-buildings`, `minzoom: 15`, filter `['!=', ['get', 'hide_3d'], true]`, `fill-extrusion-color` interpolated on `render_height` (0 lightgray, 200 royalblue, 400 lightblue), `fill-extrusion-height` interpolated on zoom (0 at z15, `render_height` at z16), `fill-extrusion-base` (0 at z15, `render_min_height` at z16); inserted with `beforeId` = first layer where `type === 'symbol'` and `layout['text-field']` is set — [MapLibre: display buildings in 3D](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/)
- Mapbox Standard renders buildings "extruded with detailed lighting effects"; toggle via `show3dObjects` — [Mapbox Standard](https://docs.mapbox.com/map-styles/standard)

**Clustering with animated zoom**
- MapLibre cluster example: GeoJSON source with `cluster: true`, `clusterMaxZoom: 14`, `clusterRadius: 50` (also the default); `clusters` circle layer filtered on `point_count` with `step` color/radius (20/30/40 px at <100, 100-749, 750+); `cluster-count` symbol with `point_count_abbreviated`; `unclustered-point` 4 px circles; click handler reads cluster id, calls `getClusterExpansionZoom`, then `map.easeTo({center, zoom})` — [MapLibre: create and style clusters](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/)
- MapLibre 6.1 added `getClusterOptions`; 6.12 shipped several clustering fixes; 5.10 fixed a recluster bug — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)

**Label fade and collision tuning**
- Symbol layer: `icon-allow-overlap` (default false), `icon-overlap` enum `never|always|cooperative` (overrides `icon-allow-overlap`), `icon-ignore-placement` (default false), `icon-optional`, `symbol-sort-key` (lower keys placed first when overlap disallowed; drawn on top when allowed), `symbol-z-order` `auto|viewport-y|source`, `text-variable-anchor` (try anchors in order; pair with `text-justify: auto` and `text-radial-offset`), `symbol-avoid-edges` (unneeded with global collision detection, GL JS 0.42.0+) — [MapLibre style spec: layers](https://maplibre.org/maplibre-style-spec/layers/#symbol)
- Map-level `fadeDuration` (default 300 ms) controls label collision fade; a 2026 OSM website review set `fadeDuration: 0` on a minimap with the reviewer noting "in production, we would want this for better performance" (a suggestion, not a benchmark) — [MapLibre MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions); [OSM minimap migration PR discussion](https://lists.openstreetmap.org/pipermail/rails-dev/2026-January/046540.html)
- Mapbox v3 added `icon-image-cross-fade` — [Mapbox: Migrate to v3](https://docs.mapbox.com/mapbox-gl-js/guides/migrate-to-v3/)

**Performance / 60fps**
- MapLibre 6.0 feature-state storage is array-based, "up to 3.4x faster"; 6.13/6.7 symbol placement speedups; 5.24 single-pass halo+glyph and skipped fog at zero opacity — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- MapLibre 5.13/5.14: GeoJSON `updateData` (partial updates) and worker performance improvements; 5.20: updateable GeoJSON-VT — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md)
- Mapbox guidance: use feature state for hover/selection instead of rebuilding layers; GeoJSON for datasets under 5 MB, vector tiles over 20 MB; set layer `minzoom`/`maxzoom`; mobile tweaks such as circle layers and disabled rotation; call `map.remove()` on cleanup; measure FPS by counting `render` events per second with a 60 FPS pan/zoom target — [Mapbox web performance patterns](https://mcpservers.org/de/agent-skills/mapbox/mapbox-web-performance-patterns)
- Mapbox "Animate a line" notes that `requestAnimationFrame` pauses on hidden tabs and resets its timer on `visibilitychange` — [Mapbox: Animate a line](https://docs.mapbox.com/mapbox-gl-js/example/animate-a-line/)
- MapLibre `reduceMotion` map option (5.12) and `flyTo` reduced-motion fix (6.14) — [MapLibre CHANGELOG](https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/CHANGELOG.md); [OSM bump 5.11 to 5.12](https://lists.openstreetmap.org/pipermail/rails-dev/2025-November/045046.html)

### Inferences
- For a "you are here" dot plus a single destination pin, two approaches are both viable: (1) `StyleImageInterface` canvas image in a symbol layer (GPU, moves with terrain/globe correctly, one `triggerRepaint` per frame); (2) `maplibregl.Marker` with a CSS `@keyframes` ring (no map repaint cost at all, GPU-composited by the browser, but can be covered by terrain/globe, which 5.23's "covered" class helps hide). For a dark premium look, option 1 keeps the dot under labels and respects `pitch`.
- Keep layer count low on mobile: a dark basemap (approx. 50 to 100 layers in OpenFreeMap Dark), one fill-extrusion layer with `minzoom: 15`, two route line layers, one cluster trio, one symbol layer for markers. Set `fadeDuration: 0` or a small value if label pop-in is acceptable, and prefer `line-gradient` animation over per-frame `setData`.
- In React, keep the map instance in a `useRef`, do all per-frame work (`setPaintProperty`, `setFeatureState`, `setFreeCameraOptions`) imperatively inside a rAF loop, and never route frame-rate state through `useState`.

### Gaps
- No published benchmarks for mobile FPS vs layer count or for `fadeDuration: 0` were found.
- The `text-*` collision properties (`text-allow-overlap`, `text-padding`, `text-optional`) were truncated in the style-spec fetch; they exist but defaults were not captured.

---

## Key question 4: Which React wrappers are recommended for performance in 2025 to 2026 and why

### Takeaway
react-map-gl v8.1.1 (vis.gl) with the `react-map-gl/maplibre` entry point (or the equivalent `@vis.gl/react-maplibre` 8.1.1 package) is the mainstream choice; use uncontrolled `initialViewState`, `reuseMaps` where maps remount, and keep animations imperative via the map ref. maplibre-react-components could not be verified via search in this run.

### Cited Findings
- react-map-gl v8.0.0 split each map library into its own endpoint (`react-map-gl/mapbox`, `react-map-gl/mapbox-legacy` for mapbox-gl v1, `react-map-gl/maplibre`); the MapLibre wrapper targets maplibre-gl 4+ and is "expected to outperform v7 by using an upstream API for the React use case"; the v8.1.0 camera-sync rewrite affected only the Mapbox wrapper; v8.0.4 (Apr 15 2025) reverted a source-loading change; current version 8.1.1 — [react-map-gl package metadata](https://cdn.jsdelivr.net/npm/react-map-gl@8.1.1/package.json); [react-map-gl on yarn](https://classic.yarnpkg.com/en/package/react-map-gl); [react-map-gl get started](https://visgl.github.io/react-map-gl/docs/get-started)
- `@vis.gl/react-maplibre` is published at 8.1.1 as "React components for Maplibre GL JS" — [jsDelivr @vis.gl/react-maplibre](https://www.jsdelivr.com/package/npm/@vis.gl/react-maplibre)
- Import patterns: maplibre-gl v4/v5 `import maplibregl from 'maplibre-gl'`; v6 `import * as maplibregl from 'maplibre-gl'` or named imports; v6 apps with a bundler must configure the MapLibre worker (Vite `?worker&url` example in docs) — [react-map-gl get started](https://visgl.github.io/react-map-gl/docs/get-started)
- State management: uncontrolled via `initialViewState` (map manages camera, "works much like the mapbox-gl Map class"); controlled via spread `viewState` + `onMove={evt => setViewState(evt.viewState)}`; controlled mode is suggested only when other components must interact with the map or for custom input logic — [react-map-gl state management](https://visgl.github.io/react-map-gl/docs/get-started/state-management)
- `reuseMaps` keeps the map instance alive across unmount/remount for apps with tabs or collapsible panels; only reactive props and `initialViewState` are respected on reuse — [react-map-gl on yarn](https://classic.yarnpkg.com/en/package/react-map-gl)
- maplibre-gl 6.0.0 is ESM-only with ES2022 target, which the release notes say yields smaller bundles and better runtime performance; older tooling may need transpilation — [OSM website bump maplibre-gl 5.24 to 6.0](https://lists.openstreetmap.org/pipermail/rails-dev/2026-July/051237.html)
- Other wrappers surfaced: `react-maplibre-ui` (fork of react-mapbox-ui, "minimal layer of abstraction"), `react-map-components-maplibre` (declarative component library) — [react-mapbox-ui npm](https://npmjs.com/package/react-mapbox-ui); [npm user cioddi](https://www.npmjs.com/~cioddi)

### Inferences
- For a route-reveal app, the cheapest path is react-map-gl/maplibre in uncontrolled mode: `<Map initialViewState mapStyle reuseMaps>` plus `<Source>`/`<Layer>` for static layers, and a `useRef`/`useMap()` handle for the rAF loop. Controlled mode forces a React render on every `onMove` event (dozens per second during a flyTo), so avoid it during cinematic sequences.
- Raw refs (no wrapper) remain a valid choice when the component tree is simple; the wrapper's main value is declarative `<Layer>` diffing and lifecycle cleanup.

### Gaps
- maplibre-react-components (pentatrion): both the docs host and the GitHub URL I tried failed (DNS error / 404) and npm search did not surface it, so I cannot confirm its current status, version, or performance claims.
- No published side-by-side benchmarks of react-map-gl vs raw maplibre-gl were found.

---

## Key question 5: Keyless / free vector tile and style sources, and which have the best dark styles

### Takeaway
OpenFreeMap is the only fully keyless, no-limits option and ships a "Dark" style at `https://tiles.openfreemap.org/styles/dark` (OpenMapTiles dark-matter fork, Noto Sans); Protomaps offers "dark" and "black" flavors via `@protomaps/basemaps` but its hosted API needs a key (soft cap ~1M tiles/month, non-commercial or sponsorship); VersaTiles has a public keyless server with an "eclipse" style; Stadia and MapTiler free tiers are keyed and non-commercial.

### Cited Findings
- OpenFreeMap: six default styles (Positron, Bright, Liberty, Dark, Fiord, 3D); "no limits on the number of map views or requests"; no registration, no API keys, no cookies; MIT licensed; commercial use allowed; attribution to OpenMapTiles and OpenStreetMap required (MapLibre adds it automatically); no SLA; funded by donations; weekly planet downloads for self-hosting; offline download limit 3,000 tiles or 50 MB per download, 4 parallel requests — [openfreemap.org](https://openfreemap.org/)
- OpenFreeMap Dark is a fork of the OpenMapTiles dark-matter style served at `tiles.openfreemap.org/styles/dark`, unmodified except fonts set to Noto Sans; the upstream OpenMapTiles styles are described as abandoned upstream — [niyamaka/openfreemap-styles](https://github.com/niyamaka/openfreemap-styles)
- OpenFreeMap vector source for buildings: `https://tiles.openfreemap.org/planet`, `source-layer: building`, with `render_height`/`render_min_height`/`hide_3d` attributes — [MapLibre: display buildings in 3D](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/)
- Protomaps basemap flavors: light, dark, white, grayscale, black (white/grayscale/black are for data viz); npm `@protomaps/basemaps` with `namedFlavor("dark")` spreadable for overrides — [Protomaps flavors](https://docs.protomaps.com/basemaps/flavors)
- Protomaps hosted API: API key required; light-to-medium users get a "demo API with a soft limit of 1,000,000 tile requests per month"; commercial use requires a GitHub Sponsorship; no standard paid plans; heavy users may be asked to self-host (PMTiles) — [Protomaps about](https://protomaps.com/about); [Protomaps FAQ](https://protomaps.com/faq); [Protomaps: other](https://protomaps.com/other)
- VersaTiles runs a free public vector tile server at `tiles.versatiles.org` with pre-built styles including all URLs for tiles, fonts and icons; the `@versatiles/style` library exposes `colorful`, `eclipse`, `graybeard`, `neutrino`, `shadow` style generators and a `guessStyle` helper — [VersaTiles: use tiles.versatiles.org](https://docs.versatiles.org/guides/use_tiles.versatiles.org.html); [versatiles-style docs](https://versatiles.org/versatiles-style/index.html)
- Stadia Maps free plan: 200,000 credits/month (a standard vector basemap tile costs 1 credit, forward geocoding 20), "Standard basemaps", "Basic APIs only", no commercial use — [Stadia pricing](https://stadiamaps.com/pricing/)
- MapTiler Cloud free plan: 100k API requests/month (a 512px rendered tile counts as 4), 5k map sessions, 1 API key, 5 custom styles, MapTiler logo on the map, "Suitable for testing, PoC, prototyping, personal, or non-commercial use", service pauses when quota exceeded — [MapTiler pricing](https://www.maptiler.com/cloud/pricing/)
- MapTiler SDK is "an extension of MapLibre GL JS" (its animated route and cinematic examples require MapTiler) — [MapTiler cinematic path](https://docs.maptiler.com/sdk-js/examples/3d-js-cinematic-path/)

### Inferences
- Best keyless dark pick for production: OpenFreeMap Dark (dark-matter lineage, truly no key, commercial OK), optionally re-tinted at runtime with `setPaintProperty` on `background`, `water`, `building` layers for a bespoke palette. Pair with OpenFreeMap's `planet` source for 3D buildings since the attribute names are documented in the MapLibre example.
- Protomaps "black"/"dark" flavors give a cleaner, more minimal data-viz look (fewer POIs), which often reads as more "premium", but require a key or self-hosted PMTiles.
- VersaTiles "eclipse" is likely the dark style (name suggests it) but I could not fetch a style listing confirming its palette.

### Gaps
- VersaTiles: the `tiles.versatiles.org` landing fetch returned only a logo; the exact style JSON URLs, dark confirmation, and usage policy were not captured.
- Stadia's "Alidade Smooth Dark" availability on the free plan and its domain-based (keyless for localhost) auth were not confirmed from the pricing page.
- MapTiler's dark style names (e.g., "Dataviz Dark") were not confirmed on the pricing page.
- Protomaps pricing page returned 404; the 1M soft cap comes from the About page and may be stale.

---

## Key question 6: Free routing APIs returning a GeoJSON route line (walking and driving), with limits and terms

### Takeaway
OSRM's demo server (`router.project-osrm.org`, profiles car/foot/bike, `geometries=geojson`, max 1 req/s, non-commercial) and FOSSGIS Valhalla (`valhalla1.openstreetmap.de`, fair-use, ~1 call/user/s per secondary sources) are keyless; OpenRouteService (2,000 directions/day, 40/min, free key), GraphHopper (500 credits/day, non-commercial, key) and Mapbox Directions (100k requests/month free, token) are keyed.

### Cited Findings
- OSRM demo server: usage "restricted to reasonable, non-commercial use-cases"; keep requests to no more than one per second; no uptime/latency/data-update guarantees; profiles car, foot, bike (which differ from default osrm-backend profiles); endpoints `router.project-osrm.org` or `routing.openstreetmap.de`; example `https://router.project-osrm.org/route/v1/driving/...` with `geometries=geojson` — [OSRM demo server wiki](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server)
- Valhalla public instance: FOSSGIS e.V. hosts a demo server with a full planet graph; usage follows "the usual fair-usage policy as OSRM & Nominatim demo servers (somewhat enforced by rate limits)"; HTTP API on e.g. `https://valhalla1.openstreetmap.de/`; a CRAN vignette quotes "1 call/user/sec and 100 calls/sec total" from a Valhalla GitHub discussion (secondary source, unverified) — [valh package README](https://ftp.fau.de/cran/web/packages/valh/readme/README.html); [valh install vignette](https://mirror.las.iastate.edu/CRAN/web/packages/valh/vignettes/install-valhalla.Rmd)
- OpenRouteService Standard (free, EUR 0) plan: Directions 2,000/day and 40/min; Isochrones 500/day, 20/min; Matrix 500/day, 40/min; Collaborative plan 10,000/day and 60/min for humanitarian/academic/governmental/non-profit users — [openrouteservice plans](https://openrouteservice.org/plans/); a third-party listing claiming Standard needs a paid subscription conflicts with the official page — [apis.io ORS plans](https://apis.io/plans/openrouteservice/openrouteservice-plans-pricing/)
- GraphHopper free plan: 500 credits/day, "limited credit count per minute" (unspecified), non-commercial only, max 5 locations and 1 vehicle per request, forum support, no SLA, no flexible mode (`ch.disable=true`), limited vehicle profiles, no credit card required — [GraphHopper pricing](https://www.graphhopper.com/pricing/)
- Mapbox Directions API: free up to 100,000 monthly requests, then $2.00 per 1,000 for 100,001 to 500,000 — [Mapbox pricing](https://www.mapbox.com/pricing)
- Geofabrik hosted OSRM/GraphHopper is paid: Small plan 100,000 requests/month for EUR 40/month; Geofabrik can also run Valhalla and BRouter — [Geofabrik routing](https://www.geofabrik.de/en/data/routing.html)
- OSM Help answer: "any solution that depends on using someone else's server free of charge will not scale" — [OSM help: distance timing API](https://help.openstreetmap.org/questions/76337/distance-timing-api)

### Inferences
- For a prototype: OSRM demo (`/route/v1/{driving|foot|bike}/{lon,lat;lon,lat}?overview=full&geometries=geojson`) returns `routes[0].geometry` as a GeoJSON LineString directly; Valhalla returns an encoded polyline6 shape by default and needs decoding (not verified in this run, see Gaps). ORS can return GeoJSON via its `/v2/directions/{profile}/geojson` endpoint (from general knowledge; not verified here).
- For production, ORS (2k/day) or Mapbox Directions (100k/month) are the only options with explicit written quotas suitable for a public app; OSRM/Valhalla demos are explicitly non-commercial/fair-use.

### Gaps
- Valhalla's official FOSSGIS usage policy page was not found; the rate-limit numbers are second-hand.
- ORS GeoJSON endpoint format and Valhalla polyline encoding were not verified in this run.
- OSRM demo server wiki links to German-language full policy; not read.
