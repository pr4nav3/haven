"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as maplibregl from "maplibre-gl";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import MapView from "./MapView";
import Sheet, { type Detent } from "./Sheet";
import PrimaryButton, { ArrowIcon } from "./PrimaryButton";
import ShelterCard from "./ShelterCard";
import SeverityBanner from "./SeverityBanner";
import LocateButton from "./LocateButton";
import NavigationHud from "./NavigationHud";
import ArrivalCard from "./ArrivalCard";
import Wordmark from "./Wordmark";
import { bearingDeg, haversineMi, MADISON, type LngLat } from "@/lib/geo";
import { nearestShelters, type Shelter } from "@/lib/shelters";
import { fetchRoute, type Route } from "@/lib/routing";
import { alertAt, onAlertsChange, type Alert } from "@/lib/alerts";
import { nwsStateHazards } from "@/lib/nws";
import { prepareRoute, pointAt, snapToRoute, WALK_MPS, type RouteGeom } from "@/lib/navigation";
import { setUserPosition } from "@/map/userDot";
import { pulseTarget, setTargetShelter } from "@/map/shelterPins";
import { clearRoute, showRoute, setRouteProgress } from "@/map/route";
import { setHazards } from "@/map/hazards";
import { intro, startDrift, stopDrift, overview, enterFollow, followFrame, IDLE_PITCH, IDLE_BEARING } from "@/map/camera";

type Phase = "idle" | "locating" | "pick" | "routing" | "guiding" | "navigating" | "arrived";

const PEEK_PX = 152;
const NAV_PEEK_PX = 120;
const BANNER_PX = 88;
const ARRIVE_M = 8;

export default function HavenApp() {
  const reduce = useReducedMotion() ?? false;
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [curtain, setCurtain] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const [detent, setDetent] = useState<Detent>("peek");
  const [position, setPosition] = useState<LngLat | null>(null);
  const posSource = useRef<"gps" | "pin">("pin");
  const [approx, setApprox] = useState(false);
  const [candidates, setCandidates] = useState<Shelter[]>([]);
  const [index, setIndex] = useState(0);
  const [route, setRoute] = useState<Route | null>(null);
  const [offline, setOffline] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [wide, setWide] = useState(false);

  // navigation state
  const geomRef = useRef<RouteGeom | null>(null);
  const navStop = useRef<(() => void) | null>(null);
  const [remainingM, setRemainingM] = useState(0);

  const shelter = candidates[index] ?? null;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ---- map ready: intro, hazards, idle drift ------------------------------
  const onMapReady = useCallback((map: maplibregl.Map) => {
    mapRef.current = map;
    setReady(true);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    intro(map, MADISON, reduce);
    const t = setTimeout(() => setCurtain(false), 150);
    map.once("moveend", () => { if (phaseRef.current === "idle" && !reduce) startDrift(map); });

    // Any user gesture pauses the drift; it resumes after a quiet spell.
    let resume: ReturnType<typeof setTimeout> | null = null;
    const pause = () => {
      stopDrift();
      if (resume) clearTimeout(resume);
      resume = setTimeout(() => { if (phaseRef.current === "idle" && !reduce) startDrift(map); }, 9000);
    };
    map.on("mousedown", pause);
    map.on("touchstart", pause);
    map.on("wheel", pause);

    let cancelled = false;
    const loadHazards = () =>
      nwsStateHazards().then((fc) => { if (!cancelled) setHazards(map, fc); }).catch(() => {});
    loadHazards();
    const hz = setInterval(loadHazards, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearInterval(hz);
      if (resume) clearTimeout(resume);
      stopDrift();
      map.off("mousedown", pause);
      map.off("touchstart", pause);
      map.off("wheel", pause);
    };
  }, [ready, reduce]);

  useEffect(() => {
    if (phase !== "idle") stopDrift();
  }, [phase]);

  // ---- alerts at the user's position ---------------------------------------
  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    const refresh = () => alertAt(position).then((a) => { if (!cancelled) setAlert(a); });
    refresh();
    const off = onAlertsChange(refresh);
    return () => { cancelled = true; off(); };
  }, [position]);

  // ---- location -------------------------------------------------------------
  const locate = useCallback((): Promise<{ at: LngLat; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) { reject(new Error("unsupported")); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ at: [p.coords.longitude, p.coords.latitude], accuracy: p.coords.accuracy }),
        (e) => reject(e),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 },
      );
    });
  }, []);

  const placeUser = useCallback((at: LngLat, accuracy: number | null, source: "gps" | "pin") => {
    const map = mapRef.current;
    posSource.current = source;
    setPosition(at);
    setApprox(accuracy !== null && accuracy > 100);
    if (map) setUserPosition(map, at, accuracy);
  }, []);

  // ---- guide: route + reveal ------------------------------------------------
  const guideTo = useCallback(
    async (at: LngLat, list: Shelter[], i: number) => {
      const map = mapRef.current;
      const target = list[i];
      if (!map || !target) return;

      setIndex(i);
      setTargetShelter(map, target);
      setPhase("routing");

      const dest: LngLat = [target.lng, target.lat];
      let r: Route | null = null;
      try {
        r = await fetchRoute(at, dest, haversineMi(at, dest));
        // Routers snap both ends to the road graph; stitch the real endpoints on.
        r = { ...r, coordinates: [at, ...r.coordinates, dest] };
        setOffline(false);
      } catch {
        r = null;
        setOffline(true);
      }
      setRoute(r);
      geomRef.current = r ? prepareRoute(r.coordinates) : null;

      const vh = window.innerHeight;
      const coords = r ? r.coordinates : [at, dest];
      const padding = wide
        ? { top: BANNER_PX + 32, bottom: 56, left: 420 + 16 + 56, right: 56 }
        : { top: BANNER_PX + 32, bottom: vh * 0.5 + 56, left: 40, right: 40 };

      setPhase("guiding");
      setDetent("half");

      const cam = overview(map, coords, padding, reduce);
      if (r) {
        await showRoute(map, r.coordinates, { durationMs: 1100, delayMs: 350, reduceMotion: reduce });
      } else {
        clearRoute(map);
      }
      await cam;
      pulseTarget(map, reduce ? 0 : 3);
    },
    [reduce, wide],
  );

  const onPrimary = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    if (phase === "pick") {
      setHint("Tap the map where you are");
      return;
    }

    setPhase("locating");
    setHint(null);
    let at: LngLat;
    let accuracy: number | null = null;
    try {
      const fix = await locate();
      at = fix.at;
      accuracy = fix.accuracy;
    } catch {
      setPhase("pick");
      setHint("Location off. Tap the map where you are.");
      return;
    }

    placeUser(at, accuracy, "gps");
    const list = await nearestShelters(at, 5, 10);
    if (!list.length) {
      setPhase("idle");
      setHint("No shelters within 10 miles.");
      return;
    }
    setCandidates(list);
    await guideTo(at, list, 0);
  }, [phase, locate, placeUser, guideTo]);

  // Pin-drop mode: a map click sets the position and proceeds.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || phase !== "pick") return;
    const handler = async (e: maplibregl.MapMouseEvent) => {
      const at: LngLat = [e.lngLat.lng, e.lngLat.lat];
      placeUser(at, null, "pin");
      setHint(null);
      const list = await nearestShelters(at, 5, 10);
      if (!list.length) { setPhase("idle"); setHint("No shelters within 10 miles of that spot."); return; }
      setCandidates(list);
      await guideTo(at, list, 0);
    };
    map.once("click", handler);
    return () => { map.off("click", handler); };
  }, [phase, placeUser, guideTo]);

  const onChangeShelter = useCallback(() => {
    if (!position || candidates.length < 2) return;
    guideTo(position, candidates, (index + 1) % candidates.length);
  }, [position, candidates, index, guideTo]);

  // ---- navigation: follow the user (or a simulated walk) along the route ----
  const stopNavigation = useCallback(() => {
    navStop.current?.();
    navStop.current = null;
    const map = mapRef.current;
    if (map) map.jumpTo({ padding: { top: 0, bottom: 0, left: 0, right: 0 } });
  }, []);

  const startNavigation = useCallback(async () => {
    const map = mapRef.current;
    const geom = geomRef.current;
    if (!map || !geom || !shelter) return;

    setPhase("navigating");
    setDetent("peek");
    setRemainingM(geom.total);

    const start = pointAt(geom, 0);
    const vh = window.innerHeight;
    // Keep the dot in the lower third so the road ahead fills the screen.
    map.jumpTo({ padding: { top: Math.round(vh * 0.38), bottom: 0, left: wide ? 440 : 0, right: 0 } });
    await enterFollow(map, start.point, start.bearing, reduce);

    let targetD = 0;      // where we believe the user is, meters along route
    let displayD = 0;     // smoothed value that drives the dot and camera
    let lastTick = performance.now();
    let lastReactPush = 0;
    let raf = 0;
    let watchId: number | null = null;
    let done = false;

    const useGps = posSource.current === "gps" && "geolocation" in navigator;
    const simulated = !useGps;
    const simMs = Math.min(30000, Math.max(9000, geom.total / 35 * 1000)); // ~35 m/s, 9–30 s
    const simStart = performance.now();

    if (useGps) {
      watchId = navigator.geolocation.watchPosition(
        (p) => {
          const snap = snapToRoute(geom, [p.coords.longitude, p.coords.latitude]);
          if (snap.offM > 80) return; // off the route, ignore until they come back
          targetD = Math.max(targetD, snap.d);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
      );
    }

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      const end = pointAt(geom, geom.total);
      setUserPosition(map, end.point, null, { heading: end.bearing });
      setRemainingM(0);
      setPhase("arrived");
      setDetent("half");
      pulseTarget(map, reduce ? 0 : 4);
      map.easeTo({
        center: end.point,
        zoom: 17.6,
        pitch: 55,
        bearing: map.getBearing() + 25,
        padding: { top: 0, bottom: wide ? 0 : Math.round(vh * 0.5), left: wide ? 440 : 0, right: 0 },
        duration: reduce ? 0 : 1600,
      });
    };

    const tick = (now: number) => {
      const dt = now - lastTick;
      lastTick = now;
      if (simulated) {
        const t = Math.min(1, (now - simStart) / simMs);
        const eased = t < 0.08 ? (t / 0.08) * (t / 0.08) * 0.08 : t; // soft start
        targetD = geom.total * eased;
      }
      // Smooth toward the target; dt-scaled so it feels the same at any frame rate.
      const k = 1 - Math.pow(0.001, dt / 1000);
      displayD += (targetD - displayD) * k;
      if (reduce) displayD = targetD;

      const p = pointAt(geom, displayD);
      setUserPosition(map, p.point, null, { heading: p.bearing });
      followFrame(map, p.point, p.bearing);
      setRouteProgress(map, geom.total > 0 ? displayD / geom.total : 0);

      if (now - lastReactPush > 150) {
        lastReactPush = now;
        setRemainingM(Math.max(0, geom.total - displayD));
      }

      if (geom.total - targetD <= ARRIVE_M && geom.total - displayD <= ARRIVE_M + 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    navStop.current = () => {
      done = true;
      cancelAnimationFrame(raf);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [shelter, reduce, wide]);

  const endNavigation = useCallback(async () => {
    const map = mapRef.current;
    stopNavigation();
    if (!map || !position || !route) { setPhase("guiding"); return; }
    setPhase("guiding");
    setDetent("half");
    setUserPosition(map, position, null);
    const vh = window.innerHeight;
    await overview(
      map,
      route.coordinates,
      wide
        ? { top: BANNER_PX + 32, bottom: 56, left: 420 + 16 + 56, right: 56 }
        : { top: BANNER_PX + 32, bottom: vh * 0.5 + 56, left: 40, right: 40 },
      reduce,
    );
  }, [stopNavigation, position, route, wide, reduce]);

  const onDone = useCallback(() => {
    const map = mapRef.current;
    stopNavigation();
    setPhase("idle");
    setDetent("peek");
    setRoute(null);
    setCandidates([]);
    geomRef.current = null;
    if (map) {
      clearRoute(map);
      setTargetShelter(map, null);
      map.easeTo({ zoom: 14.7, pitch: IDLE_PITCH, bearing: IDLE_BEARING, duration: reduce ? 0 : 1400 });
      if (!reduce) map.once("moveend", () => { if (phaseRef.current === "idle") startDrift(map); });
    }
  }, [stopNavigation, reduce]);

  // Cleanup any loop if the component unmounts mid-navigation.
  useEffect(() => () => { navStop.current?.(); }, []);

  const onLocate = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const fix = await locate();
      placeUser(fix.at, fix.accuracy, "gps");
      map.easeTo({ center: fix.at, zoom: Math.max(map.getZoom(), 15), duration: reduce ? 0 : 400 });
    } catch {
      setHint("Location is off.");
    }
  }, [locate, placeUser, reduce]);

  // ---- derived UI -------------------------------------------------------------
  const busy = phase === "locating" || phase === "routing";
  const label =
    phase === "pick" ? "Choose where you are"
    : phase === "guiding" ? "Find another shelter"
    : "Take me to shelter";

  const peek = phase === "navigating" ? NAV_PEEK_PX : PEEK_PX;
  const sheetBottom =
    wide ? "24px" : detent === "peek" ? `${peek + 16}px` : "calc(50vh + 16px)";

  const etaS = route
    ? (route.profile === "foot" ? remainingM / WALK_MPS : (remainingM / Math.max(1, route.distanceM)) * route.durationS)
    : remainingM / WALK_MPS;

  const topOwner = alert ? "banner" : phase === "navigating" ? "hud" : "wordmark";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-full w-full overflow-hidden bg-surface">
        <MapView onReady={onMapReady} reduceMotion={reduce} />
        <div className="vignette" aria-hidden />
        <AnimatePresence>
          {curtain && (
            <motion.div
              className="fade-in-black z-40"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.2, 0, 0, 1] } }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {topOwner === "wordmark" && (
          <Wordmark
            status={position ? "No active alerts here" : null}
            tone="safe"
          />
        )}
        <SeverityBanner alert={alert} />

        <AnimatePresence>
          {phase === "navigating" && shelter && route && (
            <div
              key="hud"
              className={`pointer-events-none absolute z-30 px-4 ${alert ? "top-[calc(env(safe-area-inset-top)+100px)]" : "top-[calc(env(safe-area-inset-top)+12px)]"} ${wide ? "left-[452px] right-4 max-w-[420px]" : "inset-x-0"}`}
            >
              <NavigationHud
                shelterName={shelter.name}
                remainingM={remainingM}
                totalM={route.distanceM}
                etaS={etaS}
                mode={route.profile === "foot" ? "walk" : "drive"}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hint && (
            <motion.div
              key={hint}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+64px)] z-20 flex justify-center px-4"
            >
              <p className="pill rounded-full px-4 py-2 text-[15px] text-text-2">{hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {approx && position && phase === "guiding" && (
          <p className="pointer-events-none absolute left-4 z-20 text-[13px] text-text-3" style={{ bottom: `calc(${sheetBottom} + 4px)` }}>
            Approximate location
          </p>
        )}

        {phase !== "navigating" && <LocateButton onClick={onLocate} bottom={sheetBottom} />}

        <Sheet
          detent={detent}
          onDetentChange={setDetent}
          peekHeight={peek}
          glass={phase !== "navigating"}
        >
          {phase === "navigating" && shelter ? (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-route">Guiding you</p>
                <p className="truncate text-[18px] font-semibold tracking-[-0.01em]">{shelter.name}</p>
              </div>
              <button
                type="button"
                onClick={endNavigation}
                className="pressable btn-ghost h-11 shrink-0 rounded-full px-5 text-[15px] font-medium"
              >
                End
              </button>
            </div>
          ) : phase === "arrived" && shelter ? (
            <ArrivalCard shelter={shelter} onDone={onDone} />
          ) : phase === "guiding" && shelter ? (
            <div className="flex flex-col gap-5">
              <ShelterCard
                shelter={shelter}
                route={route}
                bearing={position ? bearingDeg(position, [shelter.lng, shelter.lat]) : 0}
                offline={offline}
                onStart={startNavigation}
                onChange={onChangeShelter}
              />
              <PrimaryButton label={label} busy={busy} onClick={onPrimary} variant="ghost" size="md" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <PrimaryButton label={label} busy={busy} onClick={onPrimary} icon={<ArrowIcon />} />
              {phase === "idle" && (
                <p className="text-center text-[13px] text-text-3">
                  Uses your location once to find the closest safe place.
                </p>
              )}
            </div>
          )}
        </Sheet>
      </div>
    </MotionConfig>
  );
}
