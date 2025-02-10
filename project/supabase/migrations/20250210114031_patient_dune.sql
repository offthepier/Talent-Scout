/*
  # Add Player Performance Tables

  1. New Tables
    - `player_matches` - Store match performance data
      - Match details (date, opponent, competition)
      - Performance metrics (minutes, goals, assists, etc.)
      - Physical stats (distance, speed)
      - Verified status
    
  2. Security
    - Enable RLS
    - Add policies for data access and modification
    - Grant necessary permissions
*/

-- Create player_matches table
CREATE TABLE IF NOT EXISTS player_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  match_date timestamptz NOT NULL DEFAULT now(),
  opponent text,
  competition text,
  minutes_played int,
  goals int DEFAULT 0,
  assists int DEFAULT 0,
  shots_on_target int DEFAULT 0,
  passes_completed int DEFAULT 0,
  distance_covered float,
  sprint_speed float,
  performance_metrics jsonb DEFAULT '{
    "pass_accuracy": 0,
    "possession": 0,
    "duels_won": 0,
    "interceptions": 0
  }'::jsonb,
  verified boolean DEFAULT false,
  verifier_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE player_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view match data"
  ON player_matches
  FOR SELECT
  USING (true);

CREATE POLICY "Players can add their own match data"
  ON player_matches
  FOR INSERT
  WITH CHECK (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'player'
    )
  );

CREATE POLICY "Verified users can add match data"
  ON player_matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('scout', 'club')
      AND verified = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS player_matches_player_id_idx ON player_matches(player_id);
CREATE INDEX IF NOT EXISTS player_matches_match_date_idx ON player_matches(match_date);

-- Grant permissions
GRANT ALL ON player_matches TO authenticated;

-- Create function to handle timestamps
CREATE OR REPLACE FUNCTION handle_match_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = now();
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for timestamps
CREATE TRIGGER set_match_timestamps
  BEFORE INSERT OR UPDATE ON player_matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_match_timestamps();

-- Create function to get player performance stats
CREATE OR REPLACE FUNCTION get_player_performance_stats(
  player_id uuid,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  match_count bigint,
  total_minutes int,
  total_goals int,
  total_assists int,
  avg_distance float,
  avg_sprint_speed float,
  avg_pass_accuracy float,
  avg_shots_on_target float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as match_count,
    SUM(minutes_played) as total_minutes,
    SUM(goals) as total_goals,
    SUM(assists) as total_assists,
    AVG(distance_covered) as avg_distance,
    AVG(sprint_speed) as avg_sprint_speed,
    AVG((performance_metrics->>'pass_accuracy')::float) as avg_pass_accuracy,
    AVG(shots_on_target::float) as avg_shots_on_target
  FROM player_matches
  WHERE player_matches.player_id = get_player_performance_stats.player_id
  AND (start_date IS NULL OR match_date >= start_date)
  AND (end_date IS NULL OR match_date <= end_date);
END;
$$;