import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { cartItems } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Gallery', path: '/gallery' },
        { name: 'About', path: '/about' },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                isScrolled 
                    ? "py-3 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-white/20 shadow-sm" 
                    : "py-6 bg-transparent border-b border-transparent"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                
                {/* Logo - Serif Font for Brand Identity */}
                <Link to="/" className="relative z-50 group">
                    <h1 className={cn(
                        "text-2xl font-serif font-bold tracking-tight transition-colors duration-300",
                        isScrolled ? "text-foreground" : "text-foreground"
                    )}>
                        Art-Case<span className="text-primary">.</span>
                    </h1>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name}
                            to={link.path}
                            className="relative text-sm font-medium font-sans text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-primary transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                {/* Actions Area */}
                <div className="flex items-center gap-2">
                    {/* Cart Button */}
                    <div className="relative">
                        <Button 
                            asChild 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-primary/10 rounded-full relative transition-transform hover:scale-105 active:scale-95"
                        >
                            <Link to="/cart">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="sr-only">View Cart</span>
                            </Link>
                        </Button>

                        {/* Animated Badge */}
                        <AnimatePresence>
                            {totalItems > 0 && (
                                <motion.div
                                    key={totalItems} // Key change triggers animation
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full pointer-events-none border-2 border-white dark:border-black"
                                >
                                    {totalItems}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden rounded-full"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-b overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name}
                                    to={link.path}
                                    className="text-lg font-serif font-medium py-2 border-b border-border/50"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;