/*
# Create runs table (single-tenant, no auth)

1. New Tables
- `runs`
- `id` (uuid, primary key)
- `date` (date, not null, default current date)
- `distance_km` (numeric, not null) — distance run in kilometers
- `duration_min` (integer, not null) — total running time in minutes
- `pace_sec_per_km` (integer, not null) — pace in seconds per kilometer
- `mood` (text, not null) — how the run felt: 'Easy', 'Hard', or 'Max'
- `notes` (text, nullable) — optional notes about the run
- `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `runs`.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no sign-in.
*/

CREATE TABLE IF NOT EXISTS runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  distance_km numeric NOT NULL CHECK (distance_km > 0),
  duration_min integer NOT NULL CHECK (duration_min > 0),
  pace_sec_per_km integer NOT NULL CHECK (pace_sec_per_km > 0),
  mood text NOT NULL CHECK (mood IN ('Easy', 'Hard', 'Max')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_runs" ON runs;
CREATE POLICY "anon_select_runs" ON runs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_runs" ON runs;
CREATE POLICY "anon_insert_runs" ON runs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_runs" ON runs;
CREATE POLICY "anon_update_runs" ON runs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_runs" ON runs;
CREATE POLICY "anon_delete_runs" ON runs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_runs_date ON runs(date DESC);
