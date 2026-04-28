import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <Heart className="text-red-500 fill-red-500 h-6 w-6" />
              <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">Your Collection</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-serif font-medium tracking-tight sm:text-5xl lg:text-[3.7rem]"
            >
              Wishlist
            </motion.h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-base leading-8 text-muted-foreground sm:text-lg"
          >
            A curated selection of your favorite masterpieces. Save the items that speak to you.
          </motion.p>
        </div>

        {/* Content */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {wishlist.map((artwork, index) => (
              <motion.div
                key={artwork._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  id={artwork._id}
                  title={artwork.title}
                  price={artwork.price}
                  imageUrl={artwork.imageUrl}
                  category={artwork.category}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-8">
              <Heart className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-3xl font-serif mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
              Explore the gallery and save the artworks that inspire you to start your collection.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/gallery">
                Explore Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Footer Action */}
        {wishlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="relative mt-16 overflow-hidden rounded-[2.5rem] bg-primary p-8 text-center text-primary-foreground sm:p-12"
          >
            <div className="relative z-10">
              <h2 className="mb-5 text-3xl font-serif sm:text-4xl lg:text-[3rem]">Ready to bring them home?</h2>
              <p className="mx-auto mb-8 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
                Transform your favorites from dreams into reality. Add them to your cart and complete your purchase.
              </p>
              <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-lg" asChild>
                <Link to="/cart">
                  Go to Shopping Bag <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
