import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/api';
import type { Artwork } from '@/types/admin';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: Artwork[];
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derive IDs for quick lookup
  const wishlistIds = wishlist.map((item) => item._id);

  // Load wishlist from backend when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiRequest<Artwork[]>('/users/wishlist', {
          token: user.token
        });
        setWishlist(data);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to use the wishlist');
      return;
    }

    try {
      const updatedWishlist = await apiRequest<Artwork[]>(`/users/wishlist/${productId}`, {
        method: 'POST',
        token: user.token
      });
      
      const wasAdded = updatedWishlist.some(item => item._id === productId);
      const isNowRemoved = !wasAdded && wishlistIds.includes(productId);
      
      setWishlist(updatedWishlist);
      
      if (wasAdded) {
        toast.success('Added to wishlist');
      } else if (isNowRemoved) {
        toast.info('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error(error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistIds, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
