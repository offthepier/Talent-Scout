/*
  # Add Chat and Trial System Tables

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `content` (text)
      - `attachment_url` (text, optional)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz, optional)

    - `trials`
      - `id` (uuid, primary key)
      - `scout_id` (uuid, references profiles)
      - `player_id` (uuid, references players)
      - `trial_date` (timestamptz)
      - `location` (text)
      - `notes` (text)
      - `status` (text: pending/accepted/rejected)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for message and trial management
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT valid_message CHECK (sender_id != receiver_id)
);

-- Create trials table
CREATE TABLE IF NOT EXISTS trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  trial_date timestamptz NOT NULL,
  location text NOT NULL,
  notes text,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = receiver_id
    )
  );

-- Trial policies
CREATE POLICY "Players can view trials they're involved in"
  ON trials
  FOR SELECT
  USING (
    auth.uid() = player_id
    OR auth.uid() = scout_id
  );

CREATE POLICY "Scouts can create trials"
  ON trials
  FOR INSERT
  WITH CHECK (
    auth.uid() = scout_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'scout'
    )
  );

CREATE POLICY "Players can update trial status"
  ON trials
  FOR UPDATE
  USING (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'player'
    )
  )
  WITH CHECK (
    NEW.status IN ('accepted', 'rejected')
    AND OLD.status = 'pending'
    AND OLD.player_id = NEW.player_id
    AND OLD.scout_id = NEW.scout_id
    AND OLD.trial_date = NEW.trial_date
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS trials_scout_id_idx ON trials(scout_id);
CREATE INDEX IF NOT EXISTS trials_player_id_idx ON trials(player_id);
CREATE INDEX IF NOT EXISTS trials_trial_date_idx ON trials(trial_date);

-- Grant necessary permissions
GRANT ALL ON messages TO authenticated;
GRANT ALL ON trials TO authenticated;

-- Create function to handle message notifications
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Here you could add notification logic
  -- For now, we'll just update the timestamp
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new messages
CREATE TRIGGER on_new_message
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_message();

-- Create function to handle trial updates
CREATE OR REPLACE FUNCTION handle_trial_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for trial updates
CREATE TRIGGER on_trial_update
  BEFORE UPDATE ON trials
  FOR EACH ROW
  EXECUTE FUNCTION handle_trial_update();