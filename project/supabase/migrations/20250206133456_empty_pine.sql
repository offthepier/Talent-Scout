/*
  # Fix Player Profile Policies

  1. Changes
    - Drop existing policies and trigger
    - Create new comprehensive policies with proper role checks
    - Add trigger function for additional validation

  2. Security
    - Maintains RLS
    - Ensures proper role validation
    - Preserves data integrity
*/

-- Drop existing policies and trigger
DROP TRIGGER IF EXISTS trigger_handle_player_profile_upsert ON players;
DROP FUNCTION IF EXISTS handle_player_profile_upsert();
DROP POLICY IF EXISTS "players_select" ON players;
DROP POLICY IF EXISTS "players_insert" ON players;
DROP POLICY IF EXISTS "players_update" ON players;

-- Ensure RLS is enabled
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy (anyone can view)
CREATE POLICY "players_select"
  ON players
  FOR SELECT
  USING (true);

-- Create INSERT policy (only players can insert their own record)
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

-- Create UPDATE policy (players can update their own record)
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

-- Create function to handle player profile operations
CREATE OR REPLACE FUNCTION handle_player_profile_upsert()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the user's role
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();

  -- Check if user exists and is a player
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF user_role != 'player' THEN
    RAISE EXCEPTION 'Only players can modify player profiles';
  END IF;

  -- Ensure users can only modify their own profile
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Users can only modify their own profile';
  END IF;

  -- Set updated_at timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_handle_player_profile_upsert
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION handle_player_profile_upsert();

-- Grant necessary permissions
GRANT ALL ON players TO authenticated;