import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useArtworks } from '@/hooks/useArtworks';

const CATEGORIES = ["All", "Oil", "Acrylic", "Watercolor", "Mixed Media"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { artworks: products, isLoading, isError } = useArtworks();

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

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
        <h2 className="text-2xl font-serif mb-4 text-destructive">Unable to load collection</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We encountered a connection issue. This usually happens during server-side startup. Please try again in a few moments.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-28 pb-8 text-center">
        <h1 className="text-5xl md:text-7xl font-serif font-medium mb-4 text-foreground tracking-tight">
          The Collection
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                text-sm font-medium transition-all duration-300 relative
                ${activeCategory === cat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/*
          MASONRY LAYOUT changes:
          - Mobile: 2 columns, tighter gaps (gap-2, space-y-2)
          - Desktop: 3 columns, moderate gaps (gap-4, space-y-4)
          - max-w-5xl instead of max-w-7xl so desktop images aren't huge
        */}
        <div className="columns-2 lg:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4 mx-auto max-w-5xl px-1 sm:px-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard
                  id={product._id}
                  title={product.title}
                  imageUrl={product.imageUrl}
                  price={product.price}
                  category={product.category}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
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
      </div>
    </div>
  );
};

export default Gallery;