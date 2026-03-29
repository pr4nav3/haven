/**
 * Hazardous Weather Outlook (via IEM AFOS)
 * Human-written outlooks (tonight/tomorrow) from WFOs MKX (Milwaukee/Sullivan), ARX (La Crosse), GRB (Green Bay)
 */

// adapters/hwo.ts
import { supabase } from "../lib/supabase";
import { upsertRagWithEmbedding } from "../lib/rag";
import { createHash } from "crypto";

function getWFOs(): string[] {
  const v = process.env.HWO_WFOS ?? "MKX,ARX,GRB";
  return v.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
}

function sha256hex(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

// --- improved, RAG-friendly summarizer ---
function summarizeHWO(rawText: string, wfo: string, issuedAtISO: string): string {
  const lines = rawText.replace(/\r/g, "").split("\n").map(l => l.trim());
  const text = lines.join(" ");

  const join = (xs: string[]) => xs.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const extractSection = (startRe: RegExp, stopRe?: RegExp) => {
    const start = lines.findIndex(l => startRe.test(l));
    if (start < 0) return "";
    const stop = stopRe ? lines.findIndex((l, i) => i > start && stopRe.test(l)) : -1;
    return join(lines.slice(start + 1, stop > 0 ? stop : undefined));
  };

  // Sections
  const day1 = extractSection(/^\.DAY ONE/i, /^\.DAYS TWO/i);
  const days = extractSection(/^\.DAYS TWO/i, /^\.SPOTTER/i);
  const marineSection = extractSection(/^\.MARINE/i);

  // --- hazard extraction ---
  const hazards = new Set<string>();

  // Watches/Warnings/Advisories
  if (/Flash Flood Watch/i.test(text)) hazards.add("Flash Flood Watch");
  if (/Flood Warning/i.test(text)) hazards.add("Flood Warning");
  if (/Severe Thunderstorm Watch/i.test(text)) hazards.add("Severe Thunderstorm Watch");
  if (/Beach Hazards Statement/i.test(text)) hazards.add("Beach Hazards Statement");
  if (/Small Craft Advisory/i.test(text)) hazards.add("Small Craft Advisory");
  if (/Gale Warning/i.test(text)) hazards.add("Gale Warning");

  // Threat keywords
  if (/damaging winds?/i.test(text)) hazards.add("Damaging winds");
  if (/hail/i.test(text)) hazards.add("Hail");
  if (/tornado/i.test(text)) hazards.add("Tornado potential");
  if (/flash flooding?/i.test(text)) hazards.add("Flash flooding");
  if (/heavy rain/i.test(text)) hazards.add("Heavy rainfall");
  if (/rip currents?/i.test(text)) hazards.add("Rip currents");

  // Compress narrative sections
  const compress = (s: string) =>
    s.replace(/No hazardous weather.+?(expected|time)\.?/gi, "")
     .replace(/The probability.+?low\.?/gi, "")
     .trim();

  const day1Clean = compress(day1);
  const daysClean = compress(days);

  // Marine section
  let marine = "";
  if (marineSection) {
    marine = compress(marineSection);
  } else if (/(Small Craft|Gale|Nearshore|Lake Superior|Beach Hazards|rip currents)/i.test(text)) {
    marine = join(lines.filter(l =>
      /(Small Craft|Gale|Nearshore|Lake Superior|Beach Hazards|rip currents)/i.test(l)
    ));
    marine = compress(marine);
  }

  // --- assemble concise summary ---
  const parts = [
    `Hazardous Weather Outlook — WFO ${wfo} — ${issuedAtISO}`,
    hazards.size ? `Key Hazards: ${Array.from(hazards).join("; ")}` : "",
    day1Clean ? `Today: ${day1Clean}` : "",
    daysClean ? `Tue–Sun: ${daysClean}` : "",
    marine ? `Marine: ${marine}` : ""
  ].filter(Boolean);

  return parts.join("\n");
}

export async function ingestHWO() {
  const wfos = getWFOs();
  let upserted = 0, rag = 0;

  for (const wfo of wfos) {
    const url = `https://mesonet.agron.iastate.edu/cgi-bin/afos/retrieve.py?pil=HWO${wfo}&fmt=text&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "CrisisConcierge/1.0 (ingest@your.app)" } });
    if (!res.ok) { console.error(`[hwo] ${wfo} ${res.status}`); continue; }

    const text = (await res.text())?.trim();
    if (!text) continue;

    const issuedAt = new Date().toISOString(); // could parse header, but 'now' is ok
    const hash = sha256hex(text).slice(0, 12);
    const id = `hwo:${wfo}:${hash}`;
    const text_hash = sha256hex(text);

    // Table write (dedup via PK or unique index)
    const { error } = await supabase.from("hwo_products").upsert(
      [{ id, wfo, issued_at: issuedAt, text, text_hash }],
      { onConflict: "id" }
    );
    if (error) throw error;
    upserted++;

    // RAG: ONE doc per issuance (hash-based) or per WFO (stable).
    // Use per-issuance so history can exist without duplicates.
    const summary = summarizeHWO(text, wfo, issuedAt);
    await upsertRagWithEmbedding({
      doc_id: id,                       // match per-issuance id
      source: "hwo",
      jurisdiction: "WI",
      summary,
      published_at: issuedAt,
      raw: { wfo, text },
    });
    rag++;
  }

  return { upserted, rag };
}
