import WishlistButton from './WishlistButton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';

type ProductCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  category?: 'Oil' | 'Acrylic' | 'Watercolor' | 'Mixed Media';
  dimensions?: string;
  year?: string | number;
  className?: string;
};

const ProductCard = ({
  id,
  title,
  imageUrl,
  price,
  category,
  dimensions,
  year,
  className,
}: ProductCardProps) => {
  return (
    <motion.div
      className={cn("group h-full cursor-pointer", className)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link to={`/product/${id}`} className="block h-full">
        <article className="flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-black/8 bg-white/72 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.34)] backdrop-blur-sm transition-all duration-300 group-hover:border-black/12 group-hover:shadow-[0_24px_56px_-32px_rgba(15,23,42,0.38)] sm:rounded-[1.75rem] sm:shadow-[0_22px_60px_-36px_rgba(15,23,42,0.42)]">
          <div className="relative overflow-hidden">
            <div className="aspect-[0.84] overflow-hidden bg-muted/30 sm:aspect-[4/5]">
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>

            {category && (
              <div className="absolute left-2.5 top-2.5 rounded-full border border-white/60 bg-white/82 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
                {category}
              </div>
            )}

            <div className="absolute right-2.5 top-2.5 z-20 sm:right-4 sm:top-4">
              <WishlistButton
                productId={id}
                className="h-7 w-7 border border-white/20 bg-white/42 text-white shadow-lg backdrop-blur-md hover:bg-white/60 sm:h-10 sm:w-10 sm:shadow-xl"
                size={14}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
            <div className="space-y-1">
              <h3 className="line-clamp-2 font-sans text-[0.98rem] font-medium leading-snug tracking-[-0.02em] text-foreground sm:text-[1.12rem]">
                {title}
              </h3>
              {(dimensions || year) && (
                <p className="text-[11px] font-medium tracking-[0.01em] text-muted-foreground sm:text-xs">
                  {[dimensions, year].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            <div className="mt-auto">
              <span className="text-[1.02rem] font-semibold tracking-tight text-foreground sm:text-base">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
