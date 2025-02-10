/*
  # Fix Player Table Policies

  1. Changes
    - Add missing RLS policies for player table operations
    - Ensure proper access control for authenticated users
    - Fix update/upsert operations

  2. Security
    - Enable RLS on players table
    - Add policies for SELECT, INSERT, UPDATE operations
    - Restrict access to own records for modifications
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_select_own' AND tablename = 'players') THEN
    DROP POLICY "players_select_own" ON players;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_insert_own' AND tablename = 'players') THEN
    DROP POLICY "players_insert_own" ON players;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_update_own' AND tablename = 'players') THEN
    DROP POLICY "players_update_own" ON players;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for the players table
CREATE POLICY "players_select_own"
  ON players
  FOR SELECT
  USING (true);  -- Anyone can view player profiles

CREATE POLICY "players_insert_own"
  ON players
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'player'
    )
  );

CREATE POLICY "players_update_own"
  ON players
  FOR UPDATE
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON players TO authenticated;