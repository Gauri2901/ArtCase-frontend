import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Palette, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products"; // [cite: 144]
import ProductCard from "@/components/ProductCard"; // [cite: 110]

// --- Components ---

const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 blur-[120px] animate-blob mix-blend-multiply filter" />
      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-200/30 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply filter" />
      <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-pink-200/30 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply filter" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
};

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden border-2px-s">
      <AuroraBackground />
      
      <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
        {/* Text Content */}
        <motion.div 
          style={{ y: yText }}
          className="flex flex-col gap-6 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-3 py-1 rounded-full border border-primary/20 text-xs font-medium uppercase tracking-wider bg-white/30 backdrop-blur-sm">
              Handcrafted Excellence
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl lg:text-7xl font-serif font-bold leading-tight text-foreground"
          >
            Art that <span className="italic text-primary/80">breathes</span> life into your space.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 font-sans"
          >
            Discover a curated collection of handmade paintings. 
            Where every stroke tells a story and every canvas holds an emotion.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button size="lg" className="rounded-full text-lg h-12 px-8" asChild>
              <Link to="/gallery">
                Explore Gallery <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full text-lg h-12 px-8 bg-white/10 backdrop-blur-md border-primary/20 hover:bg-white/20" asChild>
              <Link to="/about">Our Story</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Image Parallax */}
        <div className="hidden lg:block relative h-[600px] w-full">
           {/* Main Hero Image */}
           <motion.div 
             style={{ y: yImage, scale: scaleImage }}
             className="absolute inset-0 z-10"
           >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
                <img 
                  src="/paintings/ocean.jpg" 
                  alt="Abstract Ocean Art" 
                  className="w-full h-full object-cover"
                />
                {/* Glass Overlay Card */}
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white">
                   <p className="font-serif italic text-lg">"The Ocean's Whisper"</p>
                   <p className="text-sm opacity-80 font-sans">Oil on Canvas, 2025</p>
                </div>
              </div>
           </motion.div>

           {/* Floating Decorative Elements */}
           <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 w-48 h-64 rounded-xl overflow-hidden shadow-xl z-0 opacity-80"
           >
              <img src="/paintings/sunset.jpg" alt="Sunset" className="w-full h-full object-cover" />
           </motion.div>
           
           <motion.div 
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full overflow-hidden shadow-xl z-20 border-4 border-white/30"
           >
              <img src="/paintings/forest.jpg" alt="Forest" className="w-full h-full object-cover" />
           </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
    >
      <div className="bg-primary/5 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-serif font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground font-sans">{description}</p>
    </motion.div>
  );
};

const Home = () => {
  const featuredProducts = products.slice(0, 3); // [cite: 114]

  return (
    <div className="flex flex-col gap-0">
      <HeroSection />

      {/* Features Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureItem 
            icon={Palette} 
            title="100% Handmade" 
            description="Authentic art created by hand. No prints, just raw emotion on canvas." 
            delay={0.1} 
          />
          <FeatureItem 
            icon={Truck} 
            title="Secure Shipping" 
            description="Museum-grade packaging ensures your masterpiece arrives in perfect condition." 
            delay={0.2} 
          />
          <FeatureItem 
            icon={ShieldCheck} 
            title="Satisfaction Guarantee" 
            description="We want you to fall in love with your art. 30-day return policy included." 
            delay={0.3} 
          />
        </div>
      </section>

      {/* Featured Collection with Horizontal Scroll Hint */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-serif font-bold mb-4"
              >
                Curated Selections
              </motion.h2>
              <p className="text-muted-foreground max-w-md">
                Hand-picked favorites from our latest exhibition.
              </p>
            </div>
            <Button variant="ghost" className="group" asChild>
              <Link to="/gallery">
                View Full Gallery <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  id={product.id}
                  title={product.title}
                  imageUrl={product.imageUrl}
                  price={product.price}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 container mx-auto px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10 rounded-3xl transform rotate-1 scale-95" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to find your masterpiece?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join our community of art collectors and bring unique stories into your home.
          </p>
          <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl hover:shadow-2xl transition-all" asChild>
            <Link to="/gallery">Start Your Collection</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;