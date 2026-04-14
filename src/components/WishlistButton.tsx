import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

const WishlistButton = ({ productId, className, size = 20 }: WishlistButtonProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const active = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative rounded-full transition-all duration-300 group overflow-hidden flex items-center justify-center",
        active 
          ? "bg-red-500/10 text-red-500" 
          : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/5",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active ? 'active' : 'inactive'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <Heart 
            size={size} 
            className={cn(
              "transition-all duration-300",
              active ? "fill-current scale-110" : "fill-none scale-100"
            )} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Ripple effect on click */}
      {active && (
        <motion.div
          className="absolute inset-0 bg-red-500/20 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </button>
  );
};

export default WishlistButton;
