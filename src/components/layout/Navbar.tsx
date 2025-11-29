import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { cartItems } = useCart();
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Handle scroll to adjust the "tightness" of the glass controller
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
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <header
                className={cn(
                    "pointer-events-auto relative w-full max-w-6xl rounded-full transition-all duration-500 ease-out border border-white/40 shadow-xl",
                    // Liquid Glass Styles: High blur, semi-transparent white background
                    "bg-white/60 dark:bg-black/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40",
                    isScrolled ? "py-2 px-6" : "py-4 px-8"
                )}
            >
                <div className="flex justify-between items-center">
                    
                    {/* Logo - Serif Font for Brand Identity */}
                    <Link to="/" className="relative z-50 group">
                        <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
                            Art-Case<span className="text-primary">.</span>
                        </h1>
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name}
                                to={link.path}
                                className="relative text-sm font-medium font-sans text-foreground/80 hover:text-foreground transition-colors group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-primary transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* Actions Area */}
                    <div className="flex items-center gap-4">
                        
                        {/* Authentication Actions (Desktop) */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                {user.isAdmin && (
                                    <Link to="/admin">
                                        <Button variant="ghost" size="sm" className="text-sm font-medium rounded-full hover:bg-white/20">
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 border-l border-foreground/10 pl-3">
                                    <span className="text-sm font-medium text-foreground">
                                        {user.name.split(' ')[0]}
                                    </span>
                                    <Button onClick={logout} variant="ghost" size="sm" className="hover:text-destructive rounded-full hover:bg-white/20">
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/20">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-5 shadow-md">Join</Button>
                                </Link>
                            </div>
                        )}

                        {/* Cart Button */}
                        <div className="relative">
                            <Button 
                                asChild 
                                variant="ghost" 
                                size="icon"
                                className="hover:bg-white/20 rounded-full relative transition-transform hover:scale-105 active:scale-95"
                            >
                                <Link to="/cart">
                                    <ShoppingCart className="h-5 w-5 text-foreground" />
                                    <span className="sr-only">View Cart</span>
                                </Link>
                            </Button>

                            {/* Animated Badge */}
                            <AnimatePresence>
                                {totalItems > 0 && (
                                    <motion.div
                                        key={totalItems} 
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
                            className="md:hidden rounded-full hover:bg-white/20"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Overlay - Drops down from the pill */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="pt-6 pb-2 flex flex-col gap-4 border-t border-foreground/10 mt-4">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.name}
                                        to={link.path}
                                        className="text-lg font-serif font-semibold px-2 py-1 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {/* Mobile Authentication Links */}
                                <div className="pt-2 flex flex-col gap-3">
                                    {user ? (
                                        <>
                                            <div className="text-sm text-muted-foreground px-2">
                                                Signed in as <span className="font-bold text-foreground">{user.name}</span>
                                            </div>
                                            {user.isAdmin && (
                                                <Link to="/admin">
                                                    <Button variant="outline" className="w-full justify-start rounded-xl border-foreground/20 bg-transparent">
                                                        Admin Dashboard
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button onClick={logout} variant="destructive" className="w-full rounded-xl">
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button asChild variant="outline" className="rounded-xl border-foreground/20 bg-transparent">
                                                <Link to="/login">Login</Link>
                                            </Button>
                                            <Button asChild className="rounded-xl shadow-lg">
                                                <Link to="/register">Join</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </div>
    );
};

export default Navbar;