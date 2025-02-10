/*
  # Fix Player Profile Trigger

  1. Changes
    - Drop existing trigger and function
    - Create new trigger function with proper role checking
    - Add new trigger with proper conditions

  2. Security
    - Maintains RLS policies
    - Ensures proper role validation
    - Preserves user data integrity
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_handle_player_profile_upsert ON players;
DROP FUNCTION IF EXISTS handle_player_profile_upsert();

-- Create new function with proper role checking
CREATE OR REPLACE FUNCTION handle_player_profile_upsert()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user exists and is a player
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'player'
  ) THEN
    RAISE EXCEPTION 'Only players can modify player profiles';
  END IF;

  -- For updates, ensure the user can only modify their own profile
  IF TG_OP = 'UPDATE' AND NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Users can only modify their own profile';
  END IF;

  -- For inserts, ensure the user is creating their own profile
  IF TG_OP = 'INSERT' AND NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Users can only create their own profile';
  END IF;

  -- Allow the operation to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER trigger_handle_player_profile_upsert
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION handle_player_profile_upsert();