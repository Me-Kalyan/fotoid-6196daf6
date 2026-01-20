import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFingerprint } from './useFingerprint';

const FREE_DOWNLOAD_LIMIT = 2;

// Valid photo types whitelist
const VALID_PHOTO_TYPES = ['passport', 'single', 'sheet', 'paid_credit'] as const;
type PhotoType = typeof VALID_PHOTO_TYPES[number];

// Validation helpers
const validatePhotoType = (type?: string): PhotoType => {
  if (type && VALID_PHOTO_TYPES.includes(type as PhotoType)) {
    return type as PhotoType;
  }
  return 'passport'; // default fallback
};

const validateCountryCode = (code?: string): string | null => {
  if (!code) return null;
  // ISO 3166-1 alpha-2: exactly 2 uppercase letters
  const cleaned = code.toUpperCase().slice(0, 2);
  if (/^[A-Z]{2}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
};

const validateFingerprint = (fp?: string | null): string | null => {
  if (!fp) return null;
  // Limit length and allow only alphanumeric, hyphens, underscores
  const cleaned = fp.slice(0, 128).replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned || null;
};

export interface DownloadRecord {
  id: string;
  user_id: string;
  downloaded_at: string;
  photo_type: string | null;
  country_code: string | null;
  is_paid: boolean | null;
  fingerprint: string | null;
}

export const useDownloadHistory = () => {
  const { user } = useAuth();
  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();
  const queryClient = useQueryClient();

  // Query user's own downloads (for display purposes)
  const { data: downloads = [], isLoading: downloadsLoading } = useQuery({
    queryKey: ['download-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('download_history')
        .select('*')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      return data as DownloadRecord[];
    },
    enabled: !!user,
  });

  // Query fingerprint-based limits (across ALL users with same fingerprint)
  const { data: fingerprintLimit } = useQuery({
    queryKey: ['fingerprint-limit', fingerprint],
    queryFn: async () => {
      if (!fingerprint) return { total_downloads: 0, can_download: true };
      
      const { data, error } = await supabase
        .rpc('check_fingerprint_limit', { 
          p_fingerprint: fingerprint, 
          p_limit: FREE_DOWNLOAD_LIMIT 
        });

      if (error) {
        console.error('Fingerprint check error:', error);
        return { total_downloads: 0, can_download: true };
      }
      
      // Returns array with single row
      const result = data?.[0] || { total_downloads: 0, can_download: true };
      return result;
    },
    enabled: !!fingerprint,
  });

  // Calculate remaining based on fingerprint (cross-account protection)
  const fingerprintDownloadsUsed = Number(fingerprintLimit?.total_downloads || 0);
  const freeDownloadsRemaining = Math.max(0, FREE_DOWNLOAD_LIMIT - fingerprintDownloadsUsed);
  const canDownloadFree = fingerprintLimit?.can_download ?? true;

  const recordDownloadMutation = useMutation({
    mutationFn: async ({ photoType, countryCode, isPaid }: { 
      photoType?: string; 
      countryCode?: string; 
      isPaid?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Validate and sanitize all inputs before inserting
      const validatedPhotoType = validatePhotoType(photoType);
      const validatedCountryCode = validateCountryCode(countryCode);
      const validatedFingerprint = validateFingerprint(fingerprint);

      const { error } = await supabase
        .from('download_history')
        .insert({
          user_id: user.id,
          photo_type: validatedPhotoType,
          country_code: validatedCountryCode,
          is_paid: isPaid || false,
          fingerprint: validatedFingerprint,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-history', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['fingerprint-limit', fingerprint] });
    },
  });

  return {
    downloads,
    isLoading: downloadsLoading || fingerprintLoading,
    freeDownloadsUsed: fingerprintDownloadsUsed,
    freeDownloadsRemaining,
    canDownloadFree,
    freeDownloadLimit: FREE_DOWNLOAD_LIMIT,
    fingerprint,
    recordDownload: recordDownloadMutation.mutate,
    isRecording: recordDownloadMutation.isPending,
  };
};
