import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Palette, ShieldCheck, Truck, Brush, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

// --- 1. The Aurora Background (Kept from the version you liked) ---
const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 blur-[120px] mix-blend-multiply" />
      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-200/30 blur-[120px] mix-blend-multiply" />
      <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-pink-200/30 blur-[120px] mix-blend-multiply" />
      {/* Texture Noise Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-100 mix-blend-overlay"></div>
    </div>
  );
};

// --- 2. Hero Section with Scroll Parallax ---
const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <AuroraBackground />
      
      <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
        <motion.div style={{ y: yText }} className="flex flex-col gap-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-primary/10 bg-white/30 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
              Curated Handcrafted Art
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl lg:text-8xl font-serif font-medium leading-[0.9] text-foreground"
          >
            Emotion <br/> on <span className="italic text-primary/80">Canvas.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 font-sans"
          >
            Discover unique, handmade paintings created with passion. 
            Or commission a piece that tells your personal story.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button size="lg" className="rounded-full h-14 px-8 text-lg" asChild>
              <Link to="/gallery">Explore Collection</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg bg-white/20 backdrop-blur border-white/40" asChild>
              <a href="#commissions">Commission Art</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Image Parallax */}
        <div className="hidden lg:block relative h-[700px] w-full">
           <motion.div style={{ y: yImage }} className="absolute inset-0 z-10 top-10">
              <div className="relative w-full h-[85%] rounded-[10rem] rounded-tr-none rounded-bl-none overflow-hidden shadow-2xl border-[8px] border-white/20">
                <img src="/paintings/ocean.jpg" alt="Abstract Ocean Art" className="w-full h-full object-cover" />
              </div>
           </motion.div>
           {/* Decorative Floating Element */}
           <motion.div 
              animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-64 h-64 rounded-full overflow-hidden shadow-xl border-4 border-white/30 z-0"
           >
              <img src="/paintings/sunset.jpg" alt="Sunset" className="w-full h-full object-cover opacity-80" />
           </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- 3. Commissions Section (New Feature, Clean Look) ---
const CommissionSection = () => {
  return (
    <section id="commissions" className="py-32 relative overflow-hidden">
      {/* Subtle background splash */}
      <div className="absolute right-0 bottom-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text & Steps */}
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs mb-6">
              <Brush className="w-4 h-4" /> Custom Orders
            </div>
            <h2 className="text-5xl font-serif font-medium mb-6">Your Vision. <br/> Our Hands.</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-md">
              Looking for a specific size or color palette? We accept a limited number of commissions each month to bring your unique ideas to life.
            </p>

            <div className="space-y-8">
              {[
                { title: "Consultation", desc: "Share your space, colors, and inspiration." },
                { title: "Creation", desc: "Receive sketches and updates as we paint." },
                { title: "Delivery", desc: "White-glove shipping to your door." }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <span className="text-4xl font-serif text-primary/20 font-bold group-hover:text-primary transition-colors">0{i+1}</span>
                  <div>
                    <h3 className="text-xl font-serif font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-primary/10 p-2 rounded-full flex max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter email for quote..." 
                  className="bg-transparent flex-grow px-6 outline-none placeholder:text-muted-foreground/70"
                />
                <Button className="rounded-full px-8">Request</Button>
            </div>
          </div>

          {/* Right: Visual Card Stack */}
          <div className="relative h-[600px] flex items-center justify-center">
             <motion.div 
               whileHover={{ scale: 1.05, rotate: -2 }}
               className="absolute w-80 h-[450px] bg-white p-4 shadow-2xl rotate-3 z-10 rounded-xl"
             >
               <div className="w-full h-full bg-gray-100 overflow-hidden relative">
                 <img src="/paintings/city.jpg" className="w-full h-full object-cover" />
                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold">COMMISSION #42</div>
               </div>
             </motion.div>
             <motion.div 
               className="absolute w-80 h-[450px] bg-white p-4 shadow-xl -rotate-6 z-0 opacity-60 rounded-xl translate-x-12 translate-y-12"
             >
               <img src="/paintings/forest.jpg" className="w-full h-full object-cover grayscale" />
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col">
      <HeroSection />

      {/* Features Grid */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <Palette className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">100% Handmade</h3>
              <p className="text-muted-foreground">Authentic oils and acrylics.</p>
           </div>
           <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <Truck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">Global Shipping</h3>
              <p className="text-muted-foreground">Insured and crated safely.</p>
           </div>
           <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <ShieldCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">Authenticity</h3>
              <p className="text-muted-foreground">Signed certificate included.</p>
           </div>
        </div>
      </section>

      {/* Featured Art */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif font-medium">Latest Works</h2>
            <Link to="/gallery" className="text-primary hover:underline underline-offset-4 flex items-center gap-2">
               View Gallery <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Insert the new Commission Section here */}
      <CommissionSection />

    </div>
  );
};

export default Home;