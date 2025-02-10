/*
  # AI-Powered Player Matching and Search System

  1. New Tables
    - `player_matches`: Store match history and performance data
    - `player_recommendations`: Cache AI-generated recommendations
    - `player_search_preferences`: Store scout search preferences
    - `player_similarity_scores`: Store pre-computed similarity scores

  2. Functions
    - Player similarity calculation
    - Recommendation generation
    - Advanced search with weighted scoring

  3. Security
    - Enable RLS on all tables
    - Add policies for data access
*/

-- Create extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to players table for AI features
ALTER TABLE players ADD COLUMN IF NOT EXISTS feature_vector vector(1536);
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_vector_update timestamptz;

-- Create player_matches table for performance data
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
  heat_map jsonb,
  performance_metrics jsonb,
  verified boolean DEFAULT false,
  verifier_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_recommendations table
CREATE TABLE IF NOT EXISTS player_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  similarity_score float NOT NULL,
  recommendation_factors jsonb,
  viewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  UNIQUE(scout_id, player_id)
);

-- Create player_search_preferences table
CREATE TABLE IF NOT EXISTS player_search_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  min_age int,
  max_age int,
  positions text[],
  min_height int,
  max_height int,
  preferred_foot text[],
  locations text[],
  stat_weights jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scout_id)
);

-- Create player_similarity_scores table
CREATE TABLE IF NOT EXISTS player_similarity_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id_1 uuid REFERENCES players(id) ON DELETE CASCADE,
  player_id_2 uuid REFERENCES players(id) ON DELETE CASCADE,
  similarity_score float NOT NULL,
  comparison_factors jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id_1, player_id_2)
);

-- Enable RLS
ALTER TABLE player_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_similarity_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view matches"
  ON player_matches FOR SELECT
  USING (true);

CREATE POLICY "Scouts can view recommendations"
  ON player_recommendations FOR SELECT
  USING (auth.uid() = scout_id);

CREATE POLICY "Scouts can manage search preferences"
  ON player_search_preferences
  FOR ALL
  USING (auth.uid() = scout_id);

-- Create function to calculate player similarity
CREATE OR REPLACE FUNCTION calculate_player_similarity(player1_id uuid, player2_id uuid)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  similarity float;
  player1_stats jsonb;
  player2_stats jsonb;
  player1_matches jsonb;
  player2_matches jsonb;
BEGIN
  -- Get player stats
  SELECT 
    p1.stats, p2.stats,
    (
      SELECT jsonb_agg(performance_metrics)
      FROM player_matches
      WHERE player_id = p1.id
      ORDER BY match_date DESC
      LIMIT 5
    ) as p1_matches,
    (
      SELECT jsonb_agg(performance_metrics)
      FROM player_matches
      WHERE player_id = p2.id
      ORDER BY match_date DESC
      LIMIT 5
    ) as p2_matches
  INTO player1_stats, player2_stats, player1_matches, player2_matches
  FROM players p1, players p2
  WHERE p1.id = player1_id AND p2.id = player2_id;

  -- Calculate base similarity from stats
  similarity := (
    LEAST(player1_stats->>'pace', player2_stats->>'pace')::float / 
    GREATEST(player1_stats->>'pace', player2_stats->>'pace')::float +
    LEAST(player1_stats->>'shooting', player2_stats->>'shooting')::float / 
    GREATEST(player1_stats->>'shooting', player2_stats->>'shooting')::float +
    LEAST(player1_stats->>'passing', player2_stats->>'passing')::float / 
    GREATEST(player1_stats->>'passing', player2_stats->>'passing')::float +
    LEAST(player1_stats->>'dribbling', player2_stats->>'dribbling')::float / 
    GREATEST(player1_stats->>'dribbling', player2_stats->>'dribbling')::float +
    LEAST(player1_stats->>'defending', player2_stats->>'defending')::float / 
    GREATEST(player1_stats->>'defending', player2_stats->>'defending')::float +
    LEAST(player1_stats->>'physical', player2_stats->>'physical')::float / 
    GREATEST(player1_stats->>'physical', player2_stats->>'physical')::float
  ) / 6.0;

  -- Adjust similarity based on recent performance
  IF player1_matches IS NOT NULL AND player2_matches IS NOT NULL THEN
    similarity := similarity * 0.8 + 0.2 * (
      -- Add performance-based similarity calculation here
      -- This is a simplified version
      0.9
    );
  END IF;

  RETURN similarity;
END;
$$;

-- Create function to generate recommendations
CREATE OR REPLACE FUNCTION generate_player_recommendations(scout_id uuid)
RETURNS TABLE (
  player_id uuid,
  similarity_score float,
  recommendation_factors jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  preferences player_search_preferences%ROWTYPE;
BEGIN
  -- Get scout's preferences
  SELECT * INTO preferences
  FROM player_search_preferences
  WHERE player_search_preferences.scout_id = generate_player_recommendations.scout_id;

  RETURN QUERY
  WITH filtered_players AS (
    SELECT 
      p.id,
      p.stats,
      EXTRACT(YEAR FROM age(p.birth_date)) as age
    FROM players p
    WHERE 
      (preferences.min_age IS NULL OR EXTRACT(YEAR FROM age(p.birth_date)) >= preferences.min_age) AND
      (preferences.max_age IS NULL OR EXTRACT(YEAR FROM age(p.birth_date)) <= preferences.max_age) AND
      (preferences.positions IS NULL OR p.position = ANY(preferences.positions)) AND
      (preferences.min_height IS NULL OR p.height >= preferences.min_height) AND
      (preferences.max_height IS NULL OR p.height <= preferences.max_height) AND
      (preferences.preferred_foot IS NULL OR p.preferred_foot = ANY(preferences.preferred_foot))
  )
  SELECT 
    fp.id,
    -- Calculate weighted score based on preferences
    (
      CASE WHEN preferences.stat_weights->>'pace' IS NOT NULL 
      THEN (fp.stats->>'pace')::float * (preferences.stat_weights->>'pace')::float
      ELSE 0 END +
      CASE WHEN preferences.stat_weights->>'shooting' IS NOT NULL 
      THEN (fp.stats->>'shooting')::float * (preferences.stat_weights->>'shooting')::float
      ELSE 0 END +
      CASE WHEN preferences.stat_weights->>'passing' IS NOT NULL 
      THEN (fp.stats->>'passing')::float * (preferences.stat_weights->>'passing')::float
      ELSE 0 END +
      CASE WHEN preferences.stat_weights->>'dribbling' IS NOT NULL 
      THEN (fp.stats->>'dribbling')::float * (preferences.stat_weights->>'dribbling')::float
      ELSE 0 END +
      CASE WHEN preferences.stat_weights->>'defending' IS NOT NULL 
      THEN (fp.stats->>'defending')::float * (preferences.stat_weights->>'defending')::float
      ELSE 0 END +
      CASE WHEN preferences.stat_weights->>'physical' IS NOT NULL 
      THEN (fp.stats->>'physical')::float * (preferences.stat_weights->>'physical')::float
      ELSE 0 END
    ) / (
      SELECT sum((value::float))
      FROM jsonb_each_text(preferences.stat_weights)
    ) as similarity_score,
    jsonb_build_object(
      'age', fp.age,
      'stats', fp.stats,
      'matches_analyzed', (
        SELECT count(*)
        FROM player_matches
        WHERE player_id = fp.id
      )
    ) as recommendation_factors
  FROM filtered_players fp
  ORDER BY similarity_score DESC
  LIMIT 50;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS player_matches_player_id_idx ON player_matches(player_id);
CREATE INDEX IF NOT EXISTS player_matches_match_date_idx ON player_matches(match_date);
CREATE INDEX IF NOT EXISTS player_recommendations_scout_id_idx ON player_recommendations(scout_id);
CREATE INDEX IF NOT EXISTS player_recommendations_player_id_idx ON player_recommendations(player_id);
CREATE INDEX IF NOT EXISTS player_similarity_scores_player_ids_idx ON player_similarity_scores(player_id_1, player_id_2);

-- Grant necessary permissions
GRANT ALL ON player_matches TO authenticated;
GRANT ALL ON player_recommendations TO authenticated;
GRANT ALL ON player_search_preferences TO authenticated;
GRANT ALL ON player_similarity_scores TO authenticated;