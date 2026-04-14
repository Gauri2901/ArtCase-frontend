import { useRef } from 'react';
import WishlistButton from './WishlistButton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn, formatPrice } from '@/lib/utils';

type ProductCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  category?: 'Oil' | 'Acrylic' | 'Watercolor' | 'Mixed Media';
  className?: string;
};

const ProductCard = ({ id, title, imageUrl, price, className }: ProductCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Random rating for demo
  const rating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);


  return (
    <motion.div 
      ref={ref}
      className={cn("group relative bg-transparent break-inside-avoid mb-6 cursor-pointer", className)}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link to={`/product/${id}`} className="block w-full h-full">
        <div className="relative overflow-hidden rounded-2xl">
          
          {/* Main Image */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Static Top Right: Wishlist Button (Always Visible) */}
          <div className="absolute top-4 right-4 z-20">
             <WishlistButton 
               productId={id} 
               className="bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/20 text-white shadow-xl h-10 w-10 sm:h-12 sm:w-12" 
               size={24}
             />
          </div>

          {/* Pinterest-style Dark Overlay (Only on Hover) */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Content: Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <h3 className="text-white font-serif text-2xl mb-1">{title}</h3>
             <div className="flex justify-between items-center text-white/90 text-sm font-medium">
                 <span>{formatPrice(price)}</span>
                 <div className="flex items-center gap-1">
                     <Star className="w-3 h-3 fill-white" /> {rating}
                 </div>
             </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
