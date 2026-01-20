-- Add pro subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE;