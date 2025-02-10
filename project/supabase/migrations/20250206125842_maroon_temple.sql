/*
  # Add search functionality and filters

  1. New Functions
    - Add full text search for players
    - Add function to filter players by criteria
  
  2. New Indexes
    - Add GiST index for location-based search
    - Add indexes for common filter fields
  
  3. New Views
    - Create player_search_view for optimized searching
*/

-- Create extension for full text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create player search function
CREATE OR REPLACE FUNCTION search_players(
  search_query text,
  position_filter text DEFAULT NULL,
  min_age int DEFAULT NULL,
  max_age int DEFAULT NULL,
  location_filter text DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  full_name text,
  position text,
  location text,
  age int,
  stats jsonb,
  verified boolean,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    pr.full_name,
    p.position,
    p.location,
    EXTRACT(YEAR FROM age(p.birth_date))::int as age,
    p.stats,
    p.verified,
    similarity(pr.full_name, search_query) as similarity
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
    CASE WHEN search_query IS NULL THEN 0
    ELSE similarity(pr.full_name, search_query) END DESC,
    p.verified DESC,
    pr.full_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS players_position_idx ON players(position);
CREATE INDEX IF NOT EXISTS players_location_idx ON players(location);
CREATE INDEX IF NOT EXISTS players_birth_date_idx ON players(birth_date);
CREATE INDEX IF NOT EXISTS profiles_full_name_trgm_idx ON profiles USING gin(full_name gin_trgm_ops);

-- Add policy for search function
CREATE POLICY "Anyone can search players" ON players
  FOR SELECT
  USING (true);

-- Create view for player search results
CREATE OR REPLACE VIEW player_search_view AS
SELECT 
  p.id,
  pr.full_name,
  p.position,
  p.location,
  p.birth_date,
  p.stats,
  p.verified,
  p.height,
  p.weight,
  p.preferred_foot
FROM players p
JOIN profiles pr ON p.id = pr.id
WHERE pr.role = 'player';

-- Grant access to the view
GRANT SELECT ON player_search_view TO anon, authenticated;