# Interaction and animation patterns of best-in-class consumer map apps (Citymapper, Uber, Lyft, Apple Maps, Google Maps, Waze, Transit, Strava)

Scope note for the report writer: public sources describe *what* these apps show and in what order far more often than they give durations, easings, or snap heights. Official Uber/Citymapper/Transit/Waze/Strava engineering or design posts about map motion specifically were not found (searched Uber Eng/Base, Citymapper blog, Transit blog, Waze blog, Strava press). Where numbers appear below they come from platform APIs (Apple UISheetPresentationController, Mapbox/MapLibre examples) or from third-party reproductions, and are labelled as such. Treat every "duration/easing" line as either platform-default or reconstruction, never as a measured value from the shipping app.

## Key question 1: What happens, step by step, when the user taps the primary action, from press to route shown?

### Takeaway
Across all eight apps the primary action is a single, labelled, bottom-anchored entry point ("Where to?", "Get Me Somewhere", a floating Directions button) that opens a destination entry surface; after a destination is chosen the sheet collapses to a partial height, the map re-frames to fit origin+destination, and a route line plus transport-mode row appear. No source gave measured camera durations or easing curves for any of the shipping apps; those details must be reconstructed from platform defaults.

### Cited Findings

**Uber**
- Uber's February 2023 redesign kept the "Where to?" prompt as the home screen's primary cue; tapping it brings up saved destinations and personalised suggestions based on past trips, and the app lets riders switch between rides and deliveries with one tap — [RideGuru](https://ride.guru/content/newsroom/ubers-new-redesign-explained); [Mobile Marketing Magazine](https://mobilemarketingmagazine.com/uber-redesigns-app-focusing-on-a-single-question/)
- A Pratt design critique credits the "Where to" search box as a clear cue for entering a destination and praises the home page's simplicity; recent trip history provides repeat destinations without typing — [IXD@Pratt, Uber critique (2023)](https://ixd.prattsi.org/2023/09/design-critique-uberiphone-ios-app/)
- The 2016 redesign replaced the map-first home page with a single question ("Where to?"); Uber later acknowledged feature bloat and the 2023 refresh aimed to re-simplify — [Mobile Marketing Magazine](https://mobilemarketingmagazine.com/uber-redesigns-app-focusing-on-a-single-question/)
- Uber uses a bottom sheet to display trip pricing after destination entry (cited as the canonical example in an iOS tutorial) — [AppCoda](https://www.appcoda.com/learnswiftui/swiftui-bottom-sheet-presentationdetents.html)
- Since iOS 16 the Uber app pushes trip status (vehicle details, latest ETA, trip status) to Live Activities / Dynamic Island so the ride can be tracked off-screen — [RideGuru](https://ride.guru/content/newsroom/ubers-new-redesign-explained)
- A 2015 Pratt review describes the ride-tracking phase: the black car icon visibly turns corners and pulls up to the pickup pin while the minutes-to-arrival figure updates continuously on screen — [IXD@Pratt, Uber 2.58 review](https://ixd.prattsi.org/2015/02/uber-ios-application-version-2-58-good-design/)

**Lyft**
- Lyft's 2019 rider redesign reduced booking to three taps: add a destination, choose a car type, request. Key interactions sit at the bottom for one-handed thumb reach; secondary info lives in an expanding panel; custom markers show cars, pickup points, venues and branded events; route lines are drawn on top of the map; custom Google Maps styling highlights transit stops, POIs and buildings in brand colours — [Core77 Design Awards, Lyft Rider App Redesign](https://designawards.core77.com/Interaction/87383/Rider-App-Redesign)
- Lyft Maps (2023) stripped "the distracting clutter of irrelevant stores, restaurants, and nearby destinations" from the base map and added a photo of the pickup area for drivers — [Lyft blog, May 2023](https://www.lyft.com/blog/posts/lyfts-secret-plan-to-take-control-of-its-maps-and-its-future)
- An Android update coloured the car markers to match the real car and oriented them to direction of travel — [electronic.partners](https://electronic.partners/news/lyft-app-update-adds-car-color-and-directions-to-its-digital-map/)

**Citymapper**
- Home screen: labelled "Get Me Somewhere" search bar at the top, Home / Work / Places shortcuts directly beneath it, mode icons (bus, rail, ferry, walking) below that; the shortcuts let users start trips without re-entering addresses ("recognition rather than recall") — [IXD@Pratt, Citymapper iOS critique (Feb 2026)](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/); [IXD@Pratt, Citymapper critique (Sep 2026)](https://ixd.prattsi.org/2026/09/design-critique-citymapper/)
- After search, results are filterable by Classic / Walk Less / Turbo / Price, and "Step-Free" is a primary control rather than a buried setting; a single tap re-sorts all options — [IXD@Pratt (Feb 2026)](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/); [screensdesign showcase](https://screensdesign.com/showcase/citymapper-all-live-transit)
- Route list shows about 5 options ranked by speed, cost and transfers, colour-coded by mode (green bus, blue subway, orange bike) so a 3-leg journey reads at a glance (2025 user review) — [Capterra](https://www.capterra.com/p/235508/Citymapper/)
- Citymapper lets you choose a transport mode *before* entering a journey, unlike Google Maps which requires a journey first — [Econsultancy (Dec 2018)](https://econsultancy.com/six-features-to-appreciate-about-citymappers-ux/)
- GO mode: turn-by-turn for transit, walking, cycling and scooter trips; step-by-step directions include live bus times, an alarm when it's time to get off, the best subway exit, and a 3D "follow yourself" map for walking/cycling that points the map in the right direction — [APKMirror release notes 10.16](https://www.apkmirror.com/apk/citymapper-limited/citymapper/citymapper-10-16-release/); [APKMirror 10.17.1](https://www.apkmirror.com/?p=1492451)
- During GO the interface updates with the user's movement via countdowns, live arrival times, stop counts and "Get off now" prompts; the critique says feedback stays contextual and does not overwhelm — [IXD@Pratt (Feb 2026)](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/)
- Criticism: the "Leave: Now" time picker is a small low-contrast button top-right over the map and is easy to miss; disruption alerts are system-wide rather than tied to the user's route — [IXD@Pratt (Feb 2026)](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/); [IXD@Pratt (Sep 2026)](https://ixd.prattsi.org/2026/09/design-critique-citymapper/)

**Google Maps**
- Directions redesign (Android 11.113.x, first seen Feb 2024; wide Android rollout July 2024; iPhone 25.10.2 on 7 Mar 2025): destination entry is still a full-screen page; once origin/destination are set they appear in a floating rectangle at the top; the transport-mode carousel moved to the bottom of the screen for reachability; the results card no longer fills the screen and leaves a sliver of map visible at the top; swiping the sheet up reveals more map — [9to5Google, Feb 2024](https://9to5google.com/2024/02/07/google-maps-directions-search-redesign/); [9to5Google, Mar 2025](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/); [MobileSyrup](https://mobilesyrup.com/2024/02/09/google-maps-minor-redesign-improves-reachability/); [PhoneArena](https://www.phonearena.com/news/google-maps-rolling-out-one-minor-ui-change-that-should-make-it-easier-to-use_id160422)
- Place sheets: tapping a place opens a sheet with close (x) and share in the top-right; a second "background sheet" is visible behind the active one; corners are more rounded; even fully expanded, a strip of map stays visible behind the status bar; the left back button in the search bar was removed (the article says this matches Apple Maps) — [9to5Google, Mar 2025](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/); [9to5Google, Feb 2024](https://9to5google.com/2024/02/07/google-maps-directions-search-redesign/)

**Apple Maps**
- iOS 26 (released 15 Sep 2025): search bar and navigation menu are translucent Liquid Glass with the map showing through; place icons are larger; cards/menus/buttons have larger corner radii; turn-by-turn directions appear in a smaller pop-up bar instead of a full-width top banner, with arrival time, travel time and distance more prominent; a floating Directions button is always visible bottom-right on place cards; an incident-report button appears on the right during navigation — [MacRumors iOS 26 Maps guide](https://www.macrumors.com/guide/ios-26-maps); [MacRumors release](https://www.macrumors.com/2025/09/15/apple-releases-ios-26/)
- Apple Maps sheet behaviour (as reproduced by Expo): three detents at 0.1 / 0.5 / 1.0 of screen height, initial detent 0.1; at the lowest detent the sheet "floats" above the bottom edge with a visible gap and fully rounded corners; at the middle detent the gap tightens and the radius adjusts; at the top detent the gap disappears and it behaves like a full sheet; drag-to-dismiss disabled (`gestureEnabled: false`); grabber visible; content background must be transparent for the glass to show through — [Expo blog, "Apple Maps style liquid glass sheets"](https://expo.dev/blog/how-to-create-apple-maps-style-liquid-glass-sheets)
- Apple's Maps implementation is routinely cited as the reference for the grabber that signals draggability, and Maps is one of the system apps built on UISheetPresentationController — [Sarunw](https://sarunw.com/posts/bottom-sheet-in-ios-15-with-uisheetpresentationcontroller/); [Donny Wals](https://donnywals.com/presenting-a-bottom-sheet-in-uikit-with-uisheetpresentationcontroller)

**Waze**
- No 2024-2026 redesign coverage was found. The last documented major redesign (Waze 4.0, Oct 2015) introduced a cleaner map, colour-coded reports, a bottom-left navigation button, and a single bottom panel that slides up to combine ETA, alternate routes, add-a-stop and share-ETA; reporting became full-screen colour-coded buttons to cut taps — [TechCrunch, 2015](https://techcrunch.com/2015/10/19/navigation-app-waze-gets-a-huge-redesign-now-less-cluttered-but-still-needs-improvement); [9to5Mac, 2015](https://9to5mac.com/2015/10/19/waze-ios-app-redesign/); [PhoneArena](https://www.phonearena.com/news/Waze-4.0-brings-redesign-and-better-battery-life_id74867)
- Waze's 2011 iOS redesign was a "minimalist UI with two large main buttons on a full screen map" — [iClarified](https://www.iclarified.com/17391/waze-gps-for-ios-gets-a-complete-redesign)

**Transit**
- Transit 5.0 (Aug 2018): home screen search bar moved lower for thumb reach; tapping any line on the home screen opens a unified route screen with the next three departures, expandable schedules and a route map with live vehicle locations; trip planning gained a dynamic progress bar — [iPhone in Canada](https://www.iphoneincanada.ca/2018/08/31/transit-app-gets-major-redesign/)
- A 2026 mobile-system-design guide names Transit, Citymapper, Moovit and Apple Maps Transit as references and states real-time vehicle positions are animated client-side between samples — [techinterview.org](https://www.techinterview.org/post/3233475339/mobile-system-design-public-transit-real-time/?format=md)

**Strava**
- Record redesign (Android first, July 2025; iOS later that summer): map and live stats share one screen instead of toggling; key metrics (pace, time, distance) are overlaid on the map; splits update in real time; sport and route selection are more prominent on the pre-start screen; a new map rendering engine with more detail; one outlet describes "sleek, dark maps" with real-time data overlays — [the5krunner](https://the5krunner.com/2025/07/16/strava-app-redesign/); [BikeRadar](https://www.bikeradar.com/news/strava-redesigned-record-feature); [Advnture](https://www.advnture.com/tech/apps-software/no-more-switching-between-screens-strava-updates-record-function-for-a-smoother-and-smarter-experience); [T3](https://www.t3.com/active/stravas-latest-update-fixes-a-problem-you-didnt-know-you-had)
- Reviewer verdict: "an improvement" but "ranks low on the excitement scale" — [the5krunner](https://the5krunner.com/2025/07/16/strava-app-redesign/)

### Inferences
- The common sequence (inferred from the findings above, not from a single source): (1) map-first home with a labelled CTA near the thumb; (2) tap -> full-screen or near-full destination entry with recents/saved places first; (3) selection -> entry surface collapses, sheet settles at a partial detent (Apple: 0.5 of screen; Google: card with "sliver of map" at top), camera fits origin+destination, route line and mode row appear; (4) confirm -> sheet shrinks to a peek, camera switches to follow/heading-up, chrome reduces to a compact ETA bar.
- Google Maps' and Apple Maps' convergence on "never fully cover the map" (status-bar sliver, floating detent gap) suggests the map peeking through is now the expected norm, so a web implementation should cap its top detent below 100%.

### Gaps
- No source gave measured camera animation durations, easing curves, or line-draw timings for any shipping app. Teardown sites named in the brief (Mobbin, Page Flows, Screenlane, Growth.Design, Built for Mars) did not surface frame-by-frame breakdowns of these flows in search; Built for Mars' Uber page lists only "UX Bites" behind a paywall ([Built for Mars](https://builtformars.com/company/uber)).
- No official Uber Engineering or Uber Design (Base) post on map motion was found; Base Web's theming page (which should list timing/easing tokens) returned empty on fetch, so Base motion tokens are unconfirmed. An unofficial "inspired by Uber" plugin lists 150 ms / 200 ms / cubic-bezier(0.2,0,0,1) but is explicitly not Uber's ([open-design.ai](https://open-design.ai/plugins/design-system-uber/)).
- No Waze, Transit or Citymapper first-party design/engineering write-ups on their 2024-2026 UIs were found.

## Key question 2: How do they keep the screen uncluttered? What is visible by default versus revealed on interaction?

### Takeaway
The shipping pattern is: a bare map, one labelled CTA, a user-location dot, and at most one or two floating round buttons (locate-me, layers/report). Everything else, including transport-mode rows, time pickers, alternate routes, sharing and reporting, lives inside the sheet or appears only in a given phase (planning vs navigating).

### Cited Findings
- Apple Maps iOS 26: translucent search bar and nav menu let the map show through; turn-by-turn uses a smaller pop-up bar instead of a full-width banner; a floating directions button is the one persistent control on place cards; incident reporting is a single right-side button that only appears during navigation — [MacRumors](https://www.macrumors.com/guide/ios-26-maps)
- Google Maps: directions mode row was moved from the top to the bottom and the sheet shrunk so the map stays visible in transit mode; the back button was removed from the search bar in favour of an "x" inside the sheet; search is removed from the place view entirely — [9to5Google, Mar 2025](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/); [MobileSyrup](https://mobilesyrup.com/2024/02/09/google-maps-minor-redesign-improves-reachability/)
- Lyft Maps removed irrelevant POIs (stores, restaurants) from the base map so only navigation- and pickup-relevant features remain — [Lyft blog](https://www.lyft.com/blog/posts/lyfts-secret-plan-to-take-control-of-its-maps-and-its-future)
- Lyft 2019: primary interactions at the bottom for thumb reach, secondary info in an expanding panel — [Core77](https://designawards.core77.com/Interaction/87383/Rider-App-Redesign)
- Waze 4.0 consolidated ETA, alternate routes, add-stop and share into one slide-up panel so the map itself carries fewer controls — [TechCrunch](https://techcrunch.com/2015/10/19/navigation-app-waze-gets-a-huge-redesign-now-less-cluttered-but-still-needs-improvement)
- Citymapper: Home/Work/Places shortcuts and the labelled search bar are the only top-level controls; a weak spot is the small "Leave: Now" button floating over the map with low contrast — the critique explicitly identifies floating controls over map imagery as a visibility problem — [IXD@Pratt (Feb 2026)](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/)
- Strava 2025: stats overlay the map rather than living on a separate screen, with pace given more prominence for runs — [the5krunner](https://the5krunner.com/2025/07/16/strava-app-redesign/)
- Transit 5.0: search bar lowered for thumb reach; line cards on the home screen expand in place to show departures, schedule and a vehicle map — [iPhone in Canada](https://www.iphoneincanada.ca/2018/08/31/transit-app-gets-major-redesign/)
- Google Maps' blue dot is accompanied by a light-blue accuracy circle only when location is uncertain; a grey dot indicates no fix and shows the last known location — [Google Maps Help](https://support.google.com/maps/answer/2839911?hl=en)

### Inferences
- "Chrome follows phase": planning phase shows mode row + results; navigating phase swaps to a compact ETA/next-turn bar plus a report button. A web app can implement this as three explicit UI states (idle / planning / navigating), each with its own visible control set.
- Translucent/glass surfaces (Apple) and map slivers (Google) both serve the same goal of keeping the map readable as context, which argues for `backdrop-filter: blur()` on sheet surfaces on the web rather than opaque panels.

### Gaps
- No source enumerated the exact default-visible controls of Uber's or Waze's current (2024-2026) home screens.

## Key question 3: How are bottom sheets implemented (snap points, dimming, gesture handling)?

### Takeaway
Native apps use OS sheet controllers: iOS detents (`.medium()` ~ half screen, `.large()`, custom fractions; dimming can be suppressed below a chosen detent; scrolling at the edge expands the sheet) and Material's standard (non-modal, no scrim) vs modal (scrim) bottom sheets. Apple Maps uses three detents (approximately 0.1 / 0.5 / 1.0) with a floating gap at the lower detents, no dismiss-by-drag, and a visible grabber. On the web the most robust reproduction uses CSS scroll-snap rather than JS drag.

### Cited Findings
- UISheetPresentationController (iOS 15+): system detents `.medium()` and `.large()`; custom detents (iOS 16+) resolved as a fraction of `maximumDetentValue`; `largestUndimmedDetentIdentifier` keeps the presenting view undimmed up to a chosen detent; `prefersGrabberVisible` shows the handle (off by default); `prefersScrollingExpandsWhenScrolledToEdge` lets an edge-scrolled scroll view expand the sheet; the first detent in the array is the initial height — [mackuba WWDC21 notes](https://mackuba.eu/notes/wwdc21/customize-and-resize-sheets-uikit); [Avanderlee](https://www.avanderlee.com/swift/presenting-sheets-uikit-uisheetpresentationcontroller/); [Donny Wals](https://donnywals.com/presenting-a-bottom-sheet-in-uikit-with-uisheetpresentationcontroller); [Apple WWDC22 10068](https://developer.apple.com/videos/play/wwdc2022/10068/)
- Apple Maps-style reproduction: detents [0.1, 0.5, 1], initial index 0, grabber visible, drag-dismiss disabled; floating state with gap and full corner radius at low detents, docked at top — [Expo blog](https://expo.dev/blog/how-to-create-apple-maps-style-liquid-glass-sheets)
- Developer guidance on the Maps-style sheet: a small peek (handle + summary), a medium height (list), and a large/full height (details); non-modal sheets should leave the background usable and show a clear drag affordance or users stall (citing NN/g) — [vp0.com](https://vp0.com/blogs/draggable-bottom-sheet-map-modal)
- Material: modal bottom sheets sit above a scrim; standard bottom sheets have no scrim; Compose M3 exposes `PartiallyExpanded` / `Expanded` states, a `DragHandle`, a default scrim colour and a default peek height via tokens (numeric values not listed on the reference page) — [Material Components Android docs](https://gitea.com/784622644/material-components-android/src/branch/master/docs/components/BottomSheet.md); [Compose M3 BottomSheetDefaults](https://developer.android.com/reference/kotlin/androidx/compose/material3/BottomSheetDefaults)
- Material spec: a bottom sheet should animate upward from the bottom edge — [Material (archived spec)](https://spot.pcc.edu/~mgoodman/developer.android.com/design/spec/components/bottom-sheets.html)
- Google Maps sheets (2024-25): rounded corners; a background sheet visible behind the active one (stacked sheets); even at full height a strip of map remains behind the status bar — [9to5Google, Mar 2025](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/)
- Wolt's multi-page sheet motion spec: next page moves/fades in across only 30% of the sheet width (a full slide was judged too distracting); sheet height animates to the incoming page's height with staggered delays; top bar and sticky action bar stay fixed and change only opacity during pagination; top-bar elevation fades in before content scrolls behind it — [Wolt engineering blog](https://careers.wolt.com/en/blog/engineering/an-overview-of-the-multi-page-scrollable-bottom-sheet-ui-design)
- Web implementation (pure-web-bottom-sheet, built for a map-centric train app): host uses `overflow-y: scroll` + `scroll-snap-type: y mandatory`; snap points are slotted elements positioned with `top: var(--snap)` whose 1 px `::before` carries `scroll-snap-align` (1 px needed for Safari); 0% = sheet just off-screen, 100% = fully extended; the host is `pointer-events: none` with the sheet `pointer-events: all` so touches on the transparent area reach the map; a WebKit bug requires a 1 px horizontal overflow workaround under `@supports (-webkit-touch-callout: none)`; nested scrolling drives sheet height via scroll-driven animations with a JS fallback, and switches to transform-based animation during active scroll to avoid reflow; Chromium preserves scroll position after layout changes while Safari/Firefox re-snap, handled with an IntersectionObserver; virtual keyboard handling is Chromium-only (VirtualKeyboard API) with a visualViewport fallback — [dev.to, Vili Ketonen](https://dev.to/viliket/native-like-bottom-sheets-on-the-web-the-power-of-modern-css-ld6)
- The same author evaluated react-spring-bottom-sheet, react-modal-sheet, Vaul and Plain sheet and rejected all for "long scrollable content overlaid on a map, multiple snap points, and steady drag on touch devices", finding JS-driven drag prone to jank — [dev.to](https://dev.to/viliket/native-like-bottom-sheets-on-the-web-the-power-of-modern-css-ld6)
- react-spring-bottom-sheet: snap points, imperative `snapTo`, built on react-spring + react-use-gesture; a React 19 continuation exists — [react-spring-bottom-sheet docs](https://docsearch.algolia.com/mcp/docs/repo/stipsan/react-spring-bottom-sheet); [@nipe-solutions fork](https://unpkg.com/@nipe-solutions/react-spring-bottom-sheet@5.0.2/README.md)
- Vaul: drawer on Radix Dialog with snap points, dragging, multiple directions, optional Handle that restricts dragging to one element — [Vaul docs](https://docsearch.algolia.com/mcp/docs/repo/emilkowalski/vaul)

### Inferences
- A web spec that matches Apple/Google: three snap points (~10-15% peek, ~50% half, ~90-92% full leaving a map sliver), no scrim below the half detent, grabber always visible, drag-dismiss disabled for the primary planning sheet, scroll-to-expand when the inner list is at its top edge.
- The Wolt "30% travel + fade" rule and "height animates to next page" are the most concrete sheet-motion numbers found and are a reasonable default for page transitions inside a map sheet.

### Gaps
- No exact peek heights (px or %) for Uber, Lyft, Citymapper, Transit or Strava sheets were found.
- Material 3 numeric tokens for drag handle (width/height), scrim opacity and half-expanded ratio were not retrieved (reference pages only name the tokens).
- Dimming behaviour of Google Maps' stacked "background sheet" is unexplained in the source (a reader asked; no answer).

## Key question 4: How is a route revealed (camera fit, line draw-in, destination pulse), how is the user dot drawn, and how do live elements update?

### Takeaway
Platform documentation defines the building blocks: Google's blue dot = dot + light-blue accuracy circle whose size scales with uncertainty + a "flashlight" heading beam whose width scales with compass confidence; ride-hail car markers are interpolated between GPS samples with heading rotation; Mapbox's canonical pulsing-dot runs a 1 s cycle expanding from 30 px to 100 px radius while fading. No shipping app's route line-draw or destination-pulse timing is documented.

### Cited Findings

**User-location dot**
- Google Maps: light-blue circle around the blue dot appears when location is uncertain; smaller circle = more certain; grey dot = no current fix, showing last location — [Google Maps Help](https://support.google.com/maps/answer/2839911?hl=en)
- Google Maps Android (Sep 2016) replaced the direction arrow with a "shining blue beam" like a flashlight; beam width reflects compass accuracy (wider = probably uncalibrated); figure-8 motion recalibrates; the arrow was confusing when stationary — [Geoawesome, Sep 2016](https://geoawesome.com/google-maps-get-redesign-of-the-blue-dot-showing-your-position); [BGR on circle size](https://www.bgr.com/2205952/why-blue-dot-google-maps-changes-size/)
- Mapbox GL JS "pulsing dot" reference: 200x200 canvas; `t = (performance.now() % 1000) / 1000` (1 s cycle); inner radius 30 px constant, solid `rgba(255,100,100,1)` with white stroke; outer radius grows 30 -> 100 px (`(size/2)*0.7*t + radius`) with colour `rgba(255,200,200,1-t)` fading out; stroke width `2 + 4*(1-t)`; `render()` calls `map.triggerRepaint()` and returns true — [Mapbox example](https://docs.mapbox.com/mapbox-gl-js/example/add-image-animated)
- Mapbox GeolocateControl draws the standard blue dot from the browser Geolocation API; it is separate from the custom pulsing icon — [Mapbox locate-user](https://docs.mapbox.com/mapbox-gl-js/example/locate-user/)

**Live vehicle markers**
- Uber (2015 review): car icon turns corners and pulls up to the pin while ETA minutes update continuously — [IXD@Pratt](https://ixd.prattsi.org/2015/02/uber-ios-application-version-2-58-good-design/)
- Lyft: car markers coloured to match the real car and rotated to direction of travel; moving car icons "convey the idea of riding in a vehicle" — [electronic.partners](https://electronic.partners/news/lyft-app-update-adds-car-color-and-directions-to-its-digital-map/); [UX Planet Lyft critique](https://uxplanet.org/app-critique-lyft-ea0d3eff30a6)
- Reproductions of the Uber effect: ValueAnimator with LinearInterpolator interpolating LatLng between samples and rotating to bearing between consecutive points — [UberCarAnimation (GitHub)](https://github.com/pranaypatel512/UberCarAnimation); [Medium, Android 3D markers](https://lucasrodriguesgui.medium.com/rendering-and-animating-3d-markers-using-android-google-maps-sdk-3dfd0d597a2a); velocity-based dead reckoning between server updates (store last position, timestamp, velocity; tick on a timer) — [B4X forum](https://www.b4x.com/android/forum/posts/800050/)
- Google patent on "smooth animation rendering of probe points": vehicle marker moved so it passes through waypoints derived from probe location data — [US10281291B2](https://patents.google.com/patent/US10281291)
- Transit-style apps animate vehicle positions client-side between samples — [techinterview.org](https://www.techinterview.org/post/3233475339/mobile-system-design-public-transit-real-time/?format=md)

**Route line and camera**
- MapLibre/Mapbox line-gradient: requires a GeoJSON source with `lineMetrics: true`; `line-gradient` is an `interpolate` expression over `['line-progress']` (0..1); example uses `line-width: 14`, `line-cap: round`, `line-join: round` — [MapLibre example](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-gradient-line-using-an-expression/)
- Draw-in approaches: (a) append coordinates each `requestAnimationFrame` ("animate a line") — [MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/animate-a-line/); (b) ml-line-animation, a zero-dependency library that animates a single moving dash via the vanilla `line-gradient` property with `setProgress`/`pause` — [val.town](https://www.val.town/x/pql/ml-line-animation); (c) point-along-route with Turf — [MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/animate-a-point-along-a-route/); [MapTiler](https://docs.maptiler.com/sdk-js/examples/animated-route/)
- Camera API (Mapbox/MapLibre): `duration` in ms and `easing` (0..1 -> 0..1) on easeTo/flyTo/fitBounds; `flyTo` `curve` default 1.42 (van Wijk 2003 user study); `fitBounds` uses flyTo unless `linear: true`, and accepts `padding`, `absolutePadding`, `offset`, `maxZoom`; padding passed to camera moves persists globally unless `retainPadding: false` — [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/properties)
- Google Maps JS 3D API: camera path animations fly-to / fly-around with tilt near 81 degrees for the angled view — [Google developers](https://developers.google.com/maps/documentation/javascript/3d/animate-camera?hl=en)
- Remotion's MapLibre guidance for deterministic rendering: `interactive: false`, `fadeDuration: 0` — [Remotion](https://www.remotion.dev/docs/maps)

**Live ETA**
- Uber publishes live ETA/status to Live Activities and the Dynamic Island on iOS 16+ — [RideGuru](https://ride.guru/content/newsroom/ubers-new-redesign-explained)
- Citymapper GO shows countdowns, live arrival times, stop counts and "Get off now" — [IXD@Pratt](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/)
- Strava: splits update in real time on the map screen — [the5krunner](https://the5krunner.com/2025/07/16/strava-app-redesign/)

### Inferences
- Web recipe implied by the sources: `fitBounds(bbox, { padding: {top, bottom: sheetHeight + margin}, duration ~800-1200 ms, retainPadding: false })`, then animate a `line-progress` threshold from 0 -> 1 in the gradient expression (transparent beyond the threshold) to draw the route; mount a pulsing symbol image at the destination for a few cycles. Durations here are suggestions, not sourced.
- For vehicle markers on the web: keep last two samples per vehicle, lerp lat/lng and bearing in rAF over the sample interval; this is what every reproduction does, and the Google patent describes the same goal.

### Gaps
- No source documents the exact draw-in timing, colour or pulse behaviour of route reveals in Uber, Lyft, Apple Maps, Google Maps, Citymapper, Transit or Waze.
- Google's own documentation does not confirm the heading-beam-width-equals-compass-accuracy claim (only Geoawesome does).
- No exact colours/opacities/angles for any app's user dot or heading cone were found.

## Key question 5: What do users and designers specifically praise in teardowns and reviews?

### Takeaway
Praise clusters around: a single labelled call-to-action, saved-place shortcuts that avoid typing, bottom-reachable controls, mode-colour-coded route legs, live contextual feedback during the trip, and minimal base maps. Criticism targets low-contrast floating controls over map imagery and generic (non-route-specific) alerts.

### Cited Findings
- Uber: home page praised for simplicity/clarity; "Where to" is a clear cue; trip history useful for repeats — [IXD@Pratt 2023](https://ixd.prattsi.org/2023/09/design-critique-uberiphone-ios-app/)
- Citymapper: labelled "Get Me Somewhere" bar "signals the action of what the system affords"; Home/Work/Places use recognition over recall; Step-Free as a primary control; contextual GO feedback; criticised for the hidden, low-contrast "Leave: Now" and generic disruption alerts — [IXD@Pratt Feb 2026](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/); [IXD@Pratt Sep 2026](https://ixd.prattsi.org/2026/09/design-critique-citymapper/)
- Citymapper: colour-coded legs by mode make 3-leg journeys parse at a glance (2025 user); earlier users found to/from entry "somewhat unintuitive" (2023) — [Capterra](https://www.capterra.com/p/235508/Citymapper/)
- Citymapper: tips such as best station entrance and less-crowded carriages, mode-first choice, Share-ETA with live map following — [Econsultancy 2018](https://econsultancy.com/six-features-to-appreciate-about-citymappers-ux/)
- Google Maps 2024-25 redesign praised for reachability (modes at bottom) and context preservation (map sliver) — [MobileSyrup](https://mobilesyrup.com/2024/02/09/google-maps-minor-redesign-improves-reachability/); [Android Central](https://androidcentral.com/apps-software/google-maps-directions-ui-redesign-rollout)
- Lyft 2019 won the Core77 Interaction Award for the three-tap booking flow and bottom-anchored controls — [Core77](https://designawards.core77.com/Interaction/87383/Rider-App-Redesign)
- Lyft moving car icons praised for conveying the ride — [UX Planet](https://uxplanet.org/app-critique-lyft-ea0d3eff30a6)
- Apple Maps grabber cited by multiple developers as the model drag affordance — [Sarunw](https://sarunw.com/posts/bottom-sheet-in-ios-15-with-uisheetpresentationcontroller/)
- Liquid Glass broadly: divisive; Apple made it more subtle after first-beta complaints that screens felt overcrowded — [MacRumors guide](https://macrumors.com/guide/ios-26-liquid-glass)
- Strava 2025 Record: welcomed for ending the map/data toggle but "low on the excitement scale" — [the5krunner](https://the5krunner.com/2025/07/16/strava-app-redesign/)
- Waze 4.0 judged "less cluttered but still needs improvement" — [TechCrunch](https://techcrunch.com/2015/10/19/navigation-app-waze-gets-a-huge-redesign-now-less-cluttered-but-still-needs-improvement)
- MTA app critique argues users should review trips without tapping a specific route, following the familiar map-app pattern — [Unpixelated](https://unpixelated.substack.com/p/the-official-mta-app-is-disappointing)

### Inferences
- The most-praised items are information-architecture decisions (labelled CTA, shortcuts, bottom placement, colour-coding) rather than motion, so motion should be in service of these rather than a feature in itself.

### Gaps
- Most praise comes from student critiques (Pratt) or single user reviews rather than large-sample studies; no quantitative usability data was found.

## Key question 6: Which patterns are feasible on the web with MapLibre/Mapbox GL JS plus a React animation library?

### Takeaway
Everything in the catalogue is reproducible on the web except OS-level surfaces (Live Activities/Dynamic Island, true Liquid Glass refraction, native haptics). Camera fit/flyTo, gradient-based line draw-in, canvas pulsing dots, interpolated markers and multi-detent sheets all have documented web implementations; the main risks are touch-drag jank for JS-driven sheets and iOS Safari quirks.

### Cited Findings
- Camera: `easeTo`/`flyTo`/`fitBounds` with `duration`, `easing`, `padding`, `offset`, `maxZoom`, `linear`, `curve` (default 1.42) — [Mapbox API](https://docs.mapbox.com/mapbox-gl-js/api/properties); MapLibre's camera implementation mirrors this — [maplibre-gl camera.ts](https://app.unpkg.com/maplibre-gl@6.12.0/files/src/ui/camera.ts)
- Line draw-in via `line-gradient` + `line-progress` (needs `lineMetrics: true`, GeoJSON only) — [MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-gradient-line-using-an-expression/); via rAF coordinate appends — [MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/animate-a-line/); via ml-line-animation — [val.town](https://www.val.town/x/pql/ml-line-animation)
- Pulsing dot via `StyleImageInterface` + `triggerRepaint` (works in MapLibre and Mapbox) — [Mapbox](https://docs.mapbox.com/mapbox-gl-js/example/add-image-animated); one GitHub issue reports trouble updating a pulsing dot's position from socket events in real time, resolved by switching to Markers — [mapbox-gl-js#11606](https://github.com/mapbox/mapbox-gl-js/issues/11606)
- Bottom sheets: CSS scroll-snap approach is framework-agnostic, works over a map with click-through, and avoids JS drag jank; caveats are Safari 1 px snap-align, WebKit pointer-events bug, re-snap differences, Chromium-only VirtualKeyboard API — [dev.to](https://dev.to/viliket/native-like-bottom-sheets-on-the-web-the-power-of-modern-css-ld6); JS alternatives: react-spring-bottom-sheet (snap points, `snapTo`) and Vaul (snap points, Handle) — [react-spring-bottom-sheet](https://docsearch.algolia.com/mcp/docs/repo/stipsan/react-spring-bottom-sheet); [Vaul](https://docsearch.algolia.com/mcp/docs/repo/emilkowalski/vaul)
- Native-only: Live Activities / Dynamic Island trip tracking (Uber) — [RideGuru](https://ride.guru/content/newsroom/ubers-new-redesign-explained); Liquid Glass material requiring native sheet with transparent content background — [Expo blog](https://expo.dev/blog/how-to-create-apple-maps-style-liquid-glass-sheets); iOS detent system and `largestUndimmedDetentIdentifier` — [WWDC22 10068](https://developer.apple.com/videos/play/wwdc2022/10068/)
- Skeleton/loading guidance (general, not map-specific): use skeletons when load exceeds ~1 s, match final layout, keep brief, don't skeleton controls — [SAP Fiori iOS](https://experience.sap.com/fiori-design-ios/?p=25849); [LogRocket](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design); [Emplifi](https://soul.emplifi.io/latest/patterns/patterns/loading-2wuAysTL)
- Error/empty state analogue from Google Maps: grey dot + last known location when no fix — [Google Maps Help](https://support.google.com/maps/answer/2839911?hl=en)

### Inferences
- Feasible with MapLibre + Framer Motion/react-spring: sheet detents (drive sheet `y` with a spring; or use CSS scroll-snap and read `--sheet-position` to pad the camera), camera `fitBounds` with bottom padding equal to the sheet height, gradient line draw-in, canvas pulsing dot at destination and at user location, lerped vehicle markers, ETA counters. `backdrop-filter: blur()` approximates glass; it is not refraction.
- Flag as native-only: lock-screen/Live Activity tracking, system detent dimming, haptic ticks, Liquid Glass refraction, and OS-level location permission UI.

### Gaps
- No source compares how the three React sheet libraries handle pass-through touches to a MapLibre canvas; the only data point is one developer rejecting all of them for a map use case.
- No source reports measured frame rates for gradient-based line animation on mobile Safari.

## Empty, loading and error states (cross-cutting)

### Takeaway
Very little app-specific documentation exists. The only concrete, sourced map-app behaviours are Google's grey "last known location" dot and Citymapper's generic system-wide disruption alerts (criticised); the rest must follow generic skeleton guidance.

### Cited Findings
- Google Maps: grey or missing dot = cannot find location, shows last visited location — [Google Maps Help](https://support.google.com/maps/answer/2839911?hl=en)
- Citymapper disruption alerts are system-wide, not route-specific, forcing users to work out relevance — [IXD@Pratt Feb 2026](https://ixd.prattsi.org/2026/02/design-critique-citymapper-ios-app/)
- Lyft Maps adds real-world status updates such as telling a waiting rider their driver is stuck in traffic — [Lyft blog](https://www.lyft.com/blog/posts/lyfts-secret-plan-to-take-control-of-its-maps-and-its-future)
- Skeleton guidance: show after >1 s, mirror layout, keep brief, not for controls — [SAP Fiori](https://experience.sap.com/fiori-design-ios/?p=25849); [Emplifi](https://soul.emplifi.io/latest/patterns/patterns/loading-2wuAysTL)

### Inferences
- A web map should mirror Google's degraded-location pattern (grey dot + stale label) and Lyft's inline status chip for live delays rather than modal errors.

### Gaps
- No teardown of Uber/Lyft "finding drivers" or "no drivers available" states, nor Citymapper/Transit offline states, was found in this search.
