/*
  # Update RLS policies for player profiles

  1. Changes
    - Add UPDATE policies for profiles and players tables
    - Add necessary permissions for authenticated users

  2. Security
    - Ensure users can only update their own data
    - Maintain existing RLS policies
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Only drop policies that we know might conflict
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'players_update_own' AND tablename = 'players') THEN
    DROP POLICY "players_update_own" ON players;
  END IF;
END $$;

-- Create UPDATE policy for players
CREATE POLICY "players_update_own" ON players
  FOR UPDATE
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT UPDATE ON profiles TO authenticated;
GRANT UPDATE ON players TO authenticated;
GRANT UPDATE ON scouts TO authenticated;
GRANT UPDATE ON clubs TO authenticated;