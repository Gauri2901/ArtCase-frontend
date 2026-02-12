import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Palette, ShieldCheck, Truck, Brush, Play, Sparkles, Paintbrush, Frame, Shapes, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

// --- NEW HELPER COMPONENTS (Inline for easy setup) ---

// 1. Marquee Component (For infinite scrolling text/images)
const Marquee = ({ children, direction = "left", speed = 20, className }: { children: React.ReactNode, direction?: "left" | "right", speed?: number, className?: string }) => {
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)}>
      <motion.div
        className="flex min-w-full gap-8 py-4"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {/* Repeat children 4 times to ensure seamless looping on large screens */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center shrink-0">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// 2. Floating Shapes Component (Background artifacts)
const FloatingIcon = ({ Icon, delay, x, y, duration }: any) => (
  <motion.div
    className="absolute text-foreground/5 dark:text-foreground/10 pointer-events-none z-0"
    initial={{ x, y, opacity: 0 }}
    animate={{
      y: [y, y - 40, y],
      rotate: [0, 10, -10, 0],
      opacity: 1
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }}
  >
    <Icon className="w-12 h-12 md:w-24 md:h-24" />
  </motion.div>
);

const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 h-full w-full">
    <FloatingIcon Icon={Palette} x="10vw" y={200} delay={0} duration={6} />
    <FloatingIcon Icon={Paintbrush} x="85vw" y={600} delay={1} duration={7} />
    <FloatingIcon Icon={Frame} x="90vw" y={300} delay={2} duration={8} />
    <FloatingIcon Icon={Shapes} x="5vw" y={800} delay={0.5} duration={9} />
    <FloatingIcon Icon={PenTool} x="70vw" y={150} delay={1.5} duration={6.5} />
  </div>
);

// 3. Moving Gallery Section (The "Shoparl" style strip)
const MovingGallery = () => {
  const images = [
    "/paintings/ocean.jpg",
    "/paintings/city.jpg",
    "/paintings/forest.jpg",
    "/paintings/sunset.jpg",
  ];

  return (
    <section className="py-20 overflow-hidden bg-background relative border-y border-border/50">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-serif italic text-muted-foreground/50">Studio Life</h2>
      </div>

      {/* Top Row - Moving Left */}
      <Marquee speed={40} className="mb-8" direction="left">
        {images.map((src, i) => (
          <div key={i} className="w-[250px] h-[180px] md:w-[300px] md:h-[220px] rounded-2xl overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105 cursor-pointer">
            <img src={src} className="w-full h-full object-cover" alt="Gallery item" />
          </div>
        ))}
      </Marquee>

      {/* Bottom Row - Moving Right */}
      <Marquee speed={35} direction="right">
        {images.reverse().map((src, i) => (
          <div key={i} className="w-[300px] h-[200px] md:w-[400px] md:h-[280px] rounded-2xl overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105 cursor-pointer">
            <img src={src} className="w-full h-full object-cover" alt="Gallery item" />
          </div>
        ))}
      </Marquee>
    </section>
  );
};

// --- EXISTING COMPONENTS (Untouched logic, minor layout tweaks) ---

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
      {/* Add Floating Shapes to Hero */}
      <FloatingShapes />

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

const PhilosophySection = () => {
  return (
    <section className="py-32 bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="absolute -top-10 -left-10 text-[10rem] font-serif text-background/10 leading-none select-none">"</div>
          <h2 className="text-4xl md:text-6xl font-serif leading-tight relative z-10">
            Art is not just what you see, but what you make others feel.
          </h2>
          <div className="h-1 w-24 bg-primary mt-8 mb-8" />
          <p className="text-lg text-background/70 leading-relaxed font-light">
            Every piece in this collection starts with a chaotic burst of emotion and ends with a deliberate stroke of silence.
            I believe in the power of texture to disrupt the digital flatness of our lives.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center">
              <Brush className="w-8 h-8 text-background/50" />
            </div>
            <div>
              <p className="font-serif font-bold text-xl">The Artist</p>
              <p className="text-sm text-primary">Founder & Creator</p>
            </div>
          </div>
        </div>

        <div className="relative h-[600px] w-full bg-neutral-800 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors z-20">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/50 transition-transform group-hover:scale-110">
              <Play className="w-8 h-8 fill-white text-white ml-1" />
            </div>
          </div>
          <img src="/paintings/forest.jpg" alt="In the Studio" className="h-full w-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-700" />
          <p className="absolute bottom-8 left-8 font-mono text-xs uppercase tracking-widest text-white/80 z-20">Watch the Process • 01:24</p>
        </div>
      </div>
    </section>
  )
}

const LookbookSection = () => {
  return (
    <section className="py-0 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh]">
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-gray-200">
            <img src="/paintings/ocean.jpg" className="w-full h-full object-cover opacity-50 blur-sm scale-110" />
          </div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="text-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="text-3xl font-serif text-white mb-2">Sanctuary</h3>
              <p className="text-white/80 mb-6">Curated for calm spaces.</p>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black bg-transparent">Shop the Look</Button>
            </div>
          </div>
        </div>
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-stone-300">
            <img src="/paintings/city.jpg" className="w-full h-full object-cover opacity-50 blur-sm scale-110" />
          </div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="text-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h3 className="text-3xl font-serif text-white mb-2">Statement</h3>
              <p className="text-white/80 mb-6">Bold pieces for bold minds.</p>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black bg-transparent">Shop the Look</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl px-8 py-6 rounded-full shadow-2xl z-10 text-center">
        <span className="font-serif italic text-2xl text-foreground">View in Room</span>
      </div>
    </section>
  )
}

const CommissionSection = () => {
  return (
    <section id="commissions" className="py-32 relative overflow-hidden bg-background">
      <div className="absolute right-0 bottom-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs mb-6">
              <Brush className="w-4 h-4" /> Custom Orders
            </div>
            <h2 className="text-5xl font-serif font-medium mb-6">Your Vision. <br /> Our Hands.</h2>
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
                  <span className="text-4xl font-serif text-primary/20 font-bold group-hover:text-primary transition-colors">0{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-serif font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-primary/10 p-2 rounded-full flex max-w-md shadow-sm">
              <input
                type="email"
                placeholder="Enter email for quote..."
                className="bg-transparent flex-grow px-6 outline-none placeholder:text-muted-foreground/70"
              />
              <Button className="rounded-full px-8">Request</Button>
            </div>
          </div>

          <div className="relative h-[600px] flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="absolute w-80 h-[450px] bg-white p-4 shadow-2xl rotate-3 z-10 rounded-xl border border-gray-100"
            >
              <div className="w-full h-full bg-gray-100 overflow-hidden relative">
                <img src="/paintings/city.jpg" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold shadow-sm">COMMISSION #42</div>
              </div>
            </motion.div>
            <motion.div
              className="absolute w-80 h-[450px] bg-white p-4 shadow-xl -rotate-6 z-0 opacity-60 rounded-xl translate-x-12 translate-y-12 border border-gray-100"
            >
              <img src="/paintings/forest.jpg" className="w-full h-full object-cover grayscale" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- MAIN HOME COMPONENT ---

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('https://art-case-backend.vercel.app/api/products?featured=true');
        const data = await res.json();
        setFeaturedProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-0 relative">

      {/* 1. TOP MARQUEE (Sale Section) */}
      <div className="bg-primary py-3 relative z-40 overflow-hidden">
        <Marquee speed={30} className="text-primary-foreground font-medium text-sm uppercase tracking-widest">
          <span className="flex items-center gap-4 mx-4"><Sparkles className="w-4 h-4" /> New Collection Drop: "Midnight Bloom"</span>
          <span className="flex items-center gap-4 mx-4">★ Free Shipping on Orders Over $200</span>
          <span className="flex items-center gap-4 mx-4">● Original Hand-Painted Art</span>
          <span className="flex items-center gap-4 mx-4">★ Spring Sale: 20% Off Commissions</span>
        </Marquee>
      </div>

      {/* 2. HERO */}
      <HeroSection />

      {/* 3. MOVING GALLERY (New "Shoparl" Style Section) */}
      <MovingGallery />

      {/* 4. FEATURES */}
      <section className="py-24 container mx-auto px-4 relative z-10">
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

      {/* 5. PHILOSOPHY */}
      <PhilosophySection />

      {/* 6. FEATURED COLLECTION */}
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
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* The updated ProductCard handles the price hiding/hover logic internally */}
                <ProductCard
                  id={product._id}
                  title={product.title}
                  imageUrl={product.imageUrl}
                  price={product.price}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LOOKBOOK */}
      <LookbookSection />

      {/* 8. COMMISSIONS */}
      <CommissionSection />

      {/* 9. CALL TO ACTION */}
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