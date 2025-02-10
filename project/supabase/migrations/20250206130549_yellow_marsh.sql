/*
  # Fix Authentication Policies

  1. Changes
    - Add INSERT policy for profiles table
    - Add INSERT policies for role-specific tables
    - Update existing policies for clarity

  2. Security
    - Maintain secure access control
    - Allow users to create their initial profile
    - Ensure users can only access their own data
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own') THEN
    DROP POLICY "profiles_insert_own" ON profiles;
  END IF;
END $$;

-- Create INSERT policy for profiles
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create INSERT policies for role-specific tables
CREATE POLICY "players_insert_own" ON players
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'player'
    )
  );

CREATE POLICY "scouts_insert_own" ON scouts
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'scout'
    )
  );

CREATE POLICY "clubs_insert_own" ON clubs
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'club'
    )
  );

-- Grant necessary permissions
GRANT INSERT ON profiles TO authenticated;
GRANT INSERT ON players TO authenticated;
GRANT INSERT ON scouts TO authenticated;
GRANT INSERT ON clubs TO authenticated;