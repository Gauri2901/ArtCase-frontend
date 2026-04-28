import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Filter, SlidersHorizontal, X } from 'lucide-react';
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
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [activeCategory, artworks, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="mb-4 text-2xl font-serif text-destructive">Unable to load collection</h2>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          We encountered a connection issue. This usually happens during server-side startup. Please try again in a few moments.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,167,112,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(120,168,196,0.12),_transparent_28%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-28 md:px-6 md:pt-32">
        <section className="mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/70 sm:mb-3 sm:text-xs"
          >
            <span className="h-px w-8 bg-primary/25" />
            <span>Curated Works</span>
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-left font-serif text-[2.55rem] font-medium tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl"
          >
            The Collection
          </motion.h1>
        </section>

        <div className="mt-6 flex items-center justify-between border-b border-black/8 pb-4 sm:hidden">
          <button
            type="button"
            onClick={() => setMobilePanelOpen(true)}
            className="inline-flex items-center gap-2 text-[1.05rem] font-medium tracking-[-0.02em] text-primary/55 transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter and sort
          </button>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredProducts.length}</span> works
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 hidden border-b border-black/8 pb-5 sm:block sm:pb-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
                <Filter className="h-3.5 w-3.5" />
                Medium
              </div>
              <Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as Category)}>
                <SelectTrigger className="h-11 w-full rounded-full border-black/10 bg-white/75 px-4 text-left shadow-none sm:w-[13rem]">
                  <SelectValue placeholder="All mediums" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:items-center">
              <div className="text-sm text-muted-foreground lg:mr-2">
                <span className="font-semibold text-foreground">{filteredProducts.length}</span> works available
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Sort
                </div>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortValue)}>
                  <SelectTrigger className="h-11 min-w-[11rem] rounded-full border-black/10 bg-white/75 px-4 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.section>

        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:mt-10 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  className="h-full"
                >
                  <ProductCard
                    id={product._id}
                    title={product.title}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    category={product.category}
                    dimensions={product.dimensions}
                    year={product.year}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-20 text-center">
            <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="text-xl font-serif">No artworks found</h3>
            <Button
              variant="link"
              onClick={() => setActiveCategory("All")}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        <Dialog open={mobilePanelOpen} onOpenChange={setMobilePanelOpen}>
          <DialogContent
            showCloseButton={false}
            className="top-0 left-auto right-0 h-screen max-w-[86vw] translate-x-0 translate-y-0 rounded-none border-l border-black/8 bg-[#f5f8f3] p-0 shadow-none data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-black/8 px-6 pb-6 pt-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="font-sans text-[2rem] font-medium tracking-[-0.04em] text-foreground">
                      Filter and sort
                    </DialogTitle>
                    <p className="mt-1 text-base text-muted-foreground">
                      {filteredProducts.length} products
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobilePanelOpen(false)}
                    className="mt-1 rounded-full p-2 text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
                  >
                    <X className="h-7 w-7" />
                    <span className="sr-only">Close filters</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-10 px-6 py-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[1.02rem] font-medium text-foreground">Medium</span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as Category)}>
                    <SelectTrigger className="h-14 rounded-full border-black/10 bg-white/80 px-5 text-base shadow-none">
                      <SelectValue placeholder="All mediums" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[1.02rem] font-medium text-foreground">Sort by</span>
                    <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortValue)}>
                    <SelectTrigger className="h-14 rounded-full border-black/10 bg-white/80 px-5 text-base shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-black/8 px-6 py-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("All");
                    setSortBy("newest");
                  }}
                  className="flex-1 text-left text-[1.05rem] font-medium text-primary/55 underline underline-offset-4"
                >
                  Remove all
                </button>
                <Button
                  type="button"
                  onClick={() => setMobilePanelOpen(false)}
                  className="h-14 flex-1 rounded-full text-lg"
                >
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;
