import { Link, useParams, useNavigate } from 'react-router-dom';
import WishlistButton from '@/components/WishlistButton';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Truck, Ruler, Calendar, ShoppingBag, Zap } from 'lucide-react';
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

// ── Utility: force scroll to top across all browsers ─────────────────────────
const forceScrollTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { artworks } = useArtworks();

  const [product, setProduct] = useState<Artwork | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: dominantColor } = useColor(product?.imageUrl || '', 'hex', {
      crossOrigin: 'anonymous',
      quality: 10,
  });

  useLayoutEffect(() => {
      forceScrollTop();
  }, [id]);
  useEffect(() => {
    forceScrollTop();
    const raf = requestAnimationFrame(() => forceScrollTop());
    const timer = setTimeout(() => forceScrollTop(), 80);
    return () => {
      cancelAnimationFrame(raf);
        clearTimeout(timer);
    };
  }, [id]);

  useEffect(() => {
    setProduct(null);
    setReviews([]);
    setLoading(true);
    setAddedToCart(false);
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
  }, [id])

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
        <button
          onClick={() => navigate('/gallery')}
          className="mt-2 px-6 py-2.5 rounded-full border border-foreground/20 text-sm hover:bg-foreground hover:text-background transition-all"
          >
            Return to Gallery
        </button>
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
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
      addToCart({
        id: product._id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        dimensions: product.dimensions,
      });
      navigate('/checkout');
    };

    const handleRecommendationClick = (artworkId: string) => {
      forceScrollTop();
      navigate(`/product/${artworkId}`);
      requestAnimationFrame(() => forceScrollTop());
      setTimeout(() => forceScrollTop(), 80);
    };

    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
    };

    const hasRating = (product.rating ?? 0) > 0;

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background">

            {/* ── Ambient color glow from artwork ───────────────── */}
            <div
                className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: dominantColor ? `${dominantColor}08` : 'transparent' }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/40" />
                <div
                    className="absolute -top-[30%] -right-[15%] w-[55%] h-[55%] rounded-full blur-[140px] opacity-20 animate-pulse"
                    style={{ backgroundColor: dominantColor || 'var(--primary)' }}
                />
                <div
                    className="absolute -bottom-[20%] -left-[10%] w-[45%] h-[45%] rounded-full blur-[120px] opacity-10"
                    style={{ backgroundColor: dominantColor || 'var(--accent)' }}
                />
            </div>

            <div key={id} className="relative">
                <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24 md:px-8 lg:pt-28 lg:pb-28">

                    {/* ── Back button ───────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="mb-6 sm:mb-10"
                    >
                        <Link
                            to="/gallery"
                            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm group-hover:border-foreground/30 group-hover:bg-foreground/5 transition-all">
                                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:-translate-x-0.5" />
                            </span>
                            <span className="font-medium">Back to Collection</span>
                        </Link>
                    </motion.div>

                    {/* ═══════════════════════════════════════
                        MAIN GRID
                    ═══════════════════════════════════════ */}
                    <div className="grid grid-cols-1 gap-10 items-start lg:grid-cols-2 lg:gap-14 xl:gap-20">

                        {/* ── IMAGE PANEL ──────────────────────── */}
                        <div className="relative lg:sticky lg:top-24">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="relative"
                            >
                                {/* Main image container */}
                                <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-neutral-50 dark:bg-neutral-900 group
                                    aspect-square sm:aspect-[4/5]
                                    border border-black/5 dark:border-white/10
                                    shadow-[0_32px_80px_-20px_rgba(0,0,0,0.25)]">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="h-full w-full object-contain transition-transform duration-[1.2s] group-hover:scale-[1.03] p-2 sm:p-4"
                                    />

                                    {/* Subtle vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 rounded-2xl sm:rounded-[2rem] ring-1 ring-inset ring-white/10 pointer-events-none" />

                                    {/* Wishlist button */}
                                    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20">
                                        <WishlistButton
                                            productId={product._id}
                                            className="h-9 w-9 sm:h-10 sm:w-10 border border-white/25 bg-white/20 text-white shadow-lg backdrop-blur-md hover:bg-white/35 transition-all"
                                            size={16}
                                        />
                                    </div>

                                    {/* Category pill overlaid on image bottom-left */}
                                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── CONTENT PANEL ─────────────────────── */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col"
                        >
                            {/* Title */}
                            <motion.h1
                                variants={itemVariants}
                                className="font-serif font-medium leading-[1.08] tracking-tight text-foreground mb-4
                                           text-[2.1rem] sm:text-[2.6rem] lg:text-[2.8rem] xl:text-[3.2rem]"
                            >
                                {product.title}
                            </motion.h1>

                            {/* Star rating */}
                            {hasRating && (
                                <motion.div variants={itemVariants} className="flex items-center gap-2.5 mb-5">
                                    <div className="flex gap-[2px]">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <StarIcon
                                                key={s}
                                                className={`h-[13px] w-[13px] ${s <= Math.round(product.rating ?? 0)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-muted text-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">
                                        {(product.rating ?? 0).toFixed(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        ({product.numReviews ?? 0} {product.numReviews === 1 ? 'review' : 'reviews'})
                                    </span>
                                </motion.div>
                            )}

                            {/* Price */}
                            <motion.div variants={itemVariants} className="mb-7">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-sans font-light tracking-tight text-foreground text-[2rem] sm:text-[2.2rem] leading-none">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        Incl. Taxes
                                    </span>
                                </div>
                            </motion.div>

                            {/* ── CTA Buttons ─────────────────────── */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-3 mb-8">

                                {/* Primary: Add to Collection */}
                                <button
                                    onClick={handleAddToCart}
                                    className="relative w-full py-3.5 sm:py-4 rounded-2xl overflow-hidden group
                                               bg-foreground text-background
                                               transition-all duration-300
                                               hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:-translate-y-[1px]
                                               active:translate-y-0 active:shadow-none"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2.5 text-sm sm:text-[15px] font-semibold tracking-wide">
                                        <ShoppingBag className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform duration-300 ${addedToCart ? 'scale-110' : 'group-hover:scale-105'}`} />
                                        <span>
                                            {addedToCart ? 'Added to Collection ✓' : 'Add to Collection'}
                                        </span>
                                    </span>
                                    {/* Shine sweep */}
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
                                </button>

                                {/* Secondary: Buy Now */}
                                <button
                                    onClick={handleBuyNow}
                                    className="relative w-full py-3.5 sm:py-4 rounded-2xl overflow-hidden group
                                               border border-foreground/20 bg-transparent
                                               transition-all duration-300
                                               hover:border-foreground/40 hover:bg-foreground/[0.04]
                                               active:bg-foreground/[0.08]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2.5 text-sm sm:text-[15px] font-semibold text-foreground tracking-wide">
                                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 group-hover:scale-105 transition-transform duration-300" />
                                        Buy Now
                                    </span>
                                </button>
                            </motion.div>

                            {/* Description */}
                            {product.description && (
                                <motion.div variants={itemVariants} className="mb-7">
                                    <p className="font-sans text-sm sm:text-[0.9375rem] leading-[1.9] text-muted-foreground">
                                        {product.description}
                                    </p>
                                </motion.div>
                            )}

                            {/* ── Specs strip ─────────────────────── */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-foreground/[0.02] px-5 py-4 mb-7"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/[0.07] border border-primary/10 shrink-0">
                                        <Ruler className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-0.5">
                                            Dimensions
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {product.dimensions || '24″ × 36″'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/[0.07] border border-primary/10 shrink-0">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-0.5">
                                            Year
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {product.year || '2025'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ── Trust badges ─────────────────────── */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-3.5">
                                {[
                                    {
                                        icon: Truck,
                                        title: 'Curated Global Shipping',
                                        desc: 'White-glove delivery with museum-grade impact packaging.',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Authenticity Guaranteed',
                                        desc: 'Includes a signed and sealed Certificate of Authenticity.',
                                    },
                                ].map(({ icon: Icon, title, desc }) => (
                                    <div key={title} className="flex items-start gap-3.5 group">
                                        <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-primary/[0.07] border border-primary/10 transition-colors group-hover:bg-primary/[0.12]">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="pt-0.5">
                                            <h4 className="font-serif text-sm font-bold text-foreground mb-0.5">{title}</h4>
                                            <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                        </motion.div>
                    </div>


                    {/* ═══════════════════════════════════════
                        REVIEWS
                    ═══════════════════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="mt-16 pt-12 border-t border-border/40 md:mt-24 md:pt-16"
                    >
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                                <span className="text-[0.62rem] font-bold tracking-[0.3em] text-primary uppercase mb-3">
                                    Feedback
                                </span>
                                <h2 className="text-3xl font-serif font-medium md:text-4xl">
                                    Collector Reviews
                                </h2>
                                <div className="h-[2px] w-12 bg-primary/25 mt-4 rounded-full" />
                            </div>

                            {reviews.length === 0 ? (
                                <div className="max-w-xs mx-auto text-center py-10 px-8 rounded-2xl border border-border/30 bg-foreground/[0.02]">
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
                    ═══════════════════════════════════════ */}
                    {recommendedArtworks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="mt-16 pt-12 border-t border-border/40 md:mt-24 md:pt-14"
                        >
                            <div className="mb-8 sm:mb-10">
                                <span className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-primary">
                                    Recommendations
                                </span>
                                <h2 className="mt-1.5 text-[1.75rem] font-serif font-medium tracking-tight md:text-[2.1rem]">
                                    You may also like
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                                {recommendedArtworks.map((artwork, index) => (
                                    <motion.div
                                        key={artwork._id}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.35, delay: index * 0.06 }}
                                        className="h-full"
                                    >
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