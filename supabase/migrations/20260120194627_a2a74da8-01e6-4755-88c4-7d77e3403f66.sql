-- Update handle_new_user function with input validation for full_name and avatar_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validated_full_name TEXT;
  validated_avatar_url TEXT;
BEGIN
  -- Validate and sanitize full_name (max 100 chars, strip leading/trailing whitespace)
  validated_full_name := LEFT(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), 100);
  IF validated_full_name = '' THEN
    validated_full_name := NULL;
  END IF;

  -- Validate avatar_url (must be valid URL format, max 2048 chars)
  validated_avatar_url := LEFT(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')), 2048);
  IF validated_avatar_url = '' THEN
    validated_avatar_url := NULL;
  ELSIF validated_avatar_url !~ '^https?://[^\s]+$' THEN
    -- Invalid URL format - set to NULL for safety
    validated_avatar_url := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    validated_full_name,
    validated_avatar_url
  );
  RETURN NEW;
END;
$$;