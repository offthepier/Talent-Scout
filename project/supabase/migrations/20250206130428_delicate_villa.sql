/*
  # Fix Player Search Function

  1. Changes
    - Fix return type mismatch in search_players function
    - Update column names for clarity
    - Ensure proper type casting
    - Add proper indexing for performance

  2. Security
    - Maintain existing RLS policies
    - Function runs with SECURITY DEFINER
*/

-- Create extension for full text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_players;

-- Create player search function with fixed return types
CREATE OR REPLACE FUNCTION search_players(
  search_query text DEFAULT NULL,
  position_filter text DEFAULT NULL,
  min_age int DEFAULT NULL,
  max_age int DEFAULT NULL,
  location_filter text DEFAULT NULL
) RETURNS TABLE (
  player_id uuid,
  player_name text,
  player_position text,
  player_location text,
  player_age int,
  player_stats jsonb,
  player_verified boolean,
  similarity_score double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as player_id,
    pr.full_name as player_name,
    p.position as player_position,
    p.location as player_location,
    EXTRACT(YEAR FROM age(p.birth_date))::int as player_age,
    p.stats as player_stats,
    p.verified as player_verified,
    CASE 
      WHEN search_query IS NULL THEN 0::double precision
      ELSE similarity(pr.full_name, search_query)::double precision
    END as similarity_score
  FROM players p
  JOIN profiles pr ON p.id = pr.id
  WHERE (
    search_query IS NULL OR
    pr.full_name ILIKE '%' || search_query || '%' OR
    p.position ILIKE '%' || search_query || '%' OR
    p.location ILIKE '%' || search_query || '%'
  )
  AND (position_filter IS NULL OR p.position = position_filter)
  AND (location_filter IS NULL OR p.location ILIKE '%' || location_filter || '%')
  AND (
    min_age IS NULL OR 
    EXTRACT(YEAR FROM age(p.birth_date))::int >= min_age
  )
  AND (
    max_age IS NULL OR 
    EXTRACT(YEAR FROM age(p.birth_date))::int <= max_age
  )
  ORDER BY 
    similarity_score DESC,
    p.verified DESC,
    pr.full_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS players_position_idx ON players(position);
CREATE INDEX IF NOT EXISTS players_location_idx ON players(location);
CREATE INDEX IF NOT EXISTS players_birth_date_idx ON players(birth_date);
CREATE INDEX IF NOT EXISTS profiles_full_name_trgm_idx ON profiles USING gin(full_name gin_trgm_ops);

-- Grant access to the function
GRANT EXECUTE ON FUNCTION search_players TO anon, authenticated;