import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  className?: string;
};

const ProductCard = ({ id, title, imageUrl, price, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  
  // Random rating for demo
  const rating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, imageUrl, price });
  };

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

          {/* Pinterest-style Dark Overlay (Only on Hover) */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Content: Top Right Button */}
          <div className="absolute top-4 right-4 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
             <Button 
               size="icon" 
               className="rounded-full bg-white text-black hover:bg-white/90"
               onClick={handleAddToCart}
             >
               <Plus className="h-5 w-5" />
             </Button>
          </div>

          {/* Hover Content: Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <h3 className="text-white font-serif text-2xl mb-1">{title}</h3>
             <div className="flex justify-between items-center text-white/90 text-sm font-medium">
                <span>${price.toFixed(2)}</span>
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