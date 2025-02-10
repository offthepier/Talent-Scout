/*
  # Fix Player Table RLS Policies for Upsert Operations

  1. Changes
    - Drop and recreate all player table policies
    - Add proper policies for UPSERT operations
    - Ensure role-based access control for all operations

  2. Security
    - Enable RLS on players table
    - Add comprehensive policies for SELECT, INSERT, UPDATE
    - Allow players to upsert their own records
    - Validate user role for all operations
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_select' AND tablename = 'players') THEN
    DROP POLICY "players_select" ON players;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_insert' AND tablename = 'players') THEN
    DROP POLICY "players_insert" ON players;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_update' AND tablename = 'players') THEN
    DROP POLICY "players_update" ON players;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy (anyone can view)
CREATE POLICY "players_select"
  ON players
  FOR SELECT
  USING (true);

-- Create INSERT policy
CREATE POLICY "players_insert"
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

-- Create UPDATE policy
CREATE POLICY "players_update"
  ON players
  FOR UPDATE
  USING (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'player'
    )
  );

-- Grant necessary permissions
GRANT ALL ON players TO authenticated;

-- Create function to handle player profile upsert
CREATE OR REPLACE FUNCTION handle_player_profile_upsert()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify the user is a player
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'player'
  ) THEN
    RAISE EXCEPTION 'Only players can modify player profiles';
  END IF;

  -- Ensure the user can only modify their own profile
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Users can only modify their own profile';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function
DROP TRIGGER IF EXISTS trigger_handle_player_profile_upsert ON players;
CREATE TRIGGER trigger_handle_player_profile_upsert
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION handle_player_profile_upsert();