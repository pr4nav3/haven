"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as maplibregl from "maplibre-gl";
import { MotionConfig, useReducedMotion } from "motion/react";
import MapView from "./MapView";
import Sheet, { type Detent } from "./Sheet";
import PrimaryButton from "./PrimaryButton";
import ShelterCard from "./ShelterCard";
import SeverityBanner from "./SeverityBanner";
import LocateButton from "./LocateButton";
import { bboxOf, bearingDeg, haversineMi, MADISON, type LngLat } from "@/lib/geo";
import { nearestShelters, type Shelter } from "@/lib/shelters";
import { fetchRoute, type Route } from "@/lib/routing";
import { alertAt, onAlertsChange, type Alert } from "@/lib/alerts";
import { setUserPosition } from "@/map/userDot";
import { pulseTarget, setTargetShelter } from "@/map/shelterPins";
import { clearRoute, showRoute } from "@/map/route";

type Phase = "idle" | "locating" | "routing" | "guiding" | "pick";

const PEEK_PX = 152; // grabber + 64px button + helper line + safe-area padding
const BANNER_PX = 88;

export default function HavenApp() {
  const reduce = useReducedMotion() ?? false;
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [detent, setDetent] = useState<Detent>("peek");
  const [position, setPosition] = useState<LngLat | null>(null);
  const [approx, setApprox] = useState(false);
  const [candidates, setCandidates] = useState<Shelter[]>([]);
  const [index, setIndex] = useState(0);
  const [route, setRoute] = useState<Route | null>(null);
  const [offline, setOffline] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [wide, setWide] = useState(false);

  const shelter = candidates[index] ?? null;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ---- map ready ---------------------------------------------------------
  const onMapReady = useCallback((map: maplibregl.Map) => {
    mapRef.current = map;
    setReady(true);
  }, []);

  // ---- alerts ------------------------------------------------------------
  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    const refresh = () => alertAt(position).then((a) => { if (!cancelled) setAlert(a); });
    refresh();
    const off = onAlertsChange(refresh);
    return () => { cancelled = true; off(); };
  }, [position]);

  // ---- location ----------------------------------------------------------
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

  const placeUser = useCallback((at: LngLat, accuracy: number | null) => {
    const map = mapRef.current;
    setPosition(at);
    setApprox(accuracy !== null && accuracy > 100);
    if (map) setUserPosition(map, at, accuracy);
  }, []);

  // ---- the one button ----------------------------------------------------
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
        setOffline(false);
      } catch {
        r = null;
        setOffline(true);
      }
      setRoute(r);

      const vh = window.innerHeight;
      const wide = window.innerWidth >= 640; // sheet docks left as a 420px panel
      const coords = r ? r.coordinates : [at, dest];
      map.fitBounds(bboxOf(coords), {
        padding: wide
          ? { top: BANNER_PX + 32, bottom: 56, left: 420 + 16 + 56, right: 56 }
          : { top: BANNER_PX + 32, bottom: vh * 0.5 + 56, left: 40, right: 40 },
        duration: reduce ? 0 : 900,
        maxZoom: 16,
      });

      setPhase("guiding");
      setDetent("half");

      if (r) {
        await showRoute(map, r.coordinates, { durationMs: 900, delayMs: 200, reduceMotion: reduce });
      } else {
        clearRoute(map);
      }
      pulseTarget(map, reduce ? 0 : 3);
    },
    [reduce],
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
      // Denied or unavailable: let the user drop a pin instead.
      setPhase("pick");
      setHint("Location off. Tap the map where you are.");
      return;
    }

    placeUser(at, accuracy);
    const list = await nearestShelters(at, 5, 10);
    if (!list.length) {
      setPhase("idle");
      setHint("No shelters within 10 miles. Try Navigate to search further.");
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
      placeUser(at, null);
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

  const onLocate = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const fix = await locate();
      placeUser(fix.at, fix.accuracy);
      map.easeTo({ center: fix.at, zoom: Math.max(map.getZoom(), 14), duration: reduce ? 0 : 300 });
    } catch {
      setHint("Location is off.");
    }
  }, [locate, placeUser, reduce]);

  // Intro: ease from the state view toward Madison once the map is up.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.flyTo({ center: MADISON, zoom: 11.5, duration: reduce ? 0 : 2400, essential: false });
  }, [ready, reduce]);

  const busy = phase === "locating" || phase === "routing";
  const label =
    phase === "pick" ? "Choose where you are"
    : phase === "guiding" ? "Find another shelter"
    : "Take me to shelter";

  // Locate button rides above the sheet on phones; on wide screens the sheet
  // is a left panel so the button keeps a fixed bottom offset.
  const sheetBottom =
    wide ? "24px" : detent === "peek" ? `${PEEK_PX + 16}px` : "calc(50vh + 16px)";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-full w-full overflow-hidden bg-surface">
        <MapView onReady={onMapReady} reduceMotion={reduce} />

        <SeverityBanner alert={alert} />

        {hint && (
          <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+16px)] z-20 flex justify-center px-4">
            <p className="surface rounded-full px-4 py-2 text-[16px] text-text-2">{hint}</p>
          </div>
        )}

        {approx && position && phase === "guiding" && (
          <p className="pointer-events-none absolute left-4 z-20 text-[14px] text-text-2" style={{ bottom: `calc(${sheetBottom} + 4px)` }}>
            Approximate location
          </p>
        )}

        <LocateButton onClick={onLocate} bottom={sheetBottom} />

        <Sheet detent={detent} onDetentChange={setDetent} peekHeight={PEEK_PX} glass={phase === "idle"}>
          {phase === "guiding" && shelter ? (
            <div className="flex flex-col gap-5">
              <ShelterCard
                shelter={shelter}
                route={route}
                bearing={position ? bearingDeg(position, [shelter.lng, shelter.lat]) : 0}
                offline={offline}
                onChange={onChangeShelter}
              />
              <PrimaryButton label={label} busy={busy} onClick={onPrimary} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <PrimaryButton label={label} busy={busy} onClick={onPrimary} />
              {phase === "idle" && (
                <p className="text-center text-[14px] text-text-2">
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
