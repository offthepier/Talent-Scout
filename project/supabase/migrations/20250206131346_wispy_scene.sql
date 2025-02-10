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

-- Create UPDATE policy for profiles
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

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

-- Create UPDATE policy for players
CREATE POLICY "players_update_own" ON players
  FOR UPDATE
  USING (auth.uid() = id);

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
GRANT INSERT, UPDATE ON profiles TO authenticated;
GRANT INSERT, UPDATE ON players TO authenticated;
GRANT INSERT, UPDATE ON scouts TO authenticated;
GRANT INSERT, UPDATE ON clubs TO authenticated;