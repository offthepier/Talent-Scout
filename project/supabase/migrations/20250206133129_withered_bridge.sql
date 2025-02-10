/*
  # Fix User Creation Process

  1. Changes
    - Add function to handle user creation in a transaction
    - Ensure proper role-based record creation
    - Set up default values for player stats

  2. Security
    - Function runs with SECURITY DEFINER
    - Validates role input
    - Creates all necessary records atomically
*/

-- Create a function to handle user creation in a transaction
CREATE OR REPLACE FUNCTION create_user_profile(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Validate role
  IF user_role NOT IN ('player', 'scout', 'club') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Create the user auth account
  new_user_id := (
    SELECT id FROM auth.users
    WHERE email = user_email
    LIMIT 1
  );

  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role_id
    )
    VALUES (
      new_user_id,
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      FALSE,
      1
    );
  END IF;

  -- Create the profile
  INSERT INTO profiles (id, email, role)
  VALUES (new_user_id, user_email, user_role);

  -- Create role-specific record
  CASE user_role
    WHEN 'player' THEN
      INSERT INTO players (
        id,
        stats
      ) VALUES (
        new_user_id,
        '{
          "pace": 50,
          "shooting": 50,
          "passing": 50,
          "dribbling": 50,
          "defending": 50,
          "physical": 50
        }'::jsonb
      );
    WHEN 'scout' THEN
      INSERT INTO scouts (id)
      VALUES (new_user_id);
    WHEN 'club' THEN
      INSERT INTO clubs (id)
      VALUES (new_user_id);
  END CASE;

  RETURN TRUE;
END;
$$;