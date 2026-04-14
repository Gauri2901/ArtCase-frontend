import useSWR from 'swr';
import type { Artwork } from '@/types/admin';

export function useArtworks() {
  const { data, error, isLoading, mutate } = useSWR<Artwork[]>(
    '/products',
    // Fetcher is provided globally in main.tsx via SWRConfig
    {
      deduplicatingInterval: 60000, // 1 minute
    }
  );

  return {
    artworks: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
