// src/bin/ingestAll.ts
import { ingestNWS } from "../adapters/nws";
// import { ingest511 } from "../adapters/511";
import { ingestShelters } from "../adapters/shelters";
import { ingestLSR } from "../adapters/iem-lsr";
import { ingestHWO } from "../adapters/hwo";
// import { ingestNWPS } from "../adapters/nwps";
// import { ingestUSGS } from "../adapters/usgs";
import { pruneRag } from "../lib/rag";


type Step = readonly [name: string, fn: () => Promise<unknown>];

export type IngestStepResult = {
  name: string;
  ok: boolean;
  durationMs: number;
  error?: string;
};

export type IngestAllResult = {
  okCount: number;
  total: number;
  results: IngestStepResult[];
};

async function runStep([name, fn]: Step): Promise<IngestStepResult> {
  const started = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - started;
    console.log(`[ingest] ${name} OK in ${durationMs}ms`);
    return { name, ok: true, durationMs };
  } catch (e: any) {
    const durationMs = Date.now() - started;
    const msg = e?.message ?? String(e);
    console.error(`[ingest] ${name} FAILED in ${durationMs}ms → ${msg}`);
    return { name, ok: false, durationMs, error: msg };
  }
}

export async function runIngest(): Promise<IngestAllResult> {
  // Run sources sequentially so a failure in one doesn’t stop the rest
  const steps: Step[] = [
    ["nws", ingestNWS],
    //["511", ingest511],
    ["shelters", ingestShelters],
    ["lsr", ingestLSR],
    ["hwo", ingestHWO],
    // ["nwps", ingestNWPS],
    // ["usgs", ingestUSGS],
  ] as const;

  const results: IngestStepResult[] = [];
  for (const step of steps) {
    results.push(await runStep(step));
  }

  // Prune after sources
  const pruneStart = Date.now();
  try {
    const keepDays = Number(process.env.PRUNE_KEEP_DAYS ?? 90);
    const keepMax  = Number(process.env.PRUNE_KEEP_MAX  ?? 40000);
    await pruneRag(keepDays, keepMax); // your rag.ts signature is (days, keepLatest)
    const durationMs = Date.now() - pruneStart;
    console.log(`[prune] OK in ${durationMs}ms (keepDays=${keepDays}, keepMax=${keepMax})`);
    results.push({ name: "prune", ok: true, durationMs });
  } catch (e: any) {
    const durationMs = Date.now() - pruneStart;
    const msg = e?.message ?? String(e);
    console.error(`[prune] FAILED in ${durationMs}ms → ${msg}`);
    results.push({ name: "prune", ok: false, durationMs, error: msg });
  }

  const okCount = results.filter(r => r.ok).length;
  return { okCount, total: results.length, results };
}

// Allow local manual run: `node dist/bin/ingestAll.js`
if (typeof require !== "undefined" && require.main === module) {
  runIngest()
    .then(res => {
      console.log("Done:", JSON.stringify(res, null, 2));
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
