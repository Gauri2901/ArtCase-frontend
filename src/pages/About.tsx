import { motion } from 'framer-motion';
import { ArrowRight, Brush, Palette, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  // Animation variants for staggered reveals
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 1. Ambient Background Blobs (Same as Gallery) */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 pt-32 pb-20">
        
        {/* 2. Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <motion.span variants={itemVariants} className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-6 block">
            Est. 2024
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-serif font-medium mb-8 text-foreground leading-tight">
            We believe art should <br />
            <span className="italic text-muted-foreground">speak to the soul.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            Art-Case isn't just a gallery; it's a curated dialogue between the artist's vision and your personal space. We bring the raw emotion of the studio directly to your walls.
          </motion.p>
        </motion.div>

        {/* 3. The Story Section (Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            
            {/* Image Side with "Glass" Card Effect */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                    <img 
                        src="/paintings/forest.jpg" 
                        alt="Artist in Studio" 
                        className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2s]" 
                    />
                    {/* Artistic Overlay */}
                    <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                    <p className="font-serif italic text-lg mb-2">"Creativity takes courage."</p>
                    <p className="text-xs uppercase tracking-widest text-primary">— Henri Matisse</p>
                </div>
            </motion.div>

            {/* Text Side */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
                <h2 className="text-4xl font-serif font-medium">The Journey</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                        It started with a single canvas and a chaotic burst of color. What began as a personal escape quickly transformed into a passion for connecting people through visual storytelling.
                    </p>
                    <p>
                        At Art-Case, we reject the mass-produced. Every piece listed on our platform is original, hand-painted, and inspected for authenticity. We work with a select group of emerging artists who are redefining modern impressionism and abstract expressionism.
                    </p>
                    <p>
                        Our mission is simple: to make owning original art accessible, transparent, and deeply personal.
                    </p>
                </div>
                
                <div className="pt-4">
                    <Button variant="outline" className="rounded-full px-8 h-12 border-foreground/20 hover:bg-foreground hover:text-background transition-all">
                        Meet the Artists
                    </Button>
                </div>
            </motion.div>
        </div>

        {/* 4. Core Values (Grid Layout) */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-32"
        >
            <div className="text-center mb-16">
                <h2 className="text-3xl font-serif font-medium mb-4">Our Philosophy</h2>
                <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Palette, title: "Pure Expression", desc: "We prioritize raw emotion over technical perfection. Every stroke must mean something." },
                    { icon: Heart, title: "Ethically Curated", desc: "We ensure fair compensation for every artist and sustainable practices in our studio." },
                    { icon: Award, title: "Timeless Quality", desc: "Using only archival-grade paints and canvases that preserve their vibrance for decades." }
                ].map((item, index) => (
                    <motion.div 
                        key={index}
                        whileHover={{ y: -10 }}
                        className="p-8 bg-white/40 dark:bg-white/5 border border-white/20 rounded-3xl backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* 5. Call to Action (Atmospheric) */}
        <div className="relative rounded-[3rem] overflow-hidden h-[400px] flex items-center justify-center text-center px-4">
            {/* Background Image with Blur */}
            <div className="absolute inset-0">
                <img src="/paintings/ocean.jpg" alt="Ocean Texture" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 max-w-2xl"
            >
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                    Find the piece that speaks to you.
                </h2>
                <p className="text-white/80 text-lg mb-8 font-light">
                    Your collection starts with a single click.
                </p>
                <Button asChild size="lg" className="rounded-full h-14 px-10 bg-white text-black hover:bg-white/90 text-lg">
                    <Link to="/gallery">
                        Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </Button>
            </motion.div>
        </div>

      </div>
    </div>
  );
};

export default About;