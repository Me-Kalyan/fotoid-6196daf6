-- Fix: Ensure profiles table RLS policies explicitly target authenticated users only
-- This prevents any potential anonymous access to user data

-- Drop existing SELECT policy and recreate with explicit authenticated target
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing INSERT policy and recreate with explicit authenticated target
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop existing UPDATE policy and recreate with explicit authenticated target
DROP POLICY IF EXISTS "Users can update profile info only" ON public.profiles;
CREATE POLICY "Users can update profile info only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND NOT (is_pro IS DISTINCT FROM (SELECT p.is_pro FROM profiles p WHERE p.user_id = auth.uid()))
  AND NOT (pro_expires_at IS DISTINCT FROM (SELECT p.pro_expires_at FROM profiles p WHERE p.user_id = auth.uid()))
);

-- Keep the DELETE policy as-is (already denies all deletes)