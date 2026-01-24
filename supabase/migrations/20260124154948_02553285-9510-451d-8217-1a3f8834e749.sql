-- Remove the complex WITH CHECK condition and use a trigger instead for robust protection
-- This is more reliable than RLS WITH CHECK for business logic enforcement

-- First, drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a simpler UPDATE policy that only checks ownership
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger function that blocks modifications to sensitive fields
-- This runs with SECURITY DEFINER implicitly (trigger context) and cannot be bypassed
CREATE OR REPLACE FUNCTION public.protect_subscription_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent any changes to is_pro field
  IF OLD.is_pro IS DISTINCT FROM NEW.is_pro THEN
    RAISE EXCEPTION 'Modification of is_pro field is not allowed through direct updates';
  END IF;
  
  -- Prevent any changes to pro_expires_at field
  IF OLD.pro_expires_at IS DISTINCT FROM NEW.pro_expires_at THEN
    RAISE EXCEPTION 'Modification of pro_expires_at field is not allowed through direct updates';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger that fires BEFORE UPDATE
DROP TRIGGER IF EXISTS protect_subscription_fields_trigger ON profiles;
CREATE TRIGGER protect_subscription_fields_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_subscription_fields();