import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Plus, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  className?: string;
};

const ProductCard = ({ id, title, imageUrl, price, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position for the "Lens Zoom" effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Map mouse position to image translation (pan effect)
  // Moving mouse right moves image left, etc.
  const translateLargeX = useTransform(springX, [0, 1], ["0%", "-20%"]);
  const translateLargeY = useTransform(springY, [0, 1], ["0%", "-20%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Calculate normalized position (0 to 1)
    const xPos = (e.clientX - rect.left) / rect.width;
    const yPos = (e.clientY - rect.top) / rect.height;
    x.set(xPos);
    y.set(yPos);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if clicking the button
    addToCart({ id, title, imageUrl, price });
  };

  return (
    <motion.div 
      ref={ref}
      className={cn("group relative flex flex-col bg-transparent", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Image Container */}
      <Link to={`/product/${id}`} className="block overflow-hidden rounded-[1.5rem] aspect-[4/5] relative mb-4 bg-gray-100 dark:bg-gray-900">
        {/* Main Image - Scales and Pans on Hover */}
        <motion.img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover will-change-transform"
          style={{
            scale: isHovered ? 1.25 : 1, // Zoom in
            x: isHovered ? translateLargeX : 0, // Pan X
            y: isHovered ? translateLargeY : 0, // Pan Y
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Overlay: Darken slightly on hover for text contrast */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

        {/* Quick Action Floating Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
           <Button 
             size="icon" 
             variant="secondary" 
             className="rounded-full h-10 w-10 shadow-lg bg-white/90 backdrop-blur text-primary hover:bg-white"
             onClick={(e) => { e.preventDefault(); /* Just let Link handle nav */ }}
           >
             <Eye className="h-4 w-4" />
             <span className="sr-only">View Details</span>
           </Button>
           <Button 
             size="icon" 
             className="rounded-full h-10 w-10 shadow-lg"
             onClick={handleAddToCart}
           >
             <Plus className="h-5 w-5" />
             <span className="sr-only">Add to Cart</span>
           </Button>
        </div>
      </Link>

      {/* Minimalist Info Section */}
      <div className="flex justify-between items-start px-1">
        <div className="flex flex-col gap-1">
          <Link to={`/product/${id}`}>
            <h3 className="text-xl font-serif font-medium leading-none text-foreground group-hover:text-primary/70 transition-colors">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground font-sans">
            Oil on Canvas
          </p>
        </div>
        <span className="text-lg font-medium font-sans tracking-tight">
          ${price.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
};

export default ProductCard;