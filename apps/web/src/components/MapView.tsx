"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { STYLE_URL, applyDarkOverrides, firstSymbolLayerId } from "@/map/style";
import { addUserLayers } from "@/map/userDot";
import { addShelterLayers } from "@/map/shelterPins";
import { addRouteLayers } from "@/map/route";
import { MADISON } from "@/lib/geo";

type Props = {
  onReady: (map: maplibregl.Map) => void;
  reduceMotion: boolean;
};

export default function MapView({ onReady, reduceMotion }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!el.current || mapRef.current) return;

    // Worker files are copied to /public/maplibre by scripts/copy-maplibre-worker.mjs.
    maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: el.current,
      style: STYLE_URL,
      center: MADISON,
      zoom: 6.2,
      pitch: 0,
      attributionControl: { compact: true },
      fadeDuration: 0,
      maxPitch: 60,
    });
    mapRef.current = map;
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __havenMap?: maplibregl.Map }).__havenMap = map;
    }

    map.on("load", () => {
      applyDarkOverrides(map);
      const labels = firstSymbolLayerId(map);
      addShelterLayers(map, labels);
      addRouteLayers(map, labels);
      addUserLayers(map, reduceMotion);
      onReady(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // onReady/reduceMotion are stable for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inline because maplibre-gl.css sets position on .maplibregl-map and would
  // win over Tailwind's layered utilities.
  return (
    <div
      ref={el}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-label="Map"
      role="application"
    />
  );
}
