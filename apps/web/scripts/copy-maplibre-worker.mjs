// MapLibre 6 loads its worker as a module script that imports a sibling file.
// Bundlers do not serve those from node_modules, so copy them into /public
// and point MapLibre at them with setWorkerUrl (see src/components/MapView.tsx).
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "node_modules", "maplibre-gl", "dist");
const dest = join(here, "..", "public", "maplibre");

mkdirSync(dest, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(src, f), join(dest, f));
}
console.log("copied maplibre worker to public/maplibre");
