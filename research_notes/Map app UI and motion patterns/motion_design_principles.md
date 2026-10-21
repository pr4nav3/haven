# Motion Design and Minimalist UI Principles of "Feel-Great" Products (Linear, Arc, Flighty, Things 3, Raycast, Vercel, Family, Amie, Cron/Notion Calendar, Apple HIG)

Scope note: this is a web/PWA-first extraction for a React + Motion (formerly Framer Motion) app with one primary button, a bottom card/sheet, and a top status banner. Numbers are recorded exactly as the source gives them. Native-only effects are flagged as such. Several of the named products (Linear, Things 3, Amie, Cron, Raycast) have never published numeric motion specs; where the only material is secondhand, that is stated.

---

## Key Question 1: What durations, easing curves, and spring configs do these teams and designers actually recommend?

### Takeaway
The convergent rule across Emil Kowalski, Vercel's Web Interface Guidelines, Material 3, and Apple is: UI feedback animations stay under ~300 ms, default to an ease-out (decelerate) curve, use custom cubic-beziers rather than CSS keywords for anything beyond hover, and when springs are used, prefer low or zero bounce (Apple: bounce 0 is the "general purpose" spring; M3 effects springs use damping ratio 1). The two concrete, production-proven curves worth copying verbatim are Vaul's iOS-sheet curve `cubic-bezier(0.32, 0.72, 0, 1)` at 0.5 s and Material's standard/emphasized `cubic-bezier(0.2, 0, 0, 1)`.

### Cited Findings

**Emil Kowalski (ex-Vercel, author of Sonner and Vaul, animations.dev course)**
- "Your animations should also usually be shorter than 300ms." A 500 ms enter animation on a frequently used tool (Raycast example) would be frustrating. — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- Animations must hit 60 fps, otherwise "everything else we've talked about becomes useless." — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- For snappy UI use `ease-out`, which "starts fast and slows down at the end." Sonner's toast deliberately uses `ease` and runs a little slower than usual to feel more elegant. — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- "Easing is the most important part of any animation." Default to `ease-out` in most cases; use `ease-in-out` for moving an element already on screen; never `ease-in` for UI. — [emilkowal.ski/ui/good-vs-great-animations](https://emilkowal.ski/ui/good-vs-great-animations)
- Built-in CSS easing keywords "are usually not strong enough"; the author rarely uses them. `ease` is the exception for basic hover/background-color effects; everything else gets a custom curve (resources: easing.dev, easings.co). Custom curves "feel more energetic." — [emilkowal.ski/ui/good-vs-great-animations](https://emilkowal.ski/ui/good-vs-great-animations)
- Spring parameters named are stiffness, damping, mass; no numeric recommendation is given in the public article (links a visualizer instead). — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- Vaul drawer (bottom sheet): `transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)`; the curve is "taken from the Ionic Framework" and "closely matches" iOS; 0.5 s mimics the iOS Sheet. — [emilkowal.ski/ui/building-a-drawer-component](https://emilkowal.ski/ui/building-a-drawer-component)
- Vaul source constants: `TRANSITIONS.DURATION = 0.5`, `TRANSITIONS.EASE = [0.32, 0.72, 0, 1]`, `VELOCITY_THRESHOLD = 0.4`, `CLOSE_THRESHOLD = 0.25`, `SCROLL_LOCK_TIMEOUT = 100`, `BORDER_RADIUS = 8`, `NESTED_DISPLACEMENT = 16`, `WINDOW_TOP_OFFSET = 26`. — [vaul constants.ts](https://raw.githubusercontent.com/emilkowalski/vaul/main/src/constants.ts)
- Sonner toast stylesheet: toast `transition: transform 400ms, opacity 400ms, height 400ms, box-shadow 200ms`; container `transform 400ms ease`; swipe-out keyframe `200ms ease-out forwards`; loader `opacity 200ms, transform 200ms`; promise icon fade-in `300ms ease`; fade-in keyframe is opacity 0 + `scale(0.8)` to opacity 1 + `scale(1)`; no `cubic-bezier()` in the stylesheet, only `ease`, `ease-out`, `linear`. — [sonner styles.css](https://raw.githubusercontent.com/emilkowalski/sonner/main/src/styles.css)
- Secondhand (third-party summaries of the animations.dev course, not verified against the course): button press feedback 100-160 ms, tooltips/small popovers 125-200 ms, dropdowns/selects 150-250 ms, modals/drawers 200-500 ms; a dropdown with ease-in at 300 ms feels slower than ease-out at 300 ms because ease-in delays initial movement. — [tessl.io web-animation-design skill](https://tessl.io/registry/skills/github/Kiz8-Team/open-agents/web-animation-design); [skills.cat emilkowal-animations](https://skills.cat/skills/mrmps/smry/emilkowal-animations)

**Vercel Web Interface Guidelines (Rauno Freiberg / vercel-labs)**
- "Prefer CSS, avoid main-thread JS-driven animations when possible." "Prioritize GPU-accelerated properties (`transform`, `opacity`)." "Choose easing based on what changes (size, distance, trigger)." "Explicitly list only the properties you intend to animate" (no `transition: all`). — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)
- Secondhand, unverified Vercel/Geist-style tokens from a third-party token sheet: fast 150 ms, base 200 ms, standard easing `cubic-bezier(0.2, 0, 0, 1)`. Vercel's official Geist docs list no motion section (foundations are colors, typography, materials, grid). — [open-design.ai Vercel tokens](https://open-design.ai/de/plugins/design-system-vercel/); [vercel.com/geist](https://vercel.com/geist)

**Material Design 3 motion tokens (official token source file)**
- Durations: short1 50 ms, short2 100 ms, short3 150 ms, short4 200 ms, medium1 250 ms, medium2 300 ms, medium3 350 ms, medium4 400 ms, long1 450 ms, long2 500 ms, long3 550 ms, long4 600 ms, extra-long1 700 ms, extra-long2 800 ms, extra-long3 900 ms, extra-long4 1000 ms. — [material-web _md-sys-motion.scss v0_192](https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss)
- Easings: emphasized `cubic-bezier(0.2, 0, 0, 1)`; emphasized-accelerate `cubic-bezier(0.3, 0, 0.8, 0.15)`; emphasized-decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)`; standard `cubic-bezier(0.2, 0, 0, 1)`; standard-accelerate `cubic-bezier(0.3, 0, 1, 1)`; standard-decelerate `cubic-bezier(0, 0, 0, 1)`; legacy `cubic-bezier(0.4, 0, 0.2, 1)`; legacy-accelerate `cubic-bezier(0.4, 0, 1, 1)`; legacy-decelerate `cubic-bezier(0, 0, 0.2, 1)`; linear `cubic-bezier(0, 0, 1, 1)`. — [material-web _md-sys-motion.scss v0_192](https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss)
- M3 Expressive physics springs (from third-party Flutter ports of the spec; Google's own page could not be fetched, so treat as unverified): expressive spatial default stiffness 380 / damping ratio 0.8 (one package says 0.73), fast 800 / 0.6, slow 200 / 0.8; standard spatial damping 0.9 with stiffness 1400 fast, 700 default, 300 slow; effects springs (opacity, color, scale) damping ratio 1 with stiffness 3800 fast, 1600 default, 800 slow. Effects springs are non-bouncy by design. — [pub.dev motor](https://pub.dev/documentation/motor/latest/); [pub.dev material_expressive](https://pub.dev/documentation/material_expressive/0.7.0/)

**Apple (HIG and WWDC23 "Animate with springs")**
- Apple's spring API takes only `duration` and `bounce`; omitting bounce gives bounce 0, described as "a great general purpose spring." Bounce range -1.0 to 1.0. About 15% bounce "doesn't feel very bouncy"; about 30% is "noticeable bounciness"; be cautious above ~0.4 for UI elements. Example values in session code: `.spring(duration: 0.6, bounce: 0.2)`, `duration 0.5, bounce 0.2`, `duration 0.4, bounce 0.2`; a direct example `mass 1, stiffness 100, damping 10`. Presets smooth, snappy, bouncy (numeric values not given in notes); snappy can be tuned with `duration 0.4` or `extraBounce 0.1`. — [wwdcnotes WWDC23 10158](https://wwdcnotes.com/documentation/wwdc23-10158-animate-with-springs/)
- Settling duration is unpredictable; do not wait for it before making user-facing changes. SwiftUI completion handlers fire on perceptual duration instead. — [wwdcnotes WWDC23 10158](https://wwdcnotes.com/documentation/wwdc23-10158-animate-with-springs/)
- HIG: "Aim for brevity and precision in feedback animations." Brief, precise feedback "tends to feel lightweight and unobtrusive, and it can often convey information more effectively than prominent animation." — [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

**Motion (Framer Motion) library defaults**
- Spring defaults: `stiffness 1`, `damping 10`, `mass 1` when physics-based; duration-based springs use `duration` + `bounce` (default bounce `0.25`; 0 is critically damped, negative is overdamped with no overshoot); `visualDuration` overrides duration and makes springs easier to coordinate with time-based animations; `restSpeed 0.1`, `restDelta 0.01`. Setting stiffness/damping/mass overrides bounce/duration. Tween default duration `0.3` s (`0.8` when multiple keyframes). Duration-based springs "can be generated as pure CSS." — [motion.dev react-transitions](https://motion.dev/docs/react-transitions)

**Josh Comeau (spring intuition)**
- Tension = stiffness; friction = damping ("the force that dampens the motion"); mass = heft. Sandbox example values: mass 1.75, tension 200, friction 12. Most of the author's spring animations are not bouncy; springs are for motion, not for color/opacity. Springs must run in JS and can stutter on a busy main thread. — [joshwcomeau.com spring physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)

**Flighty (native, secondhand breakdown)**
- Status badge uses a SwiftUI spring with `response 0.3`; progress bar is a linear 60-second continuous animation; "motion should serve function, not decoration." (Third-party teardown, not Flighty's own spec.) — [blakecrosley.com Flighty guide](https://blakecrosley.com/guides/design/flighty)

### Inferences
- A practical token set for the Haven app that is consistent with every primary source above: `fast 150 ms`, `base 200 ms`, `slow 300 ms` (hard ceiling for feedback), `sheet 500 ms`; default easing `cubic-bezier(0.2, 0, 0, 1)` (M3 standard; also the secondhand Vercel value) for enter/move, M3 `standard-accelerate` `cubic-bezier(0.3, 0, 1, 1)` for exits, and Vaul's `cubic-bezier(0.32, 0.72, 0, 1)` for the bottom sheet.
- In Motion, prefer `type: "spring", visualDuration: 0.3, bounce: 0` to `0.15` for most UI (Apple's bounce guidance maps directly onto Motion's `bounce` option). Reserve bounce 0.2-0.3 for a single celebratory moment, never for a status banner.
- Motion's physics defaults (stiffness 1, damping 10) are placeholders, not recommendations; teams should set explicit values or use duration/bounce.

### Gaps
- Linear has published no motion durations, easings, or spring values; their redesign post covers color (LCH), typography (Inter Display), density, and alignment but states nothing about motion. — [linear.app redesign post](https://linear.app/blog/how-we-redesigned-the-linear-ui)
- Raycast, Things 3 (Cultured Code), Amie, and Cron/Notion Calendar have no published numeric motion specs found in 2023-2026 sources.
- Google's official M3 Expressive spring token page could not be fetched (JS-rendered); the stiffness/damping values above come from third-party ports and disagree on one value (0.73 vs 0.8).
- Emil Kowalski's animations.dev course content is paywalled; the per-component duration ranges are secondhand.

---

## Key Question 2: Choreography rules: staggering, shared-element transitions, enter vs exit asymmetry, reduced motion

### Takeaway
The shared rules are: motion must show where things come from (anchor transform-origin to the trigger; "fly instead of teleport"), exits are faster and subtler than enters, staggers are small (0.05-0.1 s per item), every animation must be interruptible, and reduced motion means replacing transforms with opacity/color fades rather than removing feedback entirely.

### Cited Findings

**Origin and spatial continuity**
- Dropdowns should animate from the button that opens them; default `transform-origin` is `center`, change it (e.g. `bottom center`); Radix exposes `--radix-popover-content-transform-origin`; shadcn/ui already handles this. — [emilkowal.ski/ui/good-vs-great-animations](https://emilkowal.ski/ui/good-vs-great-animations)
- "Anchor motion to where it 'physically' starts." — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)
- Motion should show where content comes from: expanded views launch from their source; a single-instance element can launch from its origin without needing to indicate its source. — [rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)
- Family wallet: tab switches move in the direction of the tapped tab, "We fly instead of teleport"; each subsequent tray has a different height so transitions read clearly (content is sometimes rewritten to achieve this); persistent components like wallet cards "should remain consistent" across transitions rather than duplicate; a spinner physically moves to the Activity tab to show where a pending transaction went; button labels morph ("Continue" to "Confirm") using shared letters. — [benji.org/family-values](https://benji.org/family-values)
- Family's card-to-sheet morph: tapping a wallet card's menu icon scales the card into the header of a full-screen settings sheet and close reverses it; grouping sort reorganizes the card grid with staggered spring physics. — [60fps.design card morph](https://60fps.design/shots/family-wallet-card-morph-to-screen-transition); [60fps.design grouping sort](https://60fps.design/shots/family-wallet-grouping-sort-animation)
- Apple HIG: "Strive for realistic feedback motion that follows people's gestures and expectations" (a view revealed by sliding down should not dismiss by sliding sideways). — [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

**Enter vs exit asymmetry**
- Jakub Krehel: exit animations usually work better when they are more subtle than enter animations; animations must be interruptible because users change intent mid-interaction. (Reported via a search summary of his published tips; the full issues on interfaces.dev are paywalled.) — [longlist.design Jakub Krehel](https://longlist.design/designer/jakub); [interfaces.dev](https://interfaces.dev)
- Sonner: enter is 400 ms translate + opacity; swipe-out exit is 200 ms ease-out; collapsed non-front toasts exit with `transform 500ms, opacity 200ms` (opacity leads so the element disappears early). — [sonner styles.css](https://raw.githubusercontent.com/emilkowalski/sonner/main/src/styles.css)
- Material tokens encode the asymmetry structurally: `*-decelerate` curves for entering, `*-accelerate` curves for exiting (emphasized-accelerate `cubic-bezier(0.3, 0, 0.8, 0.15)` vs emphasized-decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)`). — [material-web _md-sys-motion.scss](https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss)
- Motion `AnimatePresence` modes: `sync` (default), `wait` (enter waits for exit, one child only), `popLayout` (exiting element removed from layout so siblings reflow immediately; requires `forwardRef` on custom children and non-static `position` on the parent). `initial={false}` suppresses mount animation for pre-existing children. Keep `AnimatePresence` outside the conditional; use stable keys, not array indexes. — [motion.dev react-animate-presence](https://motion.dev/docs/react-animate-presence)

**Stagger**
- `stagger(0.1)` yields 0, 0.1, 0.2 s; examples use `0.05`; options `startDelay` (default 0), `from` (`"first"` default, `"center"`, `"last"`, `"edges"`, `"random"`, index), `grid`, `ease` (default linear). In React use `delayChildren: stagger(...)` in the parent variant's transition (not the old `staggerChildren`). — [motion.dev stagger](https://motion.dev/docs/stagger)

**Shared-element / layout transitions**
- `layout` prop animates size/position changes made via `style` or `className` (not via `animate`); `layoutId` on two elements produces a shared transition; if both are mounted they crossfade; for exiting elements wrap in `AnimatePresence`. The transition on the element animated **to** is used. `layout="position"` for aspect-ratio changes (images). `borderRadius` and `boxShadow` are scale-corrected only when set via `style`. Use `LayoutGroup` for siblings that do not re-render together, `layoutScroll` on scroll containers, `layoutRoot` on fixed containers. Pitfalls: `display: inline` blocks transforms; scrollbar appearance triggers unwanted layout animation (use `scrollbar-gutter: stable`). Motion animates live elements (interruptible, does not block pointer events) whereas the View Transitions API crossfades screenshots. — [motion.dev react-layout-animations](https://motion.dev/docs/react-layout-animations)
- Jakub Krehel has a dedicated free issue "How I use shared layout animations" (contents not retrievable here). — [interfaces.dev](https://interfaces.dev)

**Interruptibility**
- "Animations should be interruptible at any time"; CSS transitions reverse smoothly mid-flight; Framer Motion also supports this. — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- "Animations are cancelable by user input." — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)
- Apple: "Let people cancel motion"; don't make people wait for an animation to complete, "especially if they have to experience the animation more than once." — [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Rauno: apply the gesture's delta immediately, then animate once a threshold is passed; pure 0-to-1 animations feel unresponsive; preserve release velocity; lighter objects bounce less; destructive actions trigger only on gesture end, lightweight reversible ones can trigger mid-gesture. — [rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)

**Reduced motion**
- Emil: swap `bounce` for `fade` under `prefers-reduced-motion`, both at 0.2 s; in Framer Motion use `useReducedMotion` and set the closed x-offset to `0` instead of `"-100%"`. — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- Motion: `<MotionConfig reducedMotion="user">` disables transform and layout animations on all `motion` components but keeps `opacity` and `backgroundColor`; `"always"`/`"never"` override; `useReducedMotion()` for custom logic; replace `x`/`y`/scale with fades on large elements, disable autoplay video and parallax, keep opacity/color. — [motion.dev react-accessibility](https://motion.dev/docs/react-accessibility)
- Sonner: `@media (prefers-reduced-motion)` sets `transition: none !important; animation: none !important`. — [sonner styles.css](https://raw.githubusercontent.com/emilkowalski/sonner/main/src/styles.css)
- Vercel guidelines: "Provide a reduced-motion variant"; motion longer than 5 s alongside other content needs pause/stop/hide controls; gate looping MP4 sources with `prefers-reduced-motion`. — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)
- Apple: "Make motion optional"; never use motion as the only way to communicate important information; supplement with haptics and audio. App Store reduced-motion criteria flag scaling, spinning, peripheral motion, large objects flying in/out, and sustained oscillation near 0.2 Hz; iOS 18 zoom transition auto-falls back under Reduce Motion but custom animations need manual handling. — [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion); [App Store Connect reduced-motion criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria)

### Inferences
- For the Haven layout (button, bottom card, top banner): the card should enter with a decelerate curve or low-bounce spring from the bottom edge and exit faster with an accelerate curve; the banner should enter by sliding from the top edge (Sonner's `translateY(-100%)` to `0` pattern) and exit primarily via opacity so it never "pushes" the map.
- Stagger within the bottom card should be 0.03-0.06 s per row with `delayChildren: stagger(0.05)`; anything above 0.1 s per item will breach the 300 ms budget by the third item.
- Reduced-motion variant: keep the same state changes but convert translate/scale to opacity at 0.2 s (Emil's number), and keep the banner's color change since Motion treats color as safe.

### Gaps
- No source gives a recommended stagger value tied to a specific product (Family's "staggered spring physics" is described qualitatively only).
- Jakub Krehel's "4 principles of transition" and "Reviewing your animations" issues are paywalled; their rules could not be extracted.

---

## Key Question 3: What makes a single prominent CTA button feel satisfying to press on the web? Press scale, haptic-like feedback, loading morphs, success states

### Takeaway
The consensus web recipe is: `transform: scale(0.97)` on `:active` (range 0.95-0.98) with a ~150-160 ms ease-out, applied only to enabled elements; keep the label visible during loading with a spinner that has a 150-300 ms show delay and a 300-500 ms minimum visible time; keep the button's height constant across idle/loading/success; draw the success check with an SVG stroke rather than fading an icon. Haptics are native-only (iOS Safari does not support `navigator.vibrate`), so "physicality" on the web comes from press scale, contrast change, and spring settle.

### Cited Findings
- Emil Kowalski's skills repo (via summary): `transform: scale(0.97)` on `:active` with a 160 ms ease-out transition; keep scale between 0.95 and 0.98; apply to "any pressable element" (buttons, pressable cards); disabled buttons must not show `:active` scale; in Framer Motion avoid the `scale` shorthand ("not hardware-accelerated under load"), use `whileTap={{ transform: 'scale(0.97)' }}` with 0.16 s and `easeOut`; never animate width/height; missing `:active` states are "feel-breaking" high-severity issues; modals may need an adjusted transform origin. — [instagit summary of emilkowalski/skills](https://instagit.com/emilkowalski/skills/button-press-feedback-with-scale-transform/)
- Other reference values: react-ui-animate suggests press scale 0.94-0.97, slightly smaller than any hover scale; Rainbow wallet's React Native button defaults to press scale 0.96 with optional haptics; Tailwind `active:scale-95` is the common 0.95 variant. — [react-ui-animate press animations](https://react-ui-animate.js.org/docs/interactive/press-animations); [Rainbow button docs](https://www.mintlify.com/rainbow-me/rainbow/components/buttons)
- Vercel guidelines: "`:hover`, `:active`, `:focus` have more contrast than rest state." Loading buttons: "Show a loading indicator & keep the original label." "Keep submit enabled until submission starts; then disable during the in-flight request, show a spinner" and include an idempotency key. Spinner: "add a short show-delay (~150-300 ms) & a minimum visible time (~300-500 ms)." Progress labels use an ellipsis ("Saving…"). Destructive actions: "Require confirmation or provide Undo with a safe window." Latency budget: "`POST/PATCH/DELETE` complete in <500ms." Optimistic UI: "Update the UI immediately when success is likely; reconcile on server response." Hit targets: visual < 24 px gets a ≥ 24 px hit target; mobile minimum 44 px. "Set `touch-action: manipulation`" to kill double-tap zoom delay; tap highlight color should follow the design. — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)
- Arc (Nate Parrott): buttons should feel physical when pressed, "a button that has a sharp press" vs "a button that's like deep and low"; "Physicality is like a shortcut to joy"; products should be "fidget-able"; haptics are cited as a native enabler. — [Inverse Arc mobile interview](https://www.inverse.com/gear/arc-web-browser-mobile-app-skeuomorphism-design)
- Rauno: fidgetable details enhance delight (noting no scientific research supports it); show enlarged previews because fingers hide content. — [rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)
- Family: button labels morph using shared letters ("Continue" to "Confirm"); delight is concentrated on rarely used moments (confetti after wallet backup) because its impact drops with repetition. — [benji.org/family-values](https://benji.org/family-values)
- Loading-to-success morph patterns: Codrops circular progress button (button shrinks to a circle while loading, expands and draws a check on success, thin round-capped stroke); Zinc animated button keeps four states (idle, processing, success, failure), disables during processing, keeps height constant, respects `prefers-reduced-motion`, uses an aria-live region; 21st.dev Morph Button (framer-motion) draws a check on success and shakes on failure. — [Codrops circular progress button](https://tympanus.net/codrops/2014/04/09/how-to-create-a-circular-progress-button/); [Zinc animated button](https://cdn.jsdelivr.net/npm/@kubex/zinc@1.1.54/src/components/animated-button/README.md); [21st.dev Morph Button](https://21st.dev/@arihantcodes_1f7b8c4d/components/morph-button.md)
- Apple HIG: feedback animation that is "precisely tied to a successful action" lets people "instantly get the message." — [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Web haptics: no search result covered `navigator.vibrate`; iOS Safari has not supported it (my knowledge, flagged as unverified in the search summary). Native-only. — [search summary](https://www.techinterview.org/post/3233475371/build-bottom-sheet-component-mobile-web/)

### Inferences
- Implementation for the Haven primary button in Motion: `whileTap={{ scale: 0.97 }}` (or the `transform` form per Emil) with `transition={{ duration: 0.16, ease: "easeOut" }}`; on release let a spring with `visualDuration 0.25, bounce 0.1` carry it back so the release feels like a settle rather than a snap; darken/raise contrast on `:active`; `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on the element.
- Loading state: keep the label, add a spinner after a 150 ms delay, show it at least 300 ms, lock width/height so the morph is transform/opacity-only; success state swaps to an SVG check drawn via `pathLength` (Motion animates `pathLength` directly) over ~300 ms, then returns to idle or disables.
- A "haptic-like" tick on the web can be simulated with a 1-frame-delayed scale overshoot (e.g. 0.97 to 1.01 to 1.0) but only sources on native haptics exist; this is inference, not cited guidance.

### Gaps
- No source gives a measured "optimal" press scale from user research; 0.95-0.98 is designer convention.
- No source among the named products documents their exact button loading/success choreography on the web.

---

## Key Question 4: How do Family, Arc, and Flighty handle bottom sheets, cards, and status banners so they feel native on web/PWA?

### Takeaway
Family's trays are the clearest documented model: one action per tray, every tray a different height, a title plus a dismiss/back icon, trays that "unfold" from the component that triggered them, and theme-matched surfaces. On the web, Vaul reproduces the iOS sheet physics (0.5 s `cubic-bezier(0.32, 0.72, 0, 1)`, close at 25% drag or velocity 0.4, drag only when content is scrolled to top, 100 ms scroll-lock, background scale). Flighty's status model is a color-coded capsule badge (green/amber/red), a dedicated "delayed" state, and warning banners with a tighter 8 pt radius than cards at 12 pt; Arc's contribution is depth, shadow, and "sharp press" physicality rather than sheet mechanics.

### Cited Findings

**Family (native iOS, principles transfer to web)**
- Three values: "Simplicity ensures accessibility, fluidity maintains continuity of experience, and delight fosters meaningful connections." The app behaves as if following "unbreakable physical rules" when navigating. — [benji.org/family-values](https://benji.org/family-values)
- Trays: open from buttons, icons, or push notifications; float over content or emerge from within components; each subsequent tray has a different height so transitions are clear; every tray has a title and an icon that dismisses or goes back one step; each tray focuses on one piece of content or one action (e.g. a pre-transaction checklist); trays match the context's theme (darker in dark flows); suited to transient actions like confirmations and warnings, and can expand into full-screen flows; the swap approval tray "unfolds from the swap interface itself." Trays were partly inspired by Craft; reordering was inspired by Things. — [benji.org/family-values](https://benji.org/family-values)
- Delight is selective and front-loaded to rare moments (wallet setup, backup confetti, trash tumble with sound) since impact drops with repetition. — [benji.org/family-values](https://benji.org/family-values)
- Third-party: the expanding/contracting "tray system inspired many recreations." — [yespress.io Benji Taylor](https://yespress.io/benji-taylor)

**Arc (native mobile)**
- Mobile Arc aims at "skeuomorph-ish" physicality: depth, shadows, 3D, textures, grain; "delightful animations, interactions, and haptics"; "Neumorphism is like skeuomorphism without the fun." No sheet or bottom-bar mechanics are described. — [Inverse Arc mobile interview](https://www.inverse.com/gear/arc-web-browser-mobile-app-skeuomorphism-design)
- Design prioritizes "fingerprints" over consistency (episode teaser; actual quotes not retrievable). — [Dive Club fingerprints](https://dive-club.beehiiv.com/p/fingerprints)

**Flighty (native iOS; status/banner model)**
- Status values onTime / delayed / cancelled map to green `#10B981`, amber `#F59E0B`, red `#EF4444`; boarding blue `#3B82F6`; status badges are white bold caption text in a capsule filled with the status color, with a numeric text transition; cards are white on `#F9FAFB` with a 12 pt corner radius on maps; tight-connection warnings use an orange-tinted banner with a warning icon and an 8 pt radius; a dedicated `delayed` smart state exists among 15 context-aware states (thresholds 1 h, 3 h, 24 h). Status badge spring `response 0.3`. (Third-party teardown; values are the author's reconstruction, not Flighty's published spec.) — [blakecrosley.com Flighty guide](https://blakecrosley.com/guides/design/flighty)
- Ryan Jones: "We want Flighty to work so well that it feels almost boringly obvious"; "There's something comforting about information always being there"; "We really have to shine when things go awry"; airport boards "have one line per flight… they've had 50 years of figuring out what's important." — [Apple Behind the Design: Flighty](https://developer.apple.com/news/?id=970ncww4)
- Flighty won the 2023 Apple Design Award for Interaction. — [Wikipedia Flighty](https://en.wikipedia.org/wiki/Flighty)

**Web bottom sheets (Vaul and general PWA mechanics)**
- Vaul: `transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)`; drag applied as `transform: translateY(px)` directly (updating a CSS variable per frame caused style recalc lag with ~20+ list items); upward over-drag is damped ("the more you drag, the less the drawer will move"); closing is momentum-based (flick closes without full distance); 100 ms timeout blocks dragging after scroll returns to top; `shouldDrag` only when content is scrolled to top; snap points as viewport fraction or fixed px; strong flicks skip snap points; `visualViewport` listener repositions for keyboard; `theme-color` meta is interpolated over 50 steps every 10 ms (500 ms) with the same bezier so Safari's chrome matches the overlay; built on Radix Dialog. Pitfalls: accepting extra touches mid-drag makes the drawer jump; linear color interpolation mismatches a custom curve. — [emilkowal.ski/ui/building-a-drawer-component](https://emilkowal.ski/ui/building-a-drawer-component)
- Vaul constants: `VELOCITY_THRESHOLD 0.4`, `CLOSE_THRESHOLD 0.25`, `SCROLL_LOCK_TIMEOUT 100`, `BORDER_RADIUS 8`, `NESTED_DISPLACEMENT 16`, `WINDOW_TOP_OFFSET 26`. — [vaul constants.ts](https://raw.githubusercontent.com/emilkowalski/vaul/main/src/constants.ts)
- Vaul API defaults: `dismissible true`, `handleOnly false`, `direction bottom`, `modal true`, `repositionInputs true`; `snapPoints`, `fadeFromIndex`, `snapToSequentialPoint` for snap behavior. — [vaul API](https://vaul.emilkowal.ski/api)
- PWA mechanics: `touch-action: pan-y` and `overscroll-behavior: contain` on the sheet body stop iOS bounce fighting the drag; scroll content when not at top, drag sheet when at top; `viewport-fit=cover` plus `env(safe-area-inset-bottom)` keeps bottom-fixed elements visible; in standalone mode put safe-area padding on the app shell inside `@media (display-mode: standalone)` rather than on `body`; listen to `visualViewport` for keyboard. — [techinterview bottom sheet guide](https://www.techinterview.org/post/3233475371/build-bottom-sheet-component-mobile-web/); [spicefactory native-like PWAs](https://spicefactory.co/blog/native-like-pwas.md); [Chrome overscroll-behavior](https://developer.chrome.com/blog/overscroll-behavior)
- Vercel guidelines: "Set `overscroll-behavior: contain` intentionally e.g., in modals/drawers"; keep page overscroll defaults on coarse-pointer devices to preserve pull-to-refresh (apply `none` on `<html>` only under `@media (pointer: fine)`); "Account for notches & insets with safe-area variables"; set `<meta name="theme-color">` to match the page; `<input>` font-size ≥ 16 px on mobile to prevent iOS Safari auto-zoom; "Never disable browser zoom"; "Skeletons mirror final content exactly to avoid layout shift"; "Don't rely on color alone; include text labels"; "Use polite aria-live for toasts." — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)

**Top status banners (Sonner as the web reference)**
- Sonner top-position toasts enter from `translateY(-100%)` + opacity 0 to `translateY(0)` + opacity 1 over 400 ms; swipe direction changes with position; stacked older toasts scale by `0.05` per index behind the front one and fade their children to opacity 0; expanded hover bridge adds `gap + 1px` of hit area; six positions including top-center. — [sonner styles.css](https://raw.githubusercontent.com/emilkowalski/sonner/main/src/styles.css); [sonner.emilkowal.ski](https://sonner.emilkowal.ski/)

### Inferences
- For Haven's bottom card: use Vaul (or replicate its constants in Motion with `drag="y"`, `dragElastic` low for upward over-drag, close when offset > 25% of height or velocity > 0.4 px/ms), 8-12 px top radius, `overscroll-behavior: contain`, `env(safe-area-inset-bottom)` padding, and distinct heights per step if the card has multiple states (Family rule).
- For the top status banner: slide from `translateY(-100%)` with opacity, color-coded capsule plus text label (Flighty + Vercel "don't rely on color alone"), `aria-live="polite"`, exit via opacity-first; update the `theme-color` meta while a warning banner is shown so Safari's status bar matches (Vaul technique).
- Native-only: haptics, Live Activities/Dynamic Island, SwiftUI `response` springs, Arc's 3D/grain materials. Web substitutes: press scale, shadow depth via `box-shadow` transitions at 200 ms (Sonner's number), and `theme-color` interpolation.

### Gaps
- No primary source describes Arc mobile's sheet/card mechanics; only the aesthetic direction is documented.
- Flighty's exact colors/radii/springs come from one unverified third-party reconstruction.
- No source quantifies Family's tray spring values.

---

## Key Question 5: Common anti-patterns that make animation feel cheap or slow

### Takeaway
Across Emil, Rauno, Vercel, Apple, and Motion, the recurring anti-patterns are: animating frequent or keyboard-driven actions, exceeding ~300 ms, using ease-in or linear for UI, `transition: all`, animating layout properties (width/height/padding/margin), uninterruptible or input-blocking animations, animations that don't originate from their trigger, gratuitous bounce, and ignoring reduced motion.

### Cited Findings
- Animating keyboard-initiated or highly repeated actions; adding animations everywhere ("dilutes their impact"); instant state changes feel artificial; animating padding/margin (layout-triggering); JS-driven animation on a busy main thread (Framer Motion uses `requestAnimationFrame`, not hardware-accelerated); not reviewing animations the next day with fresh eyes. — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- Tying visuals directly to mouse position without easing feels artificial; decorative spring interpolation is fine but "for a functional graph… no animation is better." Tabs transitions that animate the highlight but not the text color look mismatched; check in slow motion. — [emilkowal.ski/ui/good-vs-great-animations](https://emilkowal.ski/ui/good-vs-great-animations)
- Waiting for an animation to finish before accepting input; animating high-frequency, low-novelty actions (command menus, app switchers, context menus "often feel better without animation"); committing destructive actions mid-gesture; pure 0-to-1 animations with no gesture tracking; "Animation shouldn't be the default." — [rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)
- Apple: "Don't add motion for the sake of adding motion. Gratuitous or excessive animation can distract people and may make them feel disconnected or physically uncomfortable." "In apps, generally avoid adding motion to UI interactions that occur frequently." — [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Apple springs: bounce above ~0.4 "may feel too exaggerated for UI elements"; waiting for settling duration is a mistake. — [wwdcnotes WWDC23 10158](https://wwdcnotes.com/documentation/wwdc23-10158-animate-with-springs/)
- Vercel: `transition: all`; autoplay (except muted non-essential loops); main-thread JS animation; animating `width`, `height`, `top`, `left`; disabling browser zoom; spinners with no show-delay (flash) or no minimum visible time (flicker); skeletons that don't match final content (layout shift); dead zones in controls. — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)
- Vaul: per-frame CSS variable updates on large subtrees cause style recalculation lag; accepting extra touches mid-drag; linear color interpolation against a bezier-eased movement. — [emilkowal.ski/ui/building-a-drawer-component](https://emilkowal.ski/ui/building-a-drawer-component)
- Motion pitfalls: array-index keys; `AnimatePresence` inside the conditional; `display: inline` elements; scrollbar appearance triggering layout animation; horizontal window resize blocking layout animations. — [motion.dev react-layout-animations](https://motion.dev/docs/react-layout-animations); [motion.dev react-animate-presence](https://motion.dev/docs/react-animate-presence)
- Family: a static (non-animated) regroup is "digital whiplash"; "teleporting" between tabs instead of flying. — [benji.org/family-values](https://benji.org/family-values)
- Emil's skills repo (summary): press scale outside 0.95-0.98; Framer Motion `scale` shorthand under load; press feedback on disabled elements; missing `:active` states. — [instagit summary of emilkowalski/skills](https://instagit.com/emilkowalski/skills/button-press-feedback-with-scale-transform/)
- Raycast: third-party guides claim Raycast has no open/close animation because keyboard-triggered actions repeat many times a day; Raycast's own stated principles are "fast, simple, and delightful." The "no animation" claim is not from Raycast. — [raycast.com fresh look and feel](https://www.raycast.com/blog/a-fresh-look-and-feel); [claudeskills emil-design-eng summary](https://claudeskills.info/zh-hant/skills/sickn33/agentic-awesome-skills/emil-design-eng/)

### Inferences
- The biggest "cheap" tells for a map app with a single CTA are: a bouncy sheet, a banner that pushes content down (layout animation) instead of overlaying, a button that scales while disabled, and a spinner that flashes for 50 ms on fast networks.
- Linear's "feel fast" reputation per interviews is attributed to quality-first craft and optimistic/local-first behavior, not to animation; on the web this maps to Vercel's optimistic UI rule (update immediately, reconcile, roll back with Undo). — [Sequoia Linear spotlight](https://sequoiacap.com/article/linear-spotlight/); [Lenny's Inside Linear](https://www.lennysnewsletter.com/p/inside-linear-building-with-taste)

### Gaps
- No source quantifies the frame-drop threshold at which users perceive "cheapness" beyond "hit 60 fps."

---

## Key Question 6: Best React libraries in 2025-2026 for this: Motion, React Spring, GSAP, Vaul, Radix, shadcn/ui

### Takeaway
Motion (MIT) is the default for component-state, enter/exit, gesture, and layout/shared-element work in React; GSAP (now free for commercial use since 30 April 2025) is preferred for long choreographed timelines and scroll effects; React Spring is a physics-first alternative with less momentum; Vaul (built on Radix Dialog) is the standard bottom sheet; Radix/shadcn supply accessible primitives with origin-aware transform variables that Emil explicitly recommends. Emil's caveat stands: Motion animates via `requestAnimationFrame` and can lag under main-thread load, so keep press feedback and simple transitions in CSS where possible.

### Cited Findings
- Motion vs GSAP: Motion is declarative, "a natural extension of React" with animations defined via props; GSAP is imperative. (Vendor page; bundle-size claims not independently verified.) — [motion.dev gsap-vs-motion](https://motion.dev/docs/gsap-vs-motion)
- Syncfusion: Motion feels more natural for component-state, enter/exit, and gesture work; GSAP gives more control for choreographed sequences and advanced scroll effects. — [Syncfusion Motion vs GSAP](https://www.syncfusion.com/blogs/post/motion-vs-gsap-react)
- GSAP's paywall was dropped on April 30, 2025 and the standard license expanded to cover commercial use; Motion is MIT. — [OpenReplay Motion vs GSAP](https://blog.openreplay.com/motion-vs-gsap/)
- React Spring is described as the choice for physics-based animation but receives the least comparative coverage; PkgPulse reports roughly 6M weekly downloads for Motion, 3M GSAP, 2.5M React Spring (unverified against npm). — [PkgPulse best React animation libraries 2026](https://www.pkgpulse.com/guides/best-react-animation-libraries-2026)
- Motion's duration-based springs "can be generated as pure CSS, so you don't need to ship Motion to the browser"; `visualDuration` coordinates springs with time-based animations. — [motion.dev react-transitions](https://motion.dev/docs/react-transitions)
- Motion animates live elements (interruptible, non-blocking) vs the View Transitions API's screenshot crossfade. — [motion.dev react-layout-animations](https://motion.dev/docs/react-layout-animations)
- Emil: hardware-accelerated CSS or WAAPI animations "will remain smooth, no matter how busy the main thread is"; Framer Motion's rAF loop is not hardware-accelerated. — [emilkowal.ski/ui/great-animations](https://emilkowal.ski/ui/great-animations)
- Emil: Radix exposes `--radix-popover-content-transform-origin`; shadcn/ui already applies origin-aware animation. — [emilkowal.ski/ui/good-vs-great-animations](https://emilkowal.ski/ui/good-vs-great-animations)
- Vaul is built on Radix's Dialog primitive for accessibility and focus management with a Radix-modeled API; it is named as the common React bottom-sheet choice that handles scroll-coordination edge cases. — [emilkowal.ski/ui/building-a-drawer-component](https://emilkowal.ski/ui/building-a-drawer-component); [techinterview bottom sheet guide](https://www.techinterview.org/post/3233475371/build-bottom-sheet-component-mobile-web/)
- Sonner is "an opinionated toast component for React" with top-center positioning and swipe-to-dismiss, usable as a status-banner base. — [sonner.emilkowal.ski](https://sonner.emilkowal.ski/)
- Josh Comeau: native CSS spring support exists only in Safari; `linear()` is a partial workaround; JS springs can stutter on a busy main thread. — [joshwcomeau.com spring physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)
- Vercel guideline ordering: "Prefer CSS, avoid main-thread JS-driven animations when possible" (CSS first, then WAAPI, then JS libraries). — [vercel-labs/web-interface-guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/README.md)

### Inferences
- Recommended stack for Haven: Motion for the card's enter/exit, `layoutId` morphs, and button `whileTap`; Vaul for the draggable bottom sheet (or Motion `drag="y"` with Vaul's constants if a custom look is required); Radix/shadcn for dialogs/popovers; Sonner or a custom Motion banner for top status. Skip GSAP unless a scroll-driven or multi-second choreographed sequence appears. Keep `:active` press scale in CSS as a fallback so feedback survives main-thread jank.
- Use Motion's `visualDuration` + `bounce` form rather than raw stiffness/damping; it maps directly to Apple's duration/bounce mental model and can be exported to CSS.

### Gaps
- No 2025-2026 source benchmarks Motion vs React Spring on mobile Safari frame stability.
- No source found evaluating Vaul against other React bottom-sheet libraries beyond naming it as the default.

---

## Appendix: Consolidated numeric cheat sheet (all values from sources above)

| Item | Value | Source |
|---|---|---|
| UI animation ceiling | < 300 ms | emilkowal.ski/ui/great-animations |
| Press scale | 0.97 (range 0.95-0.98), 160 ms ease-out | emilkowalski/skills (summary) |
| Spinner show-delay / min visible | 150-300 ms / 300-500 ms | vercel-labs/web-interface-guidelines |
| Mutation latency budget | < 500 ms | vercel-labs/web-interface-guidelines |
| Mobile hit target | ≥ 44 px (≥ 24 px desktop) | vercel-labs/web-interface-guidelines |
| Mobile input font-size | ≥ 16 px | vercel-labs/web-interface-guidelines |
| Bottom sheet curve / duration | `cubic-bezier(0.32, 0.72, 0, 1)` / 0.5 s | Vaul |
| Sheet close threshold / velocity | 25% of height / 0.4 | Vaul constants |
| Sheet scroll-lock after scroll-to-top | 100 ms | Vaul constants |
| Sheet radius / nested offset / top offset | 8 px / 16 px / 26 px | Vaul constants |
| Toast enter / exit / swipe-out | 400 ms / 200 ms opacity / 200 ms ease-out | Sonner styles.css |
| Toast stack scale step | 0.05 per index | Sonner styles.css |
| Shadow transition | 200 ms | Sonner styles.css |
| Reduced-motion fade | 0.2 s | emilkowal.ski/ui/great-animations |
| M3 standard/emphasized easing | `cubic-bezier(0.2, 0, 0, 1)` | material-web tokens |
| M3 exit (standard-accelerate) | `cubic-bezier(0.3, 0, 1, 1)` | material-web tokens |
| M3 enter (emphasized-decelerate) | `cubic-bezier(0.05, 0.7, 0.1, 1)` | material-web tokens |
| M3 durations | short 50-200, medium 250-400, long 450-600, extra-long 700-1000 ms | material-web tokens |
| M3 Expressive spatial spring (unverified) | stiffness 380, damping ratio 0.8 (or 0.73) | third-party ports |
| M3 effects spring (unverified) | stiffness 1600, damping ratio 1 | third-party ports |
| Apple bounce guidance | 0 default; ~0.15 subtle; ~0.3 noticeable; > 0.4 too much | WWDC23 10158 notes |
| Apple example spring | duration 0.5-0.6, bounce 0.2 | WWDC23 10158 notes |
| Motion tween default | 0.3 s | motion.dev |
| Motion spring bounce default | 0.25 | motion.dev |
| Stagger step | 0.05-0.1 s | motion.dev/docs/stagger |
| Flighty badge spring (unverified) | SwiftUI response 0.3 | blakecrosley.com |
| Flighty card / warning radius (unverified) | 12 pt / 8 pt | blakecrosley.com |
