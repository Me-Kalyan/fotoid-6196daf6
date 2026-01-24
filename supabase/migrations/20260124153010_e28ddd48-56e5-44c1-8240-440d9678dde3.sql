-- Fix profiles table RLS policies to properly restrict access to authenticated users only
-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update profile info only" ON profiles;
DROP POLICY IF EXISTS "Users cannot delete profiles" ON profiles;

-- Create proper PERMISSIVE policies that explicitly target authenticated role
-- This ensures anonymous users have NO access

-- SELECT: Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile but cannot change is_pro or pro_expires_at
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND NOT (is_pro IS DISTINCT FROM (SELECT p.is_pro FROM profiles p WHERE p.user_id = auth.uid()))
  AND NOT (pro_expires_at IS DISTINCT FROM (SELECT p.pro_expires_at FROM profiles p WHERE p.user_id = auth.uid()))
);

-- DELETE: No one can delete profiles (explicit deny)
CREATE POLICY "No profile deletion allowed"
ON profiles
FOR DELETE
TO authenticated
USING (false);

-- Also fix download_history table for consistency
DROP POLICY IF EXISTS "Users can view their own downloads" ON download_history;
DROP POLICY IF EXISTS "Users can insert their own downloads" ON download_history;
DROP POLICY IF EXISTS "Users cannot delete download history" ON download_history;

-- SELECT: Users can only view their own downloads
CREATE POLICY "Users can view own downloads"
ON download_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own downloads
CREATE POLICY "Users can insert own downloads"
ON download_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: No one can delete download history
CREATE POLICY "No download history deletion"
ON download_history
FOR DELETE
TO authenticated
USING (false);