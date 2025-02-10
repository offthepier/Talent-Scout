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

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('player', 'scout', 'club')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
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

-- Create achievements table
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

-- Create scouts table
CREATE TABLE IF NOT EXISTS scouts (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  club text,
  role text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clubs table
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

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Players policies
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  USING (auth.uid() = id);

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Players can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own achievements"
  ON achievements FOR UPDATE
  USING (auth.uid() = player_id);

-- Scouts policies
CREATE POLICY "Scouts are viewable by everyone"
  ON scouts FOR SELECT
  USING (true);

CREATE POLICY "Scouts can update own profile"
  ON scouts FOR UPDATE
  USING (auth.uid() = id);

-- Clubs policies
CREATE POLICY "Clubs are viewable by everyone"
  ON clubs FOR SELECT
  USING (true);

CREATE POLICY "Clubs can update own profile"
  ON clubs FOR UPDATE
  USING (auth.uid() = id);