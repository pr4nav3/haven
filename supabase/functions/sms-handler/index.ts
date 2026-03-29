import { supabase } from "../_shared/supabase.ts";

/**
 * Twilio webhook handler for SMS "HELP" texts.
 * Receives POST from Twilio, returns TwiML XML response.
 */

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const body = (formData.get("Body") as string ?? "").trim().toUpperCase();
    const fromZip = formData.get("FromZip") as string ?? "";

    // Parse ZIP from message body ("HELP 53703") or fall back to carrier ZIP
    const zipMatch = body.match(/HELP\s+(\d{5})/);
    const zip = zipMatch?.[1] ?? fromZip;

    if (!body.startsWith("HELP")) {
      return twiml(
        "Text HELP or HELP <ZIP> to find the nearest safe place during severe weather.",
      );
    }

    if (!zip) {
      return twiml(
        "Please text HELP followed by your ZIP code (e.g., HELP 53703) so we can find shelters near you.",
      );
    }

    const geo = await geocodeZip(zip);
    if (!geo) {
      return twiml(`Could not locate ZIP ${zip}. Please try again with a valid Wisconsin ZIP code.`);
    }

    // Find nearest shelters
    const { data: shelters } = await supabase.rpc("nearest_shelters", {
      p_lat: geo.lat,
      p_lng: geo.lng,
      p_limit: 3,
    });

    // Check for active alerts in the area
    const { data: alerts } = await supabase
      .from("alerts")
      .select("event, severity, area_desc")
      .gte("expires", new Date().toISOString())
      .limit(2);

    // Format SMS response
    let msg = "";

    if (alerts?.length) {
      const alertLine = alerts
        .map((a) => `${a.event}${a.severity ? ` (${a.severity})` : ""}`)
        .join(", ");
      msg += `Active alerts: ${alertLine}\n\n`;
    }

    if (shelters?.length) {
      msg += "Nearest shelters:\n";
      shelters.forEach((s: { name: string; distance_mi: number; address: string; lat: number; lng: number }, i: number) => {
        msg += `${i + 1}. ${s.name} (${s.distance_mi.toFixed(1)} mi)\n`;
        msg += `   ${s.address ?? ""}\n`;
        msg += `   maps.google.com/?q=${s.lat},${s.lng}\n`;
      });
    } else {
      msg += "No open shelters found near your location. Check local news for emergency information.";
    }

    msg += "\nText HELP <ZIP> anytime for updated info.";

    return twiml(msg);
  } catch (e) {
    console.error("[sms-handler]", e);
    return twiml("An error occurred. Please try again or call 911 for emergencies.");
  }
});

function twiml(message: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>${escapeXml(message)}</Message></Response>`;
  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  const token = Deno.env.get("MAPBOX_ACCESS_TOKEN");
  if (!token) {
    console.error("[sms-handler] MAPBOX_ACCESS_TOKEN not set — cannot geocode ZIP");
    return null;
  }

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json?country=US&types=postcode&access_token=${token}`,
  );
  if (!res.ok) return null;

  const data = await res.json();
  const center = data.features?.[0]?.center;
  if (!center) return null;

  return { lng: center[0], lat: center[1] };
}
