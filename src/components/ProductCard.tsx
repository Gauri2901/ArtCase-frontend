import { useRef } from 'react';
import WishlistButton from './WishlistButton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
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
  const rating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);

  return (
    <motion.div
      ref={ref}
      className={cn("group break-inside-avoid mb-2 sm:mb-4 cursor-pointer", className)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link to={`/product/${id}`} className="block w-full h-full">

        {/* ── MOBILE: unified card (image + info in one box) ── */}
        <div className="sm:hidden rounded-xl overflow-hidden bg-card shadow-sm border border-border/40">

          {/* Image */}
          <div className="relative overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-cover"
            />
            {/* Wishlist */}
            <div className="absolute top-1.5 right-1.5 z-20">
              <WishlistButton
                productId={id}
                className="bg-white/50 hover:bg-white/75 backdrop-blur-md border border-white/20 text-white shadow-lg h-6 w-6"
                size={12}
              />
            </div>
          </div>

          {/* Info strip — compact for 2-column layout */}
          <div className="px-2 py-1.5">
            <h3 className="text-foreground font-serif text-xs italic leading-snug line-clamp-1">
              {title}
            </h3>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-foreground text-[10px] font-semibold">{formatPrice(price)}</span>
              <div className="flex items-center gap-0.5 text-muted-foreground text-[10px]">
                <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── DESKTOP: image-only card with hover overlay ── */}
        <div className="hidden sm:block relative overflow-hidden rounded-2xl bg-transparent">

          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Wishlist */}
          <div className="absolute top-3 right-3 z-20">
            <WishlistButton
              productId={id}
              className="bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/20 text-white shadow-xl h-9 w-9"
              size={18}
            />
          </div>

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Info slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="text-white font-serif text-lg leading-tight mb-1 line-clamp-1">{title}</h3>
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