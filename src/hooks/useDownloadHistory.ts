import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const FREE_DOWNLOAD_LIMIT = 2;

export interface DownloadRecord {
  id: string;
  user_id: string;
  downloaded_at: string;
  photo_type: string | null;
  country_code: string | null;
  is_paid: boolean | null;
}

export const useDownloadHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: downloads = [], isLoading } = useQuery({
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

  const freeDownloadsUsed = downloads.filter(d => !d.is_paid).length;
  const freeDownloadsRemaining = Math.max(0, FREE_DOWNLOAD_LIMIT - freeDownloadsUsed);
  const canDownloadFree = freeDownloadsRemaining > 0;

  const recordDownloadMutation = useMutation({
    mutationFn: async ({ photoType, countryCode, isPaid }: { 
      photoType?: string; 
      countryCode?: string; 
      isPaid?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('download_history')
        .insert({
          user_id: user.id,
          photo_type: photoType || 'passport',
          country_code: countryCode,
          is_paid: isPaid || false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-history', user?.id] });
    },
  });

  return {
    downloads,
    isLoading,
    freeDownloadsUsed,
    freeDownloadsRemaining,
    canDownloadFree,
    freeDownloadLimit: FREE_DOWNLOAD_LIMIT,
    recordDownload: recordDownloadMutation.mutate,
    isRecording: recordDownloadMutation.isPending,
  };
};
