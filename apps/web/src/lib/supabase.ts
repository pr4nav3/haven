import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Null when the backend is not configured; callers fall back to local data. */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
