-- Add explicit authenticated role target to download_history policies for defense-in-depth
-- This brings policies in line with profiles table security patterns

-- Drop existing SELECT policy and recreate with explicit authenticated target
DROP POLICY IF EXISTS "Users can view their own downloads" ON public.download_history;
CREATE POLICY "Users can view their own downloads"
ON public.download_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop existing INSERT policy and recreate with explicit authenticated target
DROP POLICY IF EXISTS "Users can insert their own downloads" ON public.download_history;
CREATE POLICY "Users can insert their own downloads"
ON public.download_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update DELETE policy to also target authenticated role for consistency
DROP POLICY IF EXISTS "Users cannot delete download history" ON public.download_history;
CREATE POLICY "Users cannot delete download history"
ON public.download_history
FOR DELETE
TO authenticated
USING (false);