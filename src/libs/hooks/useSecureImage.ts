import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';

export const useSecureImage = (imageKey: string | null | undefined, token: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPreSignedUrl = async () => {
      if (!imageKey || !token) {
        setImageUrl(null);
        return;
      }

      // Optimization: Don't request if it's already an HTTP URL (just in case)
      if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
        setImageUrl(imageKey);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/storage/download-url?key=${encodeURIComponent(imageKey)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load secure image URL');
        }

        const data = await response.json();
        
        if (isMounted) {
          setImageUrl(data.url);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          setImageUrl(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPreSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [imageKey, token]);

  return { imageUrl, isLoading, error };
};
