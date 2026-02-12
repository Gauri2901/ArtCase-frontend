import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Oil", "Acrylic", "Watercolor", "Mixed Media"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://art-case-backend.vercel.app/api/products');
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

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter((p: any) => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background relative pb-20">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-32 pb-12 text-center">
        <h1 className="text-6xl md:text-8xl font-serif font-medium mb-6 text-foreground tracking-tight">
          The Collection
        </h1>
        
        {/* Minimalist Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 mb-16">
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

        {/* MASONRY LAYOUT: 
            We use CSS columns (columns-1 md:columns-2 lg:columns-3) to create the collage effect.
            The 'gap-6' creates space between columns.
            The ProductCard needs 'break-inside-avoid' (added in step 1) to prevent splitting.
        */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 mx-auto max-w-7xl px-2">
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