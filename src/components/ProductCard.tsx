import WishlistButton from './WishlistButton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { getDisplayTag } from '@/lib/productTags';

type ProductCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  category?: 'Oil' | 'Acrylic' | 'Watercolor' | 'Mixed Media';
  dimensions?: string;
  year?: string | number;
  tags?: string[];
  className?: string;
};

const ProductCard = ({
  id,
  title,
  imageUrl,
  price,
  dimensions,
  year,
  tags = [],
  className,
}: ProductCardProps) => {
  const { label: displayTag, isSold, isNew } = getDisplayTag(tags);

  return (
    <motion.div
      className={cn('group cursor-pointer h-full', className)}
      whileHover={!isSold ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <Link to={`/product/${id}`} className="block h-full">
        <article
          className={cn(
            'flex h-full flex-col overflow-hidden rounded-2xl bg-white',
            'border border-black/[0.06] transition-all duration-300',
            !isSold &&
              'hover:border-black/[0.10] hover:shadow-[0_18px_40px_-14px_rgba(20,14,6,0.13)]',
            isSold && 'opacity-75',
          )}
        >
          {/* ── Image ── */}
          <div className="relative overflow-hidden aspect-[4/5] bg-[#ede8df]">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />

            {/* Top-left: Category badge
            {category && (
              <div className="absolute left-2.5 top-2.5 rounded-full border border-white/50 bg-white/86 px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-foreground/70 backdrop-blur-md">
                {category}
              </div>
            )} */}

            {/* Top-right: Wishlist */}
            <div className="absolute right-2.5 top-2.5 z-20">
              <WishlistButton
                productId={id}
                className="h-[30px] w-[30px] rounded-full border border-white/20 bg-white/38 text-white backdrop-blur-md hover:bg-white/70 shadow-sm"
                size={17}
              />
            </div>

            {displayTag && (
              <div
                className={cn(
                  'absolute bottom-2.5 left-2.5 z-20 max-w-[calc(100%-5rem)] rounded-full px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-md',
                  isSold ? 'bg-black/60' : isNew ? 'bg-[#c4a770]/90' : 'bg-[#7a6a52]/78'
                )}
              >
                <span className="block truncate">{displayTag}</span>
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="flex flex-col gap-1.5 px-3 py-3">
            <h3 className="line-clamp-2 font-serif text-[0.9rem] font-normal leading-snug tracking-[-0.01em] text-foreground">
              {title}
            </h3>
            <div className="flex items-baseline justify-between">
              {(dimensions || year) && (
                <p className="text-[10.5px] font-normal text-[#b09a78]">
                  {[dimensions, year].filter(Boolean).join(' · ')}
                </p>
              )}
              <span
                className={cn(
                  'ml-auto text-[14px] font-medium tracking-[0.01em]',
                  isSold ? 'text-[#c4b49a] line-through' : 'text-[#7a6a52]',
                )}
              >
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
