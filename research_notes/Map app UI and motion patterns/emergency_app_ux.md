# UX of safety, emergency and crisis apps: patterns for a one-tap "guide me to the nearest safe place" app

Scope note: Watch Duty, Citizen, FEMA app, American Red Cross Emergency app, what3words, Noonlight, Life360 SOS, Apple Emergency SOS / SOS via satellite, Google crisis/SOS alerts and Android earthquake alerts, Japan's NERV and Yurekuru Call, Notify NYC. Several publisher sites (Wired, The Verge, NYT, LA Times, The Atlantic, Reddit) block fetching, so design-press coverage of Watch Duty and Citizen is thinner than hoped; those gaps are flagged below.

## Q1. What does each app put on its first screen, what is the primary action, and what is deliberately left off?

### Takeaway
The best-regarded apps (Watch Duty, NERV, Noonlight, Apple SOS) put one thing on the first screen: a map or status scoped to "here and now" or a single hold-to-trigger button, and treat "check it and close it" as the success metric. Everything else (feeds, comments, settings, donations) is pushed to a second level or dropped.

### Cited Findings
- Watch Duty's design brief, per the product designer who built the original app, was to "deliver rich information about fast-changing fires without being overwhelming to people already under stress"; the first screen is a map of active fires with push notifications for nearby threats — [Andrew Liebchen, LinkedIn](https://linkedin.com/in/andrewliebchen); [Sunset interview with John Mills](https://sunset.com/travel/watch-duty-app-john-mills-interview)
- Watch Duty's map layers are burn areas, evacuation zones, fire cameras, evacuation sites, directions to shelters, wind data and aircraft positions; the information is radio-sourced and verified by staff, not crowdsourced — [KUOW](https://m.kuow.org/stories/trying-to-stay-safe-in-a-wildfire-there-s-an-app-that-can-help); [PopSci](https://www.popsci.com/technology/watch-duty-the-lookout-tech-to-track-wildfires/)
- Watch Duty users praise it specifically for "no clicking and looking around", "clean and uncomplicated", updates that are "quick, concise easy to understand" and free of "chatter and tangential comments" — [JustUseApp Watch Duty reviews](https://justuseapp.com/en/app/1574452924/watch-duty-wildfire/reviews)
- Watch Duty is free, ad-free, and asks for donations with a "soft ask" rather than pop-ups — [JustUseApp Watch Duty reviews](https://justuseapp.com/en/app/1574452924/watch-duty-wildfire/reviews)
- Citizen's original first screen was "a dark map that sprouts red dots wherever new emergencies are reported" (described as the app's "most ominous feature"); the redesign replaced that with "a summary of the user's immediate surroundings". Head of product Keith Peiris: the company wants users to "check [Citizen] and close it" and admitted the original design "can certainly create a lot of paranoia and anxiety" — [AIGA Eye on Design](https://eyeondesign.aiga.org/do-crime-tracking-apps-have-a-design-problem/)
- NERV's home screen "shows the information users need for their current time and place"; during an earthquake it shows the latest earthquake information, and if other warnings arrive it sorts them by type, elapsed time and urgency. Non-urgent info is a silent notification; urgent disaster warnings use iOS Critical Alerts — [NERV App Store listing](https://apps.apple.com/us/app/nerv-disaster-prevention/id1472338480)
- Noonlight's first screen is a single "hold-to-cancel panic button on the main screen". Hold while unsafe; release and enter a 4-digit PIN within 10 seconds to cancel, otherwise dispatch is alerted silently using GPS — [WhistleOut Noonlight guide](https://www.whistleout.com/CellPhones/Guides/noonlight-panic-button-for-solo-travel-safety)
- Life360's SOS button is labeled "Tap to Send SOS"; press-and-hold, and on release "a 10-second countdown will begin"; when it ends all Circle members and emergency contacts get a push and/or text. Cancel wording conflicts between sources: older Life360 pages say "enter your pin to cancel", newer "learn" pages say "Slide to Cancel" — [Life360 support](https://support.life360.com/hc/en-us/articles/23053474049687); [Life360 learn page](https://www.life360.com/learn/sos-alerts-with-emergency-dispatch); [Life360 blog (older)](https://www.life360.com/?p=273201)
- Apple Emergency SOS: hold side button + a volume button "until the sliders appear"; dragging the "Emergency SOS" slider calls immediately; keep holding and "a countdown begins and an alert sounds" ("Call with Hold and Release"). After the call, iPhone alerts emergency contacts and sends current location — [Apple support HT209053](https://support.apple.com/HT209053); [Apple Personal Safety guide](https://support.apple.com/en-gu/guide/personal-safety/ips4f0cd709b/web)
- Apple Emergency SOS via satellite: flow is Tap "Report Emergency" -> answer emergency questions "with simple taps" -> choose whether to notify emergency contacts -> follow on-screen instructions to connect to a satellite (haptic feedback when pointed wrong) -> keep following instructions while message sends. Users can also type "emergency", "SOS", "help" or "send help" in the Messages address field. There is a Demo mode launched from Control Center when you have coverage — [Apple support 101573](https://support.apple.com/en-us/101573); [Pocket-lint hands-on](https://www.pocket-lint.com/phones/news/apple/163797-apple-emergency-sos-via-satellite-feature-how-it-works-impressions)
- Google Maps shows a crisis icon on the map and a tappable alert card when a crisis is in the current map view, when you search an affected area at the right zoom level, or when a selected route enters an affected area. Tapping opens a "crisis sheet" with sections "About" (summary, Share, "Share location"), "Help and information" (external resources), "Navigation impact" ("Report road closure"), "What do you think?" ("Send feedback") — [Google Maps Help: Crisis-related alerts](https://support.google.com/maps/answer/9985621)
- Google SOS Alerts in Search place the alert at the top of results with maps, top stories, emergency phone numbers, websites and translations; people near the event get a device notification, people far away may see a donation option; a dedicated Google team decides which events warrant an SOS Alert — [TechCrunch 2017](https://techcrunch.com/?p=1518291); [Digital Trends](https://www.digitaltrends.com/?p=1217892)
- FEMA app: real-time NWS/IPAWS alerts for up to five locations by ZIP code, preparedness content, shelter and Disaster Recovery Center search; rated 3.7/5 from ~1K ratings; "designed to meet federal accessibility standards", VoiceOver and Voice Control compatible — [FEMA App Store listing](https://apps.apple.com/us/app/fema/id474807486)
- Red Cross Emergency app: 35 weather/emergency situation types, Spanish toggle, shelter lists; current iOS version 5.4.0 rated ~4.8 on ~7,230 ratings — [BridgingApps review](https://bridgingapps.org/bridgingapps-reviewed-app-the-red-cross-emergency-apps/); [chrome-stats listing summary](https://chrome-stats.com/d/id954783878)
- what3words: "Find your current what3words address offline" and "Navigate offline with compass mode"; 4.8/5 from 44K ratings — [what3words App Store listing](https://apps.apple.com/us/app/what3words/id657878530)
- Yurekuru Call: countdown-to-shaking alerts, seismic intensity map, tsunami info, user "felt it" reports with a 5-phase icon; users must register a forecast region before alerts work; voice warnings added in 2018 after requests from visually impaired users — [Yurekuru App Store listing](https://apps.apple.com/app/id1560592402); [RC Solution](https://rcsc.co.jp/yurekuruen); [Kyodo PR 2018](https://kyodonewsprwire.jp/release/201803091757)
- Notify NYC: alerts by current location plus up to five saved addresses, a map of emergency locations relative to the user, user-selectable alert categories; 3.3/5 from 97 App Store ratings; listing promises the city "will never track or share your precise location" — [NYC EM press release](https://www.nyc.gov/site/em/about/press-releases/20170922_pr_nycem-doitt-release-notify-nyc-app.page); [Notify NYC App Store](https://apps.apple.com/app/id1121367950); [NYCHA Journal](https://nychajournal.nyc/?p=742)

### Inferences
- The two shapes that work are (a) "status map scoped to me" (Watch Duty, NERV, redesigned Citizen) and (b) "one big hold button" (Noonlight, Life360, Apple SOS). A "guide me to safety" app is a hybrid: the first screen should be a single large button over a minimal map, and the result should be a route, not a feed.
- Every praised app removes commentary, social feeds and marketing from the first screen. Citizen's redesign is effectively an admission that a dense incident feed is the wrong first screen.
- Hold-to-trigger plus a short, cancelable countdown (Apple, Life360, Noonlight) is the standard for a destructive/irreversible emergency action. For a non-destructive action like "route me to shelter", a single tap with no countdown is appropriate; a hold is only needed if the tap contacts other people.

### Gaps
- Could not fetch Wired's Watch Duty profile or any Verge/Fast Company design coverage (sites block fetching), so there is no first-hand designer quote on what Watch Duty deliberately left off beyond the LinkedIn testimonial.
- No source describing Citizen's current (2024-2026) home screen layout in detail; the AIGA piece describes the 2019-2020 redesign.
- Could not fetch Life360's support article directly (403); the cancel mechanism (PIN vs slide) is unconfirmed.

## Q2. How is severity encoded visually (color scales, banner placement, iconography) and how do apps avoid alarm fatigue?

### Takeaway
Shipping apps use a 3-step green/yellow/red scale or a 2-tier "advisory vs. take action" split, keep red for "likely injury / act now", reserve intrusive channels (Critical Alerts, full-screen, sound through DND) for the top tier only, and geofence intrusive alerts to people actually in the target area. Government design systems warn against heavy red/orange and against stacking banners.

### Cited Findings
- Citizen color-codes incidents: green = minor advisories, yellow = situations to avoid, red = likely injuries. Designer Mackey Saturday said the team tests colors "in all situations, at all times of day" and asked whether brighter colors can signal clarity and optimism rather than alarm. In quiet neighborhoods the app de-prioritizes notifications and comment threads — [AIGA Eye on Design](https://eyeondesign.aiga.org/do-crime-tracking-apps-have-a-design-problem/)
- Google Maps wildfire encoding: a wildfire icon or "tiny red circle" for a point, red shapes for approximate affected areas, yellow shading where fire presence is less certain; fires under 5 acres (NIFC data) are not shown; outlines "may differ from actual fire extent by several miles" — [Google Maps Help](https://support.google.com/maps/answer/9985621)
- Google Android earthquake alerts use two tiers: "Be Aware" and "Take Action: A full-screen alert for moderate to heavy shaking, giving you immediate advice on how to stay safe". Take Action fires for MMI 5+ from M4.5+, breaks through Do Not Disturb, turns on the screen and plays a loud sound. The Be Aware alert is being updated to show a map with the shaking radius, estimated magnitude, actions to take and a "learn more" button — [9to5Google](https://9to5google.com/?p=733492); [DT Next (India launch)](https://www.dtnext.in/lifestyle/technology/explained-this-is-how-google-earthquake-alert-system-will-work-in-india-738691)
- NERV: silent notification for non-urgent info; iOS Critical Alert (sounds through Silent and DND) only for Earthquake Early Warning at Alert level and Tsunami Warnings, and only to users inside the target area; everyone else gets a normal notification. Requires "Always Allow" location and Background App Refresh — [NERV App Store listing](https://apps.apple.com/us/app/nerv-disaster-prevention/id1472338480)
- USWDS site alert: "Use a full-width alert near the top of the page"; "avoid heavy use of bright red or orange, since these colors can provoke fear or panic"; top placement gives enough weight that strong colors may be unnecessary; "Avoid stacking multiple site alerts"; use `role="alert"` sparingly for urgent, `role="status"` for advisory — [USWDS Site alert](https://designsystem.digital.gov/components/site-alert/)
- GOV.UK emergency banner: three campaign classes `notable-death`, `national-emergency`, `local-emergency`, placed at the top of every page, with a heading, one-line body (examples: "National emergency" / "This is a level 1 incident"; "Local emergency" / "This is a level 2 incident") and a single "More information" link — [GOV.UK Publishing components: emergency banner](https://components.publishing.service.gov.uk/component-guide/emergency_banner)
- NN/g on urgency tiers: the most urgent alerts should stand out at once with bold colors or distinct sounds; if all alerts look the same users "may treat them as if they had the same urgency level"; too many irrelevant alerts cause notification fatigue; action-required notifications should be intrusive, passive ones should not; SMS is expected only for critical content — [NN/g smart-home notifications](https://www.nngroup.com/articles/smart-home-notifications/); [NN/g indicators, validations, notifications](https://www.nngroup.com/articles/indicators-validations-notifications/); [NN/g transactional notifications](https://www.nngroup.com/articles/transactional-notifications/)
- NN/g on the 2018 Hawaii false missile alert: live and test alert modes must be visibly separated because "a slip of the finger could result in a major problem" — [NN/g error prevention](https://www.nngroup.com/articles/error-prevention/)
- Alarm-fatigue literature (healthcare): dangerous and low-priority alerts that "sound almost alike" and low-stakes warnings delivered as hard stops are the main causes; fixes are suppressing duplicates for the same condition and combining related alarms into one signal — [Halo Lab alert fatigue](https://www.halo-lab.com/blog/alert-fatigue-in-healthcare)
- Alarm fatigue in practice for crisis apps: FEMA app users report "the same alert arriving roughly hourly"; Red Cross users report "excessive or duplicate notifications"; Watch Duty users complain of alerts for fires in other states — [FEMA App Store](https://apps.apple.com/us/app/fema/id474807486); [chrome-stats Red Cross summary](https://chrome-stats.com/d/id954783878); [JustUseApp Watch Duty](https://justuseapp.com/en/app/1574452924/watch-duty-wildfire/reviews)
- Citizen's notification volume ("multiple times a day") is cited by experts as creating "a culture of fear"; a Philadelphia user deleted the app after growing paranoid — [Mother Jones](https://develop.motherjones.com/politics/2019/08/it-creates-a-culture-of-fear-how-crime-tracking-apps-incite-unnecessary-panic/); [Philadelphia Inquirer](https://www.inquirer.com/opinion/commentary/citizen-app-crime-alerts-philadelphia-safety-20210513.html)
- FEMA WEA message construction: template is source, event, location, action, URL/phone; 90-character text is still required with an optional 360-character version; "do not abbreviate or use acronyms that only locals understand"; include a Spanish version; braces, brackets, pipes, backslashes, carets and tildes are rejected — [FEMA IPAWS guide to constructing WEA/EAS messages](https://www.fema.gov/sites/default/files/documents/fema_ipaws-guide-constructing-wea-eas-messages_1.pdf); [FEMA effective messaging 90/360](https://www.fema.gov/sites/default/files/documents/fema_effective-messaging-90-360-characters.pdf); [OnSolve guide](https://library.onsolve.com/download/f54b66acfc0a11eea3499a279316e2e3)

### Inferences
- A severe-weather "get to safety" app needs at most three severity states on screen: Advisory (muted, no sound), Warning (banner, standard notification), Take Action (full-screen or hero banner, sound, haptic). Map it to NWS Watch / Warning / Emergency so wording matches what users hear on TV and WEA.
- Red should be reserved for the top tier and used as a thin banner or outline, not a full-screen flood, following USWDS. Dangerous areas on the map should be red fills, uncertain areas yellow (Google's convention), and the safe destination should be the only green object.
- The WEA 90/360-character constraint is a useful self-imposed limit for in-app alert text: source + hazard + place + action + time in 360 characters.

### Gaps
- No primary source for the exact hex colors used by Watch Duty, Citizen or Google crisis cards.
- GOV.UK component page does not state the banner colors per class (the page only distinguishes homepage styling).
- The FEMA 90/360 PDF could not be text-extracted, so the verbatim example messages are not captured.

## Q3. Documented guidelines for emergency UI: tap targets, contrast, text size, motion, timing (WCAG, Apple HIG, Material, GOV.UK, USWDS, FEMA IPAWS)

### Takeaway
Hard numbers: 24x24 CSS px minimum target (WCAG 2.2 AA), 44x44 pt (Apple), 48x48 dp with 8 dp spacing (Android), 4.5:1 text contrast (AA) / 7:1 (AAA), 3:1 for UI components and large text, 11 pt minimum text (Apple) and text resizable to 200%. For a stressed outdoor user these are floors, not targets; Smashing's stress guidance argues for larger targets and plain wording because of cognitive tunneling and reduced fine motor control.

### Cited Findings
- WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA: pointer targets at least 24 by 24 CSS pixels, with a spacing exception when a 24 px circle centered on each target does not intersect another target. SC 2.5.5 (Enhanced, AAA) is stricter for important controls — [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- WCAG 2.2: 1.4.3 Contrast (Minimum) AA = 4.5:1 for text, 3:1 for large text (18 pt or 14 pt bold); 1.4.6 Contrast (Enhanced) AAA = 7:1 / 4.5:1; 1.4.11 Non-text Contrast AA = 3:1 for UI components and graphical objects; 1.4.4 Resize Text AA = 200% without loss; 1.4.12 Text Spacing AA = line height 1.5x, paragraph 2x, letter 0.12x, word 0.16x; 1.4.1 Use of Color A = color never the only means; 2.2.1 Timing Adjustable A = user can turn off, adjust (10x) or extend (20 s warning) time limits, with a "real-time"/"essential" exception — [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2&levels=aaa)
- Apple: tap targets at least 44 pt x 44 pt; text at least 11 pt; "ample contrast" (no ratio given on this page); don't let text overlap; place controls close to the content they modify — [Apple UI Design Dos and Don'ts](https://developer.apple.com/design/tips/)
- Android accessibility: touch targets at least 48 x 48 dp, spaced at least 8 dp apart, roughly 9 mm physical within a 7-10 mm recommended range — [Google Android accessibility help](https://support.google.com/accessibility/android/answer/7101858)
- Smashing Magazine "Designing for Stress and Emergency" (Nov 2025): expect cognitive tunneling (narrowed peripheral vision, weaker reading comprehension, poorer fine motor control, less patience); ask one question or one action at a time; prefer several simple pages over one dense one; keep each step to roughly 10-30 seconds; pre-fill defaults; put high-priority actions first; add Undo for irreversible actions; design an "emergency mode" in advance; test in real noisy environments, not quiet labs; "Stress cases aren't edge cases" — [Smashing Magazine](https://smashingmagazine.com/2025/11/designing-for-stress-emergency/); [Smart Interface Design Patterns](https://smart-interface-design-patterns.com/articles/stress/)
- USWDS site alert accessibility: add `aria-label`/`aria-labelledby` so the alert appears in the landmarks menu; `role="alert"` for urgent (sparingly), `role="status"` for advisory; do not visually hide alerts and reveal later; USWDS tested 8 WCAG 2.1 AA criteria with 3 pass, 5 conditional, 0 fail — [USWDS Site alert](https://designsystem.digital.gov/components/site-alert/)
- GOV.UK emergency banner links must be keyboard and touch usable, show focus and hover states, and have visible meaningful text — [GOV.UK Publishing components](https://components.publishing.service.gov.uk/component-guide/emergency_banner)
- NN/g on overlays: popups and lightboxes that block content are a problematic pattern; prefer non-blocking indicators — [NN/g overuse of overlays](https://www.nngroup.com/articles/overuse-of-overlays/); [NN/g popups](https://www.nngroup.com/articles/popups/)
- NN/g mobile microsessions: most mobile sessions are very short, so the first screen must deliver value immediately — [NN/g mobile microsessions](https://www.nngroup.com/articles/mobile-microsessions/)
- FEMA/IPAWS accessibility: The Partnership for Inclusive Disaster Strategies publishes IPAWS guidance for accessible alerting (plain language, multiple modalities) — [Partnership IPAWS guide v2.0](https://disasterstrategies.org/wp-content/uploads/2024/01/IPAWS-for-The-Partnership-for-Inclusive-Disaster-Strategies_v2.0-final-accessible.pdf)
- Outdoor readability is dominated by contrast, not brightness alone: "contrast ratio is the key to outdoor viewability"; outdoor light is bright and reflective from many angles; vendors cite 1000+ nits for direct sunlight (hardware marketing figures) — [Military & Aerospace Electronics](https://www.militaryaerospace.com/home/article/16706198/itronix-rugged-touch-screen-display-is-viewable-in-direct-sunlight); [Field Technologies Online](https://www.fieldtechnologiesonline.com/doc/what-really-makes-a-mobile-device-screen-readable-outdoors-0001)
- NERV lets users adjust contrast, text size and text thickness in Appearance settings, offers Dark and Light themes (a 2023 survey found most users preferred Dark), uses "a font with large, clear letters" for long text and color-blind-distinguishable schemes — [NERV App Store listing](https://apps.apple.com/us/app/nerv-disaster-prevention/id1472338480)

### Inferences
- Recommended floors for this app: primary button at least 64 pt tall and full-width (well above the 44/48 floor), body text 17-20 pt, alert headline 24-28 pt bold, 7:1 contrast on all alert text (AAA) because sunlight reduces effective contrast, and 3:1 minimum on map overlays and the route line against the basemap.
- Because 2.2.1 Timing Adjustable applies, any countdown (for example "calling in 5 s") must be cancelable; a routing action should not have a countdown at all.
- Reduce Motion must be honored: use fades and static route highlights rather than pulsing/zooming animations, both for WCAG 2.3.3 (AAA) and because motion competes with reading under tunnel vision.
- Sunlight readability argues for a high-contrast light theme outdoors (dark text on near-white, saturated single-hue accents) with an explicit dark/light toggle like NERV rather than auto-only.

### Gaps
- The Apple HIG and Material 3 pages returned 404/empty via fetch; numbers above come from Apple's "Design Tips" page and Google's Android accessibility help instead of the main HIG/M3 pages.
- Exact text for WCAG 2.5.5 (44x44 CSS px), 2.3.3 Animation from Interactions and 2.5.7 Dragging Movements was in the truncated part of the quick reference and is not captured verbatim.
- No design-system guidance found that specifically quantifies "dark vs light theme in sunlight"; the sources are display-hardware vendors.

## Q4. How do these apps handle denied location permission or poor GPS? What fallbacks work?

### Takeaway
Shipping patterns are: saved addresses as a location substitute (FEMA 5 ZIPs, Notify NYC 5 addresses, Yurekuru registered region), a manual-entry fallback with an explanation of why location matters, and honesty about accuracy (Google's "may differ by several miles", what3words 10-foot squares). Apple requires that a pre-permission screen lead straight into the system prompt. NERV simply refuses to send critical alerts unless "Always" location is granted.

### Cited Findings
- FEMA app: alerts for up to five locations by ZIP code, which works without device location — [FEMA App Store](https://apps.apple.com/us/app/fema/id474807486)
- Notify NYC: alerts by current location plus up to five saved addresses (home, work, school) — [NYC EM press release](https://www.nyc.gov/site/em/about/press-releases/20170922_pr_nycem-doitt-release-notify-nyc-app.page)
- Yurekuru Call requires users to "register a region of forecast before alerts work" — [Yurekuru App Store](https://apps.apple.com/app/id1560592402)
- NERV Critical Alerts require location set to "Always Allow" and Background App Refresh on; users without it get normal notifications for registered locations — [NERV App Store listing](https://apps.apple.com/us/app/nerv-disaster-prevention/id1472338480)
- Red Cross users complain about "loss of radius customization" and the Tornado app no longer letting the alert radius be set to "current location" — [chrome-stats summary](https://chrome-stats.com/d/id954783878); [JustUseApp Tornado reviews](https://justuseapp.com/en/app/602724318/tornado-american-red-cross/reviews)
- Watch Duty: a Google Play user reported the phone had "disabled this app due to inactivity" so they missed a nearby fire; others report fire markers "miles off" — [Watch Duty reviews via search](https://justuseapp.com/en/app/1574452924/watch-duty-wildfire/reviews)
- General guidance: if the user denies location "the app shouldn't just break or present an error", offer manual entry and explain why location is needed — [Arkansas DEQ location data guide](https://tap-app-api.adeq.arkansas.gov/post/user-location-data-a-guide); [Clime weather permissions cheat sheet](https://climeradar.com/blog/weather-app-location-permissions-cheat-sheet-during-winter-storms)
- Apple App Review rejected a pre-permission screen that had a "Not Now" option; Apple's stated expectation: "The user should always proceed to the permission request after the message." — [Apple Developer Forums thread](https://origin-devforums.apple.com/forums/profile/velkadamban)
- Windows exposes a coarse fallback that returns an obfuscated position with at least a 4 km uncertainty radius when precise location is denied (disabled by default) — [Microsoft Geolocator docs](https://github.com/MicrosoftDocs/winrt-api/blob/docs//windows.devices.geolocation/geolocator_allowfallbacktoconsentlesspositions_328227365.md)
- what3words: each 10-foot square has a unique three-word address; a 2019 reviewer notes potential for "a much more accurate location than normal GPS" but says voice search "never locates the correct address" — [what3words App Store](https://apps.apple.com/us/app/what3words/id657878530)
- Google Maps states wildfire outlines "may differ from actual fire extent by several miles" and satellite data can underestimate fire size — [Google Maps Help](https://support.google.com/maps/answer/9985621)
- Apple SOS via satellite shares location "including elevation" and remaining battery life with responders — [Apple support 101573](https://support.apple.com/en-us/101573)
- Crisis-app survey research (Germany, N=1,024) stresses that apps must be adaptable to user characteristics, respect privacy, and build trust and familiarity; it does not test location-denial flows — [GI DL: Adoption, Use and Diffusion of Crisis Apps in Germany](https://dl.gi.de/items/96fd9787-c82e-4732-a64b-82b615b071b6/full)

### Inferences
- Fallback ladder for a "guide me" app: (1) precise GPS; (2) coarse/approximate location (iOS "Precise: Off", Android coarse) with a visible accuracy ring; (3) saved home/work/school address; (4) type or drop a pin with a large "Use this spot" button; (5) if nothing, show the nearest shelters for the last known region with "Location off — showing shelters near [place]". Never a dead end.
- Show GPS confidence honestly (accuracy radius, "last updated 2 min ago") because users already complain when markers are off; a confident-looking but wrong position erodes trust fastest.
- Request location only at the moment of the first tap, with a one-sentence rationale, then immediately show the system prompt (Apple review requirement); offer "Always" only if background alerts are a feature.

### Gaps
- No published usability study was found that tests location-denial fallbacks in crisis apps; the fallback ladder is inferred from shipping features, not measured outcomes.
- iOS/Android first-party documentation on reduced-accuracy location was not fetched in this pass.

## Q5. What do users complain about and praise in app-store reviews?

### Takeaway
Praise clusters on speed, accuracy, verified (non-rumor) information, silence-override alerts, and simplicity. Complaints cluster on alerts that are missed, duplicated, too quiet, or irrelevant to my location; map markers that are off; map clutter; logins; and settings that get removed.

### Cited Findings
- Watch Duty praise: reported fires "before news stations"; "free, no ads"; "only notifies me of real fires"; "clean and uncomplicated"; Orange County fire chief called it "my Valium". Complaints: fire location "incorrect... miles off"; alerts for fires in other states; evacuation-zone lines make it "really really hard to see streets, neighborhood names and freeways" (asks for toggle); alerts "not nearly loud enough"; unexpected login; Google Play 4.8/5 from ~9,870 reviews — [JustUseApp Watch Duty](https://justuseapp.com/en/app/1574452924/watch-duty-wildfire/reviews); [Watch Duty testimonials (curated)](https://watchduty.org/testimonials); [Napa Valley Register](https://napavalleyregister.com/news/regional/phone-app-becomes-essential-tool-for-tracking-california-wildfires/article_98e38bc4-f469-5df7-a248-66b4d7acde37.html)
- Watch Duty gained ~2.5 million new users in the seven days after the Palisades and Eaton fires — [Fox LA](https://www.foxla.com/news/watch-duty-la-fires-california)
- Red Cross Emergency app (iOS 5.4.0, ~4.8 from ~7,230 ratings): praise for timely alerts and silent-mode override; complaints: missed alerts, duplicate notifications, loss of radius customization, audible critical alerts occasionally failing, weak wildfire functionality, "I'm safe" contacts not persisting; ~68.6% positive / 31.3% negative of 6,358 reviews — [chrome-stats](https://chrome-stats.com/d/id954783878); [JustUseApp Red Cross Emergency](https://justuseapp.com/en/app/954783878/emergency-alerts/reviews)
- FEMA app (3.7/5, ~1K): praise "improved and streamlined"; complaints: same alert hourly, minor alerts waking users at night, in-app survey nagging — [FEMA App Store](https://apps.apple.com/us/app/fema/id474807486)
- FEMA app is "fairly simple to navigate", preparation content works offline but "the majority of features require connectivity" — [OffGrid Web review](https://www.offgridweb.com/survival/review-10-survival-apps-for-ios-and-android)
- Citizen: described as "a relentless anxiety trigger"; experts say constant notifications "can actually create a culture of fear"; the company itself conceded the paranoia problem — [Mic](https://www.mic.com/life/the-citizen-app-is-a-relentless-anxiety-trigger-18790347); [Mother Jones](https://develop.motherjones.com/politics/2019/08/it-creates-a-culture-of-fear-how-crime-tracking-apps-incite-unnecessary-panic/); [AIGA](https://eyeondesign.aiga.org/do-crime-tracking-apps-have-a-design-problem/)
- what3words (4.8, 44K): Apple Watch compass heading and distance "hard to read at a glance", wants text "bigger and bolder"; a reviewer warns it "will not save your life" without data or voice service — [what3words App Store](https://apps.apple.com/us/app/what3words/id657878530)
- Noonlight: alerts need a live cellular data connection (no airplane mode / no signal); crash response, Watch app and lock-screen widget are premium — [WhistleOut](https://www.whistleout.com/CellPhones/Guides/noonlight-panic-button-for-solo-travel-safety)
- Notify NYC: 3.3/5 from 97 ratings; third-party review calls it "easy to use with a simple interface" with customizable alert categories — [Notify NYC App Store](https://apps.apple.com/app/id1121367950); [FileHippo](https://filehippo.com/android/download_notify-nyc/)
- NERV: 4.7 from 47 US ratings; reviewers cite full bilingual Japanese/English support — [NERV App Store (US)](https://apps.apple.com/us/app/nerv-disaster-prevention/id1472338480); [NERV App Store (JP, English)](https://apps.apple.com/jp/app/nerv-disaster-prevention/id1472338480?l=en-US)
- Yurekuru Call voice warnings were added in response to "many requests previously from the visually-impaired community" — [Kyodo PR](https://kyodonewsprwire.jp/release/201803091757)

### Inferences
- The single biggest reputational risk is a wrong or missing alert, not an ugly screen. Verification and "only real events" (Watch Duty) beat volume.
- Map clutter is a real complaint even in the best-loved app; a "guide me" app should default to the minimum layers (my position, hazard polygon, route, destination) and put everything else behind a toggle.
- Loudness/override of silent mode is praised when it works and punished when it fails; Critical Alerts entitlement (iOS) and full-screen intent (Android) should be scoped to the top severity tier only.

### Gaps
- Could not reach Google Play or App Store review pages for Citizen or Life360 directly; Citizen findings are from press rather than store reviews.
- Review-aggregator "sentiment" percentages (JustUseApp) are automated and should be treated as rough.

## Q6. Which experiences are web apps or PWAs, and what did they do for offline support?

### Takeaway
None of the named apps is documented as a PWA; all are native. The documented offline behaviors are narrow: what3words computes the 3-word address and compass heading offline, the FEMA app caches preparedness content, Apple falls back to satellite text, and Noonlight explicitly does not work without data. Open-source PWA examples (FloodTrackerApp, pwa-maps) show the service-worker/Leaflet pattern but not region tile pre-caching.

### Cited Findings
- what3words: "Find your current what3words address offline" and "Navigate offline with compass mode" — [what3words App Store](https://apps.apple.com/us/app/what3words/id657878530); works "without Wi-Fi or mobile data" — [Brampton Fire](https://Brampton.ca/EN/residents/Fire-Emergency-Services/Fire-Safety/Pages/what-3-words.aspx); caveat: you still need signal to report the location — [Singletrack forum](https://singletrackworld.com/forum/bike-forum/what3words-2/)
- FEMA app: preparation and disaster-resource sections work offline; "the majority of features require connectivity" — [OffGrid Web](https://www.offgridweb.com/survival/review-10-survival-apps-for-ios-and-android); Minneapolis guide says it "requires full internet connectivity" — [Minneapolis trifold PDF](https://www2.minneapolismn.gov/media/content-assets/www2-documents/residents/Emergency-Preparedness-and-Response-Smart-Phone-Application-Trifold-(PDF).pdf)
- Apple SOS via satellite: text-only, requires being outside with a clear view of sky and horizon; haptic feedback guides pointing; Crash/Fall Detection can send via satellite automatically on iPhone 14+ — [Apple support 101573](https://support.apple.com/en-us/101573); [Tom's Guide](https://www.tomsguide.com/news/iphone-14-emergency-sos-via-satellite-how-it-works-and-how-it-could-save-your-life)
- Noonlight needs a live cellular data connection; does not work in airplane mode or without signal — [WhistleOut](https://www.whistleout.com/CellPhones/Guides/noonlight-panic-button-for-solo-travel-safety)
- Google Search SOS Alerts and Maps crisis cards are web/online surfaces (Search results, Maps app) — [TechCrunch](https://techcrunch.com/?p=1518291); [Google Maps Help](https://support.google.com/maps/answer/9985621)
- Google Crisis Resilience: public alerts in 90+ countries, earthquake alerts in 95+ countries, flood forecasts covering 2B people in 150+ countries, ~10M daily connections to crisis information (2025 average); stated vision "No one should be surprised by a natural disaster" — [Google Crisis Resilience](https://crisisresilience.google/)
- PWA example: FloodTrackerApp uses Leaflet + OpenStreetMap with a cache-first service worker so the app keeps working when connectivity fails; service workers require HTTPS — [FloodTrackerApp GitHub](https://github.com/tjeevan/FloodTrackerApp); pwa-maps is an installable offline map PWA — [pwa-maps GitHub](https://github.com/reyemtm/pwa-maps)
- Academic offline-first PWA proposals exist for shelter management/evacuee registration and post-disaster hospital use — [ISPRS Annals 2025](https://isprs-annals.copernicus.org/articles/X-5-W2-2025/521/2025/isprs-annals-X-5-W2-2025-521-2025.pdf); [University of Bahrain journal](https://journal.uob.edu.bh/handle/123456789/5842?show=full)
- Workbox via vite-plugin-pwa is a documented path for PWA offline caching, with Chrome DevTools offline testing — [World Monitor PWA deployment guide](https://www.mintlify.com/koala73/worldmonitor/deployment/pwa)

### Inferences
- For a PWA "guide me to safety" app, offline support should mean: precache the shell, the shelter list for the user's region, and a low-zoom basemap tile set around saved addresses; compute nearest-shelter bearing and straight-line distance on device (what3words compass-mode style) when routing APIs are unreachable; show a clear "Offline — showing last known shelters and compass direction" state rather than a spinner.
- Low-signal mode should degrade to text: shelter name, address, distance, bearing, and a tel: link, since text is what works over satellite and 2G.

### Gaps
- No evidence that any of the twelve named apps ships as a PWA; no primary documentation of their offline tile strategies.
- No source found quantifying storage budgets or tile-caching approaches for emergency PWAs.

## Q7. Which apps are praised for design, and why?

### Takeaway
Watch Duty is praised for restraint and verified information rather than visuals; NERV for accessibility rigor (contrast, text controls, VoiceOver, color-blind palettes, tiered alert sounds); Apple SOS for a guided, tap-only questionnaire and physical-world feedback (haptics for satellite pointing); what3words for a single memorable output that works offline. Citizen is the cautionary example: its design was effective at engagement and criticized for manufacturing fear.

### Cited Findings
- Watch Duty: praised for being "clean and uncomplicated", "no clicking and looking around", verified radio-sourced updates "quick, concise easy to understand", no ads, no data sales — [JustUseApp Watch Duty](https://justuseapp.com/en/app/1574452924/watch-duty-wildfire/reviews); [KUOW](https://m.kuow.org/stories/trying-to-stay-safe-in-a-wildfire-there-s-an-app-that-can-help)
- Watch Duty origin: founder refreshing "the same outdated maps" during the 2020 Walbridge Fire; launched Aug 2021 — [Sunset](https://sunset.com/travel/watch-duty-app-john-mills-interview); [TED talk](https://www.ted.com/talks/john_mills_how_we_built_watch_duty_the_lifesaving_wildfire_alert_app)
- NERV: "barrier-free design", color-blind-safe schemes, large clear font, user-adjustable contrast/text size/thickness, Dark and Light themes, VoiceOver, Critical Alerts only for the top tier and only in the target area; direct leased line to the Japan Meteorological Agency for speed — [NERV App Store](https://apps.apple.com/us/app/nerv-disaster-prevention/id1472338480); [NERV JP listing](https://apps.apple.com/jp/app/nerv-disaster-prevention/id1472338480?l=en-US)
- Apple SOS via satellite: questionnaire answered "with simple taps", emergency contacts get a live transcript with a map (iOS 16.4+), Demo mode so users can rehearse — [Apple support 101573](https://support.apple.com/en-us/101573)
- Citizen: redesign moved from "red dots" panopticon to a neighborhood summary and green/yellow/red coding; critics note the density-highlighting could reinforce "digital redlining" — [AIGA Eye on Design](https://eyeondesign.aiga.org/do-crime-tracking-apps-have-a-design-problem/)
- Google: proximity-gated notifications, one card on the map, structured crisis sheet; a dedicated team gates which events get an SOS Alert (avoiding Facebook-style over-activation) — [TechCrunch](https://techcrunch.com/?p=1518291); [Google Maps Help](https://support.google.com/maps/answer/9985621)
- Smashing cites Australian Red Cross Rediplan as a model for preparing checklists, documents, meeting places and medical info before an emergency — [Smashing Magazine](https://smashingmagazine.com/2025/11/designing-for-stress-emergency/)

### Inferences
- The praised traits are all subtractive: fewer layers, fewer notifications, fewer words, one output. For the Haven app the design bar is "a stressed person can read the destination name and direction in under three seconds in sunlight, with one thumb."

### Gaps
- No design-award citations (e.g., Apple Design Awards, Fast Company Innovation by Design) were verifiable for any of these apps in this pass; Wired/Verge/Fast Company pages were unreachable.

## Consolidated design requirements for a one-tap "guide me to the nearest safe place" app (synthesis)

These are inferences drawn from the cited findings above, stated as requirements.

First screen
- One full-width primary button (min 64 pt tall, label "Take me to safety" or "Find nearest shelter"), above a minimal map showing only: my position with accuracy ring, hazard polygon(s), nearest safe destination. No feed, no comments, no donations, no login (Watch Duty login complaint; Citizen redesign).
- A single severity banner at the top, full-width, non-blocking (USWDS placement rule), with hazard + action + time in WEA-style 360 chars or less; tapping expands a sheet like Google's crisis sheet; never stack banners.
- No countdown on the routing tap (not destructive). If a "Call 911" or "Alert contacts" action exists, use press-and-hold plus a cancelable countdown with a visible "Slide to cancel" (Apple/Life360 pattern), and keep it visually separate from the routing button (NN/g Hawaii lesson).

Severity and color
- Three tiers mapped to Advisory / Warning / Take Action; muted, amber, red. Red used only as banner tint and hazard fill, not full-screen; safe destination and route are the only green/blue objects. Never color alone: add icon + text label (WCAG 1.4.1).
- Intrusive channels (Critical Alerts, full-screen, sound through DND) only for Take Action and only inside the geofence (NERV, Google earthquake).

Type, contrast, targets
- 7:1 contrast on alert text and route labels; 3:1 on map overlays; body 17-20 pt, destination name 24-28 pt bold; minimum tap target 48 x 48 with 8 spacing; honor system Dynamic Type to 200%; explicit light/dark toggle with a high-contrast light theme as the outdoor default; honor Reduce Motion (no pulsing markers).

Location fallbacks
- Request permission at first tap with one sentence, then the system prompt. Ladder: precise -> approximate with ring -> saved addresses (up to 5, FEMA/Notify NYC) -> drop a pin / type address -> region-level shelter list. Show "last updated" and accuracy; never a dead end or bare error.

Offline / low signal
- Precache shell, regional shelter list, and basemap tiles around saved addresses; on routing failure show bearing + distance compass view (what3words compass mode) and a text card (name, address, phone, distance) that survives at 2G/satellite bandwidth; label the state plainly ("Offline — last known shelters").

Alerts without blocking the map
- Banner at top, sheet from bottom, map stays interactive between them; `role="alert"` for Take Action, `role="status"` for others; alerts are removed when resolved, never hidden.

Accessibility
- WCAG 2.2 AA minimum, AAA contrast for alert content; VoiceOver/TalkBack labels on every map control; voice readout of the destination and next turn (Yurekuru voice warnings precedent); bilingual (English/Spanish, per FEMA WEA guidance).
