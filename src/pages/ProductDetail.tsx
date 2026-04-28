import { Link, useParams, useNavigate } from 'react-router-dom';
import WishlistButton from '@/components/WishlistButton';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, Plus, ShieldCheck, Truck, Ruler, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { apiRequest } from '@/lib/api';
import type { Artwork } from '@/types/admin';
import { formatPrice } from '@/lib/utils';
import { useColor } from 'color-thief-react';
import type { Review } from '@/types/review';
import ReviewList from '@/components/reviews/ReviewList';
import { useArtworks } from '@/hooks/useArtworks';
import { Star as StarIcon } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { artworks } = useArtworks();

  const [product, setProduct] = useState<Artwork | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: dominantColor } = useColor(product?.imageUrl || '', 'hex', {
    crossOrigin: 'anonymous',
    quality: 10,
  });

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  // Reset product state when id changes so stale data never shows
  useEffect(() => {
    setProduct(null);
    setReviews([]);
    setLoading(true);
  }, [id]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!id) return;
        const [productData, reviewsData] = await Promise.all([
          apiRequest<Artwork>(`/products/${id}`),
          apiRequest<Review[]>(`/reviews/product/${id}`),
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

  const recommendedArtworks = useMemo(() => {
    const candidates = artworks.filter((a) => a._id !== product?._id);
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [artworks, product?._id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

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

  // FIX: Navigate to recommendation and force scroll-to-top immediately
  const handleRecommendationClick = (artworkId: string) => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    navigate(`/product/${artworkId}`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  const hasRating = (product.rating ?? 0) > 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">

      {/* Ambient background glow */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: dominantColor ? `${dominantColor}10` : 'transparent' }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent opacity-80" />
        <div
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-25 animate-pulse"
          style={{ backgroundColor: dominantColor || 'var(--primary)' }}
        />
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-15"
          style={{ backgroundColor: dominantColor || 'var(--accent)' }}
        />
      </div>

      <div key={id} className="relative">
        {/*
          Top padding:
            mobile (<sm) : pt-20 — clears fixed navbar so image is never hidden
            sm           : pt-16
            lg+          : pt-20
        */}
        <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-5 sm:pt-24 md:px-8 lg:pt-28 lg:pb-24">

          {/* Back button — tablet/desktop only */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 hidden sm:block"
          >
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary/5 -ml-3 text-muted-foreground group text-sm"
            >
              <Link to="/gallery" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Collection
              </Link>
            </Button>
          </motion.div>

          {/* ═══════════════════════════════════════
              MAIN GRID
              Mobile : single column
              lg+    : two equal columns, image sticky
          ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-2 lg:gap-12 xl:gap-16">

            {/* ── IMAGE ── */}
            <div className="relative lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="relative overflow-hidden bg-white/5 group
                           aspect-square rounded-2xl
                           sm:aspect-[4/5] sm:rounded-[2rem]
                           border border-white/10
                           shadow-[0_24px_64px_-16px_rgba(0,0,0,0.22)]"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute right-4 top-4 z-20">
                  <WishlistButton
                    productId={product._id}
                    className="h-10 w-10 border border-white/20 bg-white/20 text-white shadow-xl backdrop-blur-md hover:bg-white/40"
                    size={17}
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 sm:rounded-[2rem]" />
              </motion.div>
            </div>

            {/* ── CONTENT ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col"
            >

              {/* Category eyebrow */}
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                <span className="h-px w-7 bg-primary/50 shrink-0" />
                <span className="text-[0.65rem] font-bold tracking-[0.28em] text-primary uppercase">
                  {product.category} Masterpiece
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="font-serif font-medium leading-[1.12] tracking-tight text-foreground mb-4
                           text-[2rem] sm:text-[2.4rem] lg:text-[2.6rem] xl:text-[3rem]"
              >
                {product.title}
              </motion.h1>

              {/* Price row */}
              <motion.div variants={itemVariants} className="flex items-end gap-3 mb-3">
                <span className="font-sans font-light tracking-tight text-foreground leading-none
                                 text-[1.85rem] sm:text-[2.1rem]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground pb-1">
                  Incl. Taxes
                </span>
              </motion.div>

              {/* Star rating — only when present */}
              {hasRating && (
                <motion.div variants={itemVariants} className="flex items-center gap-2 mb-5">
                  <div className="flex gap-[2px]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon
                        key={s}
                        className={`h-[13px] w-[13px] ${
                          s <= Math.round(product.rating ?? 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-none">
                    {(product.rating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({product.numReviews ?? 0}&nbsp;
                    {product.numReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </motion.div>
              )}
              {/* Consistent gap whether or not rating exists */}
              {!hasRating && <div className="mb-5" />}

              {/* CTA Buttons
                  Mobile : stacked full-width
                  sm+    : side by side equal width */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-7"
              >
                <Button
                  size="lg"
                  className="w-full h-12 rounded-full text-sm font-semibold
                             shadow-md shadow-primary/15 transition-all
                             hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  onClick={handleAddToCart}
                >
                  <Plus className="mr-2 h-4 w-4 shrink-0" />
                  Add to Collection
                </Button>
                <Button
                  size="lg"
                  className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold
                             transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
                  onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                >
                  <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                  Buy Now
                </Button>
              </motion.div>

              {/* Description — always rendered even if short */}
              <motion.div variants={itemVariants} className="mb-7">
                <p className="font-sans text-sm leading-[1.9] text-muted-foreground sm:text-[0.9375rem]">
                  {product.description}
                </p>
              </motion.div>

              {/* ── Specs strip — ALWAYS shown ── */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-x-6 border-y border-border/40 py-5 mb-6"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-[0.58rem] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                      Dimensions
                    </span>
                  </div>
                  <p className="font-sans text-sm font-medium text-foreground">
                    {product.dimensions || '24" × 36"'}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-[0.58rem] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                      Year
                    </span>
                  </div>
                  <p className="font-sans text-sm font-medium text-foreground">
                    {product.year || '2025'}
                  </p>
                </div>
              </motion.div>

              {/* ── Trust badges — ALWAYS shown ── */}
              <motion.div variants={itemVariants} className="flex flex-col gap-4">
                <div className="group flex items-start gap-3.5">
                  <div className="shrink-0 rounded-xl bg-primary/[0.07] border border-primary/10
                                  p-2.5 transition-colors group-hover:bg-primary/[0.12]">
                    <Truck className="h-[17px] w-[17px] text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif text-[0.875rem] font-bold text-foreground mb-0.5">
                      Curated Global Shipping
                    </h4>
                    <p className="text-xs leading-[1.7] text-muted-foreground">
                      White-glove delivery with museum-grade impact packaging.
                    </p>
                  </div>
                </div>
                <div className="group flex items-start gap-3.5">
                  <div className="shrink-0 rounded-xl bg-primary/[0.07] border border-primary/10
                                  p-2.5 transition-colors group-hover:bg-primary/[0.12]">
                    <ShieldCheck className="h-[17px] w-[17px] text-primary" />
                  </div>
                  <div>
                    <h4 className="font-serif text-[0.875rem] font-bold text-foreground mb-0.5">
                      Authenticity Guaranteed
                    </h4>
                    <p className="text-xs leading-[1.7] text-muted-foreground">
                      Includes a signed and sealed Certificate of Authenticity.
                    </p>
                  </div>
                </div>
              </motion.div>

            </motion.div>{/* /CONTENT */}
          </div>{/* /MAIN GRID */}


          {/* ═══════════════════════════════════════
              REVIEWS
          ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-14 pt-12 border-t border-border/40 md:mt-20 md:pt-16"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                <span className="text-[0.65rem] font-bold tracking-[0.3em] text-primary uppercase mb-2.5">
                  Feedback
                </span>
                <h2 className="text-3xl font-serif font-medium md:text-4xl lg:text-5xl">
                  Collector Reviews
                </h2>
                <div className="h-[3px] w-14 bg-primary/20 mt-5 rounded-full" />
              </div>

              {reviews.length === 0 ? (
                <div className="max-w-xs mx-auto text-center py-10 px-8 rounded-2xl
                                border border-border/30 bg-foreground/[0.02]">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <ReviewList
                  reviews={reviews}
                  averageRating={product.rating || 0}
                  totalReviews={product.numReviews || 0}
                />
              )}
            </div>
          </motion.div>


          {/* ═══════════════════════════════════════
              RECOMMENDATIONS
              Uses handleRecommendationClick wrapper
              to guarantee scroll-to-top before nav
          ═══════════════════════════════════════ */}
          {recommendedArtworks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-14 pt-12 border-t border-border/40 md:mt-20 md:pt-14"
            >
              <div className="mb-7 flex flex-col gap-1.5 sm:mb-9">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-primary">
                  Recommendations
                </span>
                <h2 className="text-[1.75rem] font-serif font-medium tracking-tight md:text-[2.2rem]">
                  You may also like
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                {recommendedArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="h-full"
                  >
                    {/*
                      Wrap ProductCard in a div with onClick that first scrolls
                      to top then navigates — this fires BEFORE React Router
                      renders the new route, so the page always opens at top.
                    */}
                    <div
                      className="h-full cursor-pointer"
                      onClick={() => handleRecommendationClick(artwork._id)}
                    >
                      <ProductCard
                        id={artwork._id}
                        title={artwork.title}
                        imageUrl={artwork.imageUrl}
                        price={artwork.price}
                        category={artwork.category}
                        dimensions={artwork.dimensions}
                        year={artwork.year}
                        className="h-full pointer-events-none"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
