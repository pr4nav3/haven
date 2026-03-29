import { supabase } from './supabase';

/**
 * Calls a postgres function set_alert_geom_geojson and passes it p_id and p_geojson. 
 * RPC = remote procedure call, a way to invoke a function on a remote server. 
 * the actual function is set in the db, which is where we call it from via supabase.rpc() helper.
 * @param id 
 * @param geojson 
 */
export async function setAlertGeomGeoJSON(id: string, geojson: unknown) {
  const { error } = await supabase.rpc('set_alert_geom_geojson', { p_id: id, p_geojson: geojson as any });
  if (error) throw error;
}

export async function setPointRPC(table: 'gauges_usgs' | 'gauges_nwps' | 'shelters_open', idKey: string, idVal: string, lon?: number, lat?: number) {
  // You can create per-table RPCs; this is a placeholder if you prefer separate helpers.
  // e.g., set_usgs_point(p_id, p_lon, p_lat), set_shelter_point(...), etc.
  // Call the right RPC from the adapter (clearer).
}
