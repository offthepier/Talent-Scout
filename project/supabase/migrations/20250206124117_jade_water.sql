/*
  # Initial Schema Setup for Scouting Platform

  1. New Tables
    - profiles: User profiles with role-based access
    - players: Detailed player information and stats
    - achievements: Player achievements and verifications
    - scouts: Scout profiles and affiliations
    - clubs: Club information and verification status

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Set up role-based permissions
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Profiles policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone') THEN
    DROP POLICY "Public profiles are viewable by everyone" ON profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    DROP POLICY "Users can update own profile" ON profiles;
  END IF;

  -- Players policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players are viewable by everyone') THEN
    DROP POLICY "Players are viewable by everyone" ON players;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players can update own profile') THEN
    DROP POLICY "Players can update own profile" ON players;
  END IF;

  -- Achievements policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Achievements are viewable by everyone') THEN
    DROP POLICY "Achievements are viewable by everyone" ON achievements;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players can insert own achievements') THEN
    DROP POLICY "Players can insert own achievements" ON achievements;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players can update own achievements') THEN
    DROP POLICY "Players can update own achievements" ON achievements;
  END IF;

  -- Scouts policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Scouts are viewable by everyone') THEN
    DROP POLICY "Scouts are viewable by everyone" ON scouts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Scouts can update own profile') THEN
    DROP POLICY "Scouts can update own profile" ON scouts;
  END IF;

  -- Clubs policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clubs are viewable by everyone') THEN
    DROP POLICY "Clubs are viewable by everyone" ON clubs;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clubs can update own profile') THEN
    DROP POLICY "Clubs can update own profile" ON clubs;
  END IF;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('player', 'scout', 'club')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  height integer,
  weight integer,
  position text,
  preferred_foot text CHECK (preferred_foot IN ('left', 'right', 'both')),
  location text,
  birth_date date,
  stats jsonb DEFAULT '{}'::jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scouts (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  club text,
  role text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  name text UNIQUE NOT NULL,
  location text,
  league text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "profiles_public_view" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "players_public_view" ON players
  FOR SELECT USING (true);

CREATE POLICY "players_update_own" ON players
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "achievements_public_view" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "achievements_insert_own" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "achievements_update_own" ON achievements
  FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "scouts_public_view" ON scouts
  FOR SELECT USING (true);

CREATE POLICY "scouts_update_own" ON scouts
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "clubs_public_view" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "clubs_update_own" ON clubs
  FOR UPDATE USING (auth.uid() = id);