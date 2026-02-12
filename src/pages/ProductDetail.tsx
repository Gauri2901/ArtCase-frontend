import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ShieldCheck, Truck, Ruler, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://art-case-backend.vercel.app/api/products/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
        // Optional: navigate('/gallery') here
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading masterpiece...</div>;
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
      imageUrl: product.imageUrl
    });
  };

  // Animation variants for staggered text loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">

      {/* 1. Ambient Background Blur - Takes colors from the image itself */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-[100px] z-10" />
        <img
          src={product.imageUrl}
          alt=""
          className="w-full h-full object-cover blur-3xl opacity-40 scale-150"
        />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">

        {/* Navigation Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild className="hover:bg-white/20 -ml-4 text-muted-foreground">
            <Link to="/gallery" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Gallery
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

          {/* 2. Sticky Image Section */}
          <div className="relative lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-white/5 aspect-[4/5] relative group"
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover"
              />

              {/* Subtle grain overlay on the painting */}
              <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
            </motion.div>
          </div>

          {/* 3. Product Details Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col pt-4"
          >
            {/* Artist/Category Tag */}
            <motion.span variants={itemVariants} className="text-sm font-bold tracking-widest text-primary uppercase mb-4">
              Original Artwork
            </motion.span>

            {/* Title */}
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-serif font-medium text-foreground mb-6 leading-tight">
              {product.title}
            </motion.h1>

            {/* Price & Add Button */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
              <span className="text-3xl font-sans font-light">
                ${product.price.toFixed(2)}
              </span>
              <Button size="lg" className="rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-primary/25" onClick={handleAddToCart}>
                <Plus className="mr-2 h-5 w-5" /> Add to Collection
              </Button>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="space-y-6 mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed font-sans">
                {product.description}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed font-sans">
                This piece invites the viewer to explore the relationship between color and form.
                Hand-painted with archival quality materials to ensure longevity and vibrance.
              </p>
            </motion.div>

            {/* Mock Specifications */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 mb-12">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-wide">Dimensions</span>
                </div>
                <p className="font-serif text-lg">24" x 36"</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-wide">Year</span>
                </div>
                <p className="font-serif text-lg">2025</p>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 bg-secondary/50 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-background rounded-full shadow-sm">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-serif font-bold">Free Global Shipping</h4>
                  <p className="text-sm text-muted-foreground">Includes custom crating and insurance.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-background rounded-full shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-serif font-bold">Certificate of Authenticity</h4>
                  <p className="text-sm text-muted-foreground">Signed and dated by the artist.</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;