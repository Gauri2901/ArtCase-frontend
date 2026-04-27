import { Link, useParams, useNavigate } from 'react-router-dom';
import WishlistButton from '@/components/WishlistButton';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, Plus, ShieldCheck, Truck, Ruler, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import type { Artwork } from '@/types/admin';
import { formatPrice } from '@/lib/utils';
import { useColor } from 'color-thief-react';
import type { Review } from '@/types/review';
import ReviewList from '@/components/reviews/ReviewList';
import { Star as StarIcon } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Artwork | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract dominant color from image for dynamic background
  const { data: dominantColor } = useColor(product?.imageUrl || '', 'hex', {
    crossOrigin: 'anonymous',
    quality: 10
  });

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!id) return;
        const [productData, reviewsData] = await Promise.all([
            apiRequest<Artwork>(`/products/${id}`),
            apiRequest<Review[]>(`/reviews/product/${id}`)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!product) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4">
        <h1 className="text-3xl font-serif mb-4">Masterpiece Not Found</h1>
        <Button onClick={() => navigate('/gallery')} variant="outline">
          Return to Gallery
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      dimensions: product.dimensions,
    });
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* 1. Dynamic Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: dominantColor ? `${dominantColor}10` : 'transparent' }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent opacity-80" />
        <div
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ backgroundColor: dominantColor || 'var(--primary)' }}
        />
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20"
          style={{ backgroundColor: dominantColor || 'var(--accent)' }}
        />
      </div>

      <div className="relative">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6 md:py-24">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 sm:mb-12 hidden sm:block"
          >
            <Button variant="ghost" asChild className="hover:bg-primary/5 -ml-4 text-muted-foreground group">
              <Link to="/gallery" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Collection
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.8fr)] lg:gap-14 xl:gap-16">
            {/* Image Section */}
            <div className="relative lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.28)] group lg:aspect-[4/4.7]"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Wishlist Button on Image */}
                <div className="absolute right-5 top-5 z-20">
                  <WishlistButton
                    productId={product._id}
                    className="h-11 w-11 border border-white/20 bg-white/20 text-white shadow-2xl backdrop-blur-md hover:bg-white/40"
                    size={20}
                  />
                </div>

                <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
              </motion.div>
            </div>

            {/* Content Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col lg:max-w-xl xl:max-w-2xl"
            >
              <motion.div variants={itemVariants} className="mb-5 flex items-center gap-2">
                <span className="h-px w-8 bg-primary/40" />
                <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
                  {product.category} Masterpiece
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="mb-5 font-serif text-4xl font-medium leading-none tracking-tight text-foreground sm:text-5xl lg:text-[4.2rem] xl:text-[4.8rem]">
                {product.title}
              </motion.h1>

              <motion.div variants={itemVariants} className="mb-6 flex items-baseline gap-3 sm:gap-4">
                <div className="flex flex-col">
                  <span className="font-sans text-3xl font-light tracking-tight text-foreground sm:text-[2.6rem]">
                    {formatPrice(product.price)}
                  </span>
                  {(product.rating ?? 0) > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                       <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <StarIcon
                             key={s}
                             className={`h-4 w-4 ${s <= Math.round(product.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                           />
                        ))}
                       </div>
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                         {(product.rating ?? 0).toFixed(1)} ({product.numReviews ?? 0})
                       </span>
                    </div>
                  )}
                </div>
                <span className="mt-2 self-start text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground sm:text-sm">Incl. Taxes</span>
              </motion.div>

              {/* Action Buttons - Exactly below price */}
              <motion.div variants={itemVariants} className="mb-8 flex flex-col items-stretch gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-auto min-h-[3.75rem] flex-1 rounded-full px-6 py-4 text-base font-medium shadow-xl shadow-primary/10 transition-all hover:scale-[1.01] sm:text-lg"
                  onClick={handleAddToCart}
                >
                  <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Add to Collection
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-auto min-h-[3.75rem] flex-1 rounded-full bg-foreground px-6 py-4 text-base font-medium text-background transition-all hover:scale-[1.01] hover:bg-foreground/90 sm:text-lg"
                  onClick={() => {
                    handleAddToCart();
                    navigate('/checkout');
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Buy Now
                </Button>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="mb-8 space-y-6">
                <p className="max-w-xl font-sans text-base leading-8 text-muted-foreground sm:text-lg">
                  {product.description}
                </p>
              </motion.div>

              {/* Specifications */}
              <motion.div variants={itemVariants} className="mb-10 grid grid-cols-2 gap-6 border-y border-border/40 py-6 sm:gap-8">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Dimensions</span>
                  </div>
                  <p className="font-sans text-base sm:text-lg">{product.dimensions || '24" x 36"'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Year</span>
                  </div>
                  <p className="font-sans text-base sm:text-lg">{product.year || '2025'}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-5">
                <div className="group flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/5 p-3 transition-colors group-hover:bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold sm:text-lg">Curated Global Shipping</h4>
                    <p className="text-sm leading-7 text-muted-foreground sm:text-base">White-glove delivery with museum-grade impact packaging.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/5 p-3 transition-colors group-hover:bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold sm:text-lg">Authenticity Guaranteed</h4>
                    <p className="text-sm leading-7 text-muted-foreground sm:text-base">Includes a signed and sealed Certificate of Authenticity.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 pt-32 border-t border-border/40"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center mb-16">
                <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4">Feedback</span>
                <h2 className="text-4xl md:text-5xl font-serif font-medium">Collector Reviews</h2>
                <div className="h-1 w-20 bg-primary/20 mt-8 rounded-full" />
              </div>
              
              <ReviewList 
                reviews={reviews} 
                averageRating={product.rating || 0} 
                totalReviews={product.numReviews || 0} 
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
