-- Row-level security: the browser reads these tables directly with the anon key.
-- Anon/authenticated may SELECT only. Writes come from Edge Functions using the
-- service role key, which bypasses RLS.

ALTER TABLE alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE storm_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hwo_products  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read alerts"
  ON alerts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read shelters"
  ON shelters FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read storm_reports"
  ON storm_reports FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public read hwo_products"
  ON hwo_products FOR SELECT TO anon, authenticated USING (true);

-- Realtime: let the frontend subscribe to alert changes.
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
