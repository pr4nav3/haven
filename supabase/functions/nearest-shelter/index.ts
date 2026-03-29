import { supabase } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Given lat/lng query params, return the nearest open shelters.
 * GET /nearest-shelter?lat=43.07&lng=-89.40&limit=5
 */

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get("lat") ?? "");
    const lng = parseFloat(url.searchParams.get("lng") ?? "");
    const limit = parseInt(url.searchParams.get("limit") ?? "5", 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return new Response(
        JSON.stringify({ error: "lat and lng query params required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // PostGIS distance query — returns shelters sorted by distance
    const { data, error } = await supabase.rpc("nearest_shelters", {
      p_lat: lat,
      p_lng: lng,
      p_limit: Math.min(limit, 20),
    });

    if (error) throw error;

    return new Response(JSON.stringify({ shelters: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[nearest-shelter]", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
