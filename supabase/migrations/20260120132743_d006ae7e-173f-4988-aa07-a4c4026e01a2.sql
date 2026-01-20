-- Add fingerprint column to track browser fingerprints for abuse prevention
ALTER TABLE public.download_history 
ADD COLUMN fingerprint TEXT;

-- Create index for faster fingerprint lookups
CREATE INDEX idx_download_history_fingerprint ON public.download_history(fingerprint);

-- Create a view to count free downloads per fingerprint (across all users)
CREATE OR REPLACE VIEW public.fingerprint_download_counts AS
SELECT 
  fingerprint,
  COUNT(*) as free_download_count
FROM public.download_history
WHERE is_paid = false AND fingerprint IS NOT NULL
GROUP BY fingerprint;

-- Enable RLS on the view is not needed as views inherit from underlying table policies
-- But we need a function to check fingerprint limits that bypasses RLS
CREATE OR REPLACE FUNCTION public.check_fingerprint_limit(p_fingerprint TEXT, p_limit INTEGER DEFAULT 2)
RETURNS TABLE(
  total_downloads BIGINT,
  can_download BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(*), 0)::BIGINT as total_downloads,
    COALESCE(COUNT(*), 0) < p_limit as can_download
  FROM public.download_history
  WHERE download_history.fingerprint = p_fingerprint
    AND download_history.is_paid = false;
END;
$$;