import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';

// 1. Mocking categories for the "Filter" demo since original data doesn't have them yet
const CATEGORIES = ["All", "Oil", "Acrylic", "Watercolor", "Mixed Media"];

// 2. Artificially expanding the list to demonstrate Masonry layout (Duplicate items)
const expandedProducts = [
  ...products.map(p => ({ ...p, category: "Oil" })), // Assign fake categories
  { ...products[1], id: "5", category: "Acrylic" },
  { ...products[2], id: "6", category: "Watercolor" },
  { ...products[0], id: "7", category: "Mixed Media" },
  { ...products[3], id: "8", category: "Oil" },
  { ...products[1], id: "9", category: "Acrylic" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Use the fetched 'products' to create the expanded list
  // Note: We perform this check inside the render or a memo
  const baseList = products.length > 0 ? products : [];
  
  // Artificial expansion for Masonry Demo (same as before, but using fetched data)
  const expandedProducts = baseList.length > 0 ? [
    ...baseList.map(p => ({ ...p, category: "Oil" })), 
    { ...baseList[1], id: "5", category: "Acrylic" },
    { ...baseList[2], id: "6", category: "Watercolor" },
    { ...baseList[0], id: "7", category: "Mixed Media" },
  ] : [];

  const filteredProducts = activeCategory === "All" 
    ? expandedProducts 
    : expandedProducts.filter((p: any) => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient Background Blob */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4 block">
            The Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6 text-foreground">
            Gallery
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Explore our latest acquisitions. Each piece is a unique dialogue between the artist and the canvas.
          </p>
        </motion.div>

        {/* Glass Filter Bar */}
        <div className="sticky top-24 z-30 mb-12 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-1.5 bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-white/20 rounded-full shadow-sm flex flex-wrap gap-1 justify-center"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${activeCategory === cat ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {/* Moving background pill for active state */}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Masonry Layout */}
        {/* CSS Columns approach: simple, effective for pure vertical stacking */}
        <motion.div
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="break-inside-avoid mb-8"
              >
                <div className="group relative">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    imageUrl={product.imageUrl}
                    price={product.price}
                  />

                  {/* Artistic Overlay Decoration (Optional) */}
                  <div className="absolute -inset-2 border border-primary/0 group-hover:border-primary/10 rounded-xl transition-all duration-500 pointer-events-none -z-10 scale-95 group-hover:scale-105" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-serif">No artworks found</h3>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
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