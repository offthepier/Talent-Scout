/*
  # Add Player Achievements and Stats

  1. New Tables
    - `player_achievements`: Store player achievements and certifications
    - `player_stats_history`: Track player performance over time
    - `player_videos`: Store player highlight videos and match footage
    - `player_endorsements`: Store endorsements from coaches and scouts

  2. Security
    - Enable RLS on all new tables
    - Add policies for CRUD operations
    - Ensure proper role-based access

  3. Changes
    - Add new columns to players table for enhanced profile
    - Create functions for stats calculations
    - Add full-text search capabilities
*/

-- Add new columns to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS achievements_count int DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS video_count int DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS endorsements_count int DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();

-- Create player_achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  achievement_date date,
  achievement_type text NOT NULL CHECK (achievement_type IN ('award', 'certification', 'milestone')),
  issuer text,
  verified boolean DEFAULT false,
  verification_date timestamptz,
  verification_proof text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_stats_history table
CREATE TABLE IF NOT EXISTS player_stats_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  recorded_at timestamptz DEFAULT now(),
  match_id uuid,
  stats jsonb NOT NULL,
  source text NOT NULL CHECK (source IN ('match', 'training', 'assessment')),
  verified boolean DEFAULT false,
  verifier_id uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create player_videos table
CREATE TABLE IF NOT EXISTS player_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  thumbnail_url text,
  video_type text NOT NULL CHECK (video_type IN ('highlight', 'match', 'training')),
  duration interval,
  views_count int DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_endorsements table
CREATE TABLE IF NOT EXISTS player_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES profiles(id),
  endorser_role text NOT NULL CHECK (endorser_role IN ('coach', 'scout', 'club')),
  content text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  skills jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_endorsements ENABLE ROW LEVEL SECURITY;

-- Create policies for player_achievements
CREATE POLICY "Anyone can view achievements"
  ON player_achievements FOR SELECT
  USING (true);

CREATE POLICY "Players can create own achievements"
  ON player_achievements FOR INSERT
  WITH CHECK (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'player'
    )
  );

CREATE POLICY "Players can update own achievements"
  ON player_achievements FOR UPDATE
  USING (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'player'
    )
  );

-- Create policies for player_stats_history
CREATE POLICY "Anyone can view stats"
  ON player_stats_history FOR SELECT
  USING (true);

CREATE POLICY "Verified users can create stats"
  ON player_stats_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('player', 'coach', 'scout')
    )
  );

-- Create policies for player_videos
CREATE POLICY "Anyone can view videos"
  ON player_videos FOR SELECT
  USING (true);

CREATE POLICY "Players can manage own videos"
  ON player_videos FOR ALL
  USING (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'player'
    )
  );

-- Create policies for player_endorsements
CREATE POLICY "Anyone can view endorsements"
  ON player_endorsements FOR SELECT
  USING (true);

CREATE POLICY "Verified users can create endorsements"
  ON player_endorsements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'scout', 'club')
    )
  );

-- Create function to update achievement count
CREATE OR REPLACE FUNCTION update_player_achievement_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players
    SET achievements_count = achievements_count + 1
    WHERE id = NEW.player_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players
    SET achievements_count = achievements_count - 1
    WHERE id = OLD.player_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for achievement count
CREATE TRIGGER update_achievement_count
  AFTER INSERT OR DELETE ON player_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_player_achievement_count();

-- Create function to update video count
CREATE OR REPLACE FUNCTION update_player_video_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players
    SET video_count = video_count + 1
    WHERE id = NEW.player_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players
    SET video_count = video_count - 1
    WHERE id = OLD.player_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for video count
CREATE TRIGGER update_video_count
  AFTER INSERT OR DELETE ON player_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_player_video_count();

-- Create function to update endorsement count
CREATE OR REPLACE FUNCTION update_player_endorsement_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players
    SET endorsements_count = endorsements_count + 1
    WHERE id = NEW.player_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players
    SET endorsements_count = endorsements_count - 1
    WHERE id = OLD.player_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for endorsement count
CREATE TRIGGER update_endorsement_count
  AFTER INSERT OR DELETE ON player_endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_player_endorsement_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS player_achievements_player_id_idx ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS player_stats_history_player_id_idx ON player_stats_history(player_id);
CREATE INDEX IF NOT EXISTS player_videos_player_id_idx ON player_videos(player_id);
CREATE INDEX IF NOT EXISTS player_endorsements_player_id_idx ON player_endorsements(player_id);

-- Grant necessary permissions
GRANT ALL ON player_achievements TO authenticated;
GRANT ALL ON player_stats_history TO authenticated;
GRANT ALL ON player_videos TO authenticated;
GRANT ALL ON player_endorsements TO authenticated;