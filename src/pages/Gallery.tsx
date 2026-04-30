import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useArtworks } from '@/hooks/useArtworks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const CATEGORIES = ["All", "Oil", "Acrylic", "Watercolor", "Mixed Media"] as const;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "title", label: "Title: A to Z" },
] as const;

type Category = (typeof CATEGORIES)[number];
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const { artworks, isLoading, isError } = useArtworks();

  const filteredProducts = useMemo(() => {
    const byCategory = activeCategory === "All"
      ? artworks
      : artworks.filter((artwork) => artwork.category === activeCategory);

    return [...byCategory].sort((a, b) => {
      switch (sortBy) {
        case "price-low":  return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "title":      return a.title.localeCompare(b.title);
        case "newest":
        default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [activeCategory, artworks, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="mb-4 text-2xl font-serif text-destructive">Unable to load collection</h2>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          We encountered a connection issue. Please try again in a few moments.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">

      {/* ── Subtle ambient background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(196,167,112,0.10),transparent)]" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(120,168,196,0.08),transparent_60%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 pt-28 pb-24 md:pt-32 md:pb-28">

        {/* ══════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════ */}
        <div className="mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <span className="h-px w-8 bg-primary/30" />
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.32em] text-primary/70">
              Curated Works
            </span>
          </motion.div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-serif font-medium tracking-[-0.04em] text-foreground
                         text-[2.4rem] leading-[1.05]
                         sm:text-5xl
                         lg:text-6xl"
            >
              The Collection
            </motion.h1>

            {/* Desktop: count badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center gap-2 pb-1"
            >
              <span className="font-sans text-3xl font-light text-foreground/20 leading-none">
                {String(filteredProducts.length).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">works</span>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            FILTER BAR — DESKTOP (sm+)
        ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="hidden sm:flex items-center justify-between
                     border-y border-border/50 py-4 mb-8 md:mb-10 gap-4"
        >
          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  'relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200',
                  activeCategory === cat
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                ].join(' ')}
              >
                {cat}
                {activeCategory === cat && cat !== 'All' && (
                  <motion.span
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-full bg-foreground -z-10"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-semibold text-foreground">{filteredProducts.length}</span> available
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
                <SelectTrigger className="h-9 w-auto min-w-[9.5rem] rounded-full border-border/60 bg-transparent px-4 text-xs shadow-none gap-2 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            FILTER BAR — MOBILE (<sm)
        ══════════════════════════════════════════ */}
        <div className="flex sm:hidden items-center justify-between mb-6 pb-4 border-b border-border/40">
          <button
            type="button"
            onClick={() => setMobilePanelOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground
                       hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter & Sort
            {/* Active indicator dot */}
            {(activeCategory !== 'All' || sortBy !== 'newest') && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredProducts.length}</span> works
          </span>
        </div>

        {/* ══════════════════════════════════════════
            PRODUCT GRID
            - Mobile  : 2 columns
            - sm      : 2 columns
            - md      : 3 columns
            - xl      : 4 columns
            Cards use consistent aspect-ratio so
            every row height is uniform.
        ══════════════════════════════════════════ */}
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid gap-3
                       grid-cols-2
                       sm:gap-4 sm:grid-cols-2
                       md:gap-5 md:grid-cols-3
                       xl:gap-6 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                  className="group relative flex flex-col"
                >
                  {/* ── CARD SHELL ──
                      Wraps ProductCard so we can add a unified
                      hover lift + shadow without touching the inner component.
                  */}
                  <div
                    className="flex flex-col h-full rounded-2xl overflow-hidden
                               bg-white/60 dark:bg-white/[0.03]
                               border border-black/[0.06] dark:border-white/10
                               shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]
                               transition-all duration-300 ease-out
                               hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14)]
                               hover:-translate-y-1
                               hover:border-black/10 dark:hover:border-white/20"
                  >
                    <ProductCard
                      id={product._id}
                      title={product.title}
                      imageUrl={product.imageUrl}
                      price={product.price}
                      category={product.category}
                      dimensions={product.dimensions}
                      year={product.year}
                      tags={product.tags}
                      className="h-full border-none shadow-none bg-transparent rounded-none"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="mb-5 rounded-full bg-muted/40 p-5">
              <Filter className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-serif text-xl mb-2">No works found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              No artworks match your current filters. Try a different category.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveCategory("All")}
              className="rounded-full px-6 h-10 text-sm"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE FILTER DRAWER
      ══════════════════════════════════════════ */}
      <Dialog open={mobilePanelOpen} onOpenChange={setMobilePanelOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-auto right-0 h-[100dvh] max-w-[88vw]
                     translate-x-0 translate-y-0
                     rounded-none rounded-l-3xl
                     border-l border-border/50
                     bg-background/95 backdrop-blur-xl
                     p-0 shadow-2xl
                     data-[state=closed]:slide-out-to-right
                     data-[state=open]:slide-in-from-right
                     sm:hidden"
        >
          <div className="flex h-full min-h-0 flex-col">

            {/* Header */}
            <div className="border-b border-border/40 px-6 pt-8 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="font-serif text-[1.6rem] font-medium tracking-tight text-foreground leading-none">                    
                    Filter & Sort
                  </DialogTitle>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'work' : 'works'} available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobilePanelOpen(false)}
                  className="mt-0.5 rounded-full p-2 text-muted-foreground
                             transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7 pb-28">

              {/* Category */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">                    Medium
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={[
                          'flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150',                        activeCategory === cat
                          ? 'bg-foreground text-background'
                          : 'bg-muted/40 text-foreground hover:bg-muted',
                      ].join(' ')}
                    >
                      <span>{cat}</span>
                      {activeCategory === cat && (
                        <span className="h-1.5 w-1.5 rounded-full bg-background/60" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Sort by
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value as SortValue)}
                      className={[
                        'flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium text-left transition-all duration-150',
                        sortBy === opt.value
                          ? 'bg-foreground text-background'
                          : 'bg-muted/40 text-foreground hover:bg-muted',
                      ].join(' ')}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-background/60" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-border/40 px-5 py-4 flex items-center gap-3 bg-background/95 backdrop-blur">
              <button
                type="button"
                onClick={() => { setActiveCategory("All"); setSortBy("newest"); }}
                className="flex-1 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Reset all
              </button>
              <Button
                type="button"
                onClick={() => setMobilePanelOpen(false)}
                className="flex-1 h-11 rounded-full text-sm font-semibold"
              >
                Show {filteredProducts.length} works
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
