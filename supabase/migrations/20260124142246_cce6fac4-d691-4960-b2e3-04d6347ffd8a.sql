-- Add input validation to check_fingerprint_limit function for security hardening
-- The SECURITY DEFINER is intentional for cross-user abuse prevention, but we add validation

CREATE OR REPLACE FUNCTION public.check_fingerprint_limit(p_fingerprint TEXT, p_limit INTEGER DEFAULT 2)
RETURNS TABLE(total_downloads BIGINT, can_download BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate fingerprint: must not be null, empty, or too long
  IF p_fingerprint IS NULL OR LENGTH(TRIM(p_fingerprint)) = 0 OR LENGTH(p_fingerprint) > 128 THEN
    RAISE EXCEPTION 'Invalid fingerprint parameter';
  END IF;
  
  -- Validate limit: must be within reasonable range
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'Invalid limit parameter';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(COUNT(*), 0)::BIGINT as total_downloads,
    COALESCE(COUNT(*), 0) < p_limit as can_download
  FROM public.download_history
  WHERE download_history.fingerprint = p_fingerprint
    AND download_history.is_paid = false;
END;
$$;