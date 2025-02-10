/*
  # Fix Player Table RLS Policies

  1. Changes
    - Drop and recreate all player table policies
    - Add proper USING and WITH CHECK clauses for all operations
    - Ensure proper role-based access control

  2. Security
    - Enable RLS on players table
    - Add comprehensive policies for SELECT, INSERT, UPDATE
    - Restrict modifications to own records
    - Validate user role for operations
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

-- Create SELECT policy (anyone can view)
CREATE POLICY "players_select_own"
  ON players
  FOR SELECT
  USING (true);

-- Create INSERT policy (only players can insert their own record)
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

-- Create UPDATE policy (players can update their own record)
CREATE POLICY "players_update_own"
  ON players
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'player'
    )
  );

-- Grant necessary permissions
GRANT ALL ON players TO authenticated;