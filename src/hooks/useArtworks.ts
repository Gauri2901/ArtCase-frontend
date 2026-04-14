import useSWR from 'swr';
import type { Artwork } from '@/types/admin';

export function useArtworks() {
  const { data, error, isLoading, mutate } = useSWR<Artwork[]>(
    '/products',
    // Fetcher is provided globally in main.tsx via SWRConfig
    {
      dedupingInterval: 5000, // 5 seconds
    }
  );

  return {
    artworks: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
