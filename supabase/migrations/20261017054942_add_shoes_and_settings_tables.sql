/*
# Add shoes and app_settings tables (single-tenant, no auth)

1. New Tables
- `shoes` — track running shoes with name, brand, max_km lifespan, and created_at
- `app_settings` — key-value store for single-tenant app settings (weekly goal, user profile, exercise completions, nutrition selections)

2. Columns added to `runs`
- `shoe_id` (uuid, nullable, FK to shoes.id ON DELETE SET NULL) — optional link to which shoes were used
- `workout_type` (text, nullable, CHECK constraint for valid workout types) — type of run

3. Security
- Enable RLS on `shoes` and `app_settings`.
- Allow anon + authenticated full CRUD on both tables (single-tenant, no sign-in).
*/

-- Create shoes table first (runs FK references it)
CREATE TABLE IF NOT EXISTS shoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  max_km integer NOT NULL DEFAULT 600 CHECK (max_km > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shoes" ON shoes;
CREATE POLICY "anon_select_shoes" ON shoes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shoes" ON shoes;
CREATE POLICY "anon_insert_shoes" ON shoes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shoes" ON shoes;
CREATE POLICY "anon_update_shoes" ON shoes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shoes" ON shoes;
CREATE POLICY "anon_delete_shoes" ON shoes FOR DELETE
  TO anon, authenticated USING (true);

-- Add columns to runs table (after shoes exists so FK works)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'runs' AND column_name = 'shoe_id') THEN
    ALTER TABLE runs ADD COLUMN shoe_id uuid REFERENCES shoes(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'runs' AND column_name = 'workout_type') THEN
    ALTER TABLE runs ADD COLUMN workout_type text CHECK (workout_type IS NULL OR workout_type IN ('Easy','Tempo','Interval','Long Run','Fartlek','Hill Repeats'));
  END IF;
END $$;

-- Create app_settings key-value table
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
CREATE POLICY "anon_select_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
CREATE POLICY "anon_insert_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
CREATE POLICY "anon_update_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON app_settings;
CREATE POLICY "anon_delete_settings" ON app_settings FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_shoes_created ON shoes(created_at DESC);
