-- Fix CRITICAL: Prevent users from self-granting Pro subscription
-- Drop existing UPDATE policy that allows unrestricted column updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new UPDATE policy that prevents modification of payment-related fields
-- Users can only update their profile info (full_name, avatar_url, email)
-- The WITH CHECK clause ensures is_pro and pro_expires_at remain unchanged
CREATE POLICY "Users can update profile info only"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    is_pro IS NOT DISTINCT FROM (SELECT p.is_pro FROM public.profiles p WHERE p.user_id = auth.uid()) AND
    pro_expires_at IS NOT DISTINCT FROM (SELECT p.pro_expires_at FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- Add explicit DELETE policies to prevent unauthorized deletion attempts
-- For profiles - users should not be able to delete their profile directly
CREATE POLICY "Users cannot delete profiles"
  ON public.profiles FOR DELETE
  USING (false);

-- For download_history - users should not be able to delete their history
CREATE POLICY "Users cannot delete download history"
  ON public.download_history FOR DELETE
  USING (false);