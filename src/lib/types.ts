// Note: manually set types: if your table alerts_nws changes (new column, column type change, etc.), 
// I have to remember to update this file. Otherwise code compiles but blows up at runtime.
// Supabase has a codegen tool that creates a Database type directly from your live database schema,
// which would solve this problem by always staying updated with db. do this eventually.


/**
   * Row shape for the `alerts_nws` table. (Used for type help when upserting to Supabase.)
   * (no geom here, set via rpc in geo.ts)
   */
export interface AlertNwsInsert {
    id: string;                 // stable unique alert ID from NWS
    event: string | null;       // e.g., "Severe Thunderstorm Warning"
    headline: string | null;
    description: string | null;
    severity: string | null;    
    status: string | null;      // e.g., "Actual"
    effective: string | null;   // ISO8601
    expires: string | null;     // ISO8601
    source: 'nws';
    url: string | null;         // canonical URL to the alert (if available)
    jurisdiction: string | null;// here fixed to 'WI'
    last_seen_at: string;       // when we last observed this alert in the feed
  };

// RAG insert
export interface RagDocInsert {
  doc_id?: string;
  source: string;
  url?: string | null;
  published_at?: string | null;
  last_seen_at?: string | null;
  jurisdiction?: string | null;
  hazard_type?: string | null;
  lat?: number | null;
  lon?: number | null;
  summary: string;
  raw: any;
  // embedding is set in SQL INSERT if you precompute, or UPDATE after embed
}
