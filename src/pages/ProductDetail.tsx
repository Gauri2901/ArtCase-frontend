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
        <div className="container mx-auto px-4 py-24 md:py-32">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Image Section */}
            <div className="relative lg:sticky lg:top-32">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 bg-white/5 relative group aspect-square lg:aspect-[4/5]"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Wishlist Button on Image */}
                <div className="absolute top-6 right-6 z-20">
                  <WishlistButton
                    productId={product._id}
                    className="h-12 w-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/20 text-white shadow-2xl"
                    size={22}
                  />
                </div>

                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.5rem]" />
              </motion.div>
            </div>

            {/* Content Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                <span className="h-px w-8 bg-primary/40" />
                <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
                  {product.category} Masterpiece
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium text-foreground mb-6 sm:mb-8 leading-[1.1] tracking-tight">
                {product.title}
              </motion.h1>

              <motion.div variants={itemVariants} className="flex items-baseline gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-sans font-light tracking-tight text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                       <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <StarIcon
                             key={s}
                             className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                           />
                        ))}
                       </div>
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                         {product.rating.toFixed(1)} ({product.numReviews})
                       </span>
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground text-sm uppercase tracking-widest font-medium self-start mt-2">Incl. Taxes</span>
              </motion.div>

              {/* Action Buttons - Exactly below price */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                <Button
                  size="lg"
                  className="flex-1 w-full sm:w-auto rounded-full py-4 sm:py-6 text-lg sm:text-xl font-medium shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all h-auto"
                  onClick={handleAddToCart}
                >
                  <Plus className="mr-2 h-5 w-5" /> Add to Collection
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 w-full sm:w-auto rounded-full py-4 sm:py-6 text-lg sm:text-xl font-medium bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] transition-all h-auto"
                  onClick={() => {
                    handleAddToCart();
                    navigate('/checkout');
                  }}
                >
                  <CreditCard className="mr-2 h-5 w-5" /> Buy Now
                </Button>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="space-y-6 mb-10">
                <p className="text-lg text-muted-foreground leading-relaxed font-sans">
                  {product.description}
                </p>
              </motion.div>

              {/* Specifications */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8 mb-12 py-8 border-y border-border/40">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Dimensions</span>
                  </div>
                  <p className="font-sans text-lg">{product.dimensions || '24" x 36"'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-widest font-bold">Year</span>
                  </div>
                  <p className="font-sans text-lg">{product.year || '2025'}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg">Curated Global Shipping</h4>
                    <p className="text-muted-foreground">White-glove delivery with museum-grade impact packaging.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg">Authenticity Guaranteed</h4>
                    <p className="text-muted-foreground">Includes a signed and sealed Certificate of Authenticity.</p>
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
