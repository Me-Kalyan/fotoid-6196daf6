import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { logger } from '@/lib/logger';

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (error) {
        logger.error('Failed to generate fingerprint:', error);
        // Fallback: use a random ID stored in localStorage
        let fallbackId = localStorage.getItem('fp_fallback');
        if (!fallbackId) {
          fallbackId = `fallback_${crypto.randomUUID()}`;
          localStorage.setItem('fp_fallback', fallbackId);
        }
        setFingerprint(fallbackId);
      } finally {
        setIsLoading(false);
      }
    };

    getFingerprint();
  }, []);

  return { fingerprint, isLoading };
};
