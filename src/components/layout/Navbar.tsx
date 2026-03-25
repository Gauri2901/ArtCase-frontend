import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { cartItems } = useCart();
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const userInitial = user?.name?.trim().charAt(0).toUpperCase() ?? '';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);

    useEffect(() => {
        if (!isProfileOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (profileRef.current && target && !profileRef.current.contains(target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isProfileOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (mobileMenuRef.current && target && !mobileMenuRef.current.contains(target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Gallery', path: '/gallery' },
        { name: 'About', path: '/about' },
        ...(user?.isAdmin ? [{ name: 'Dashboard', path: '/admin' }] : []),
    ];

    const isActiveLink = (path: string) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <header
                className={cn(
                    'pointer-events-auto relative w-full max-w-6xl rounded-full transition-all duration-500 ease-out border border-white/40 shadow-xl',
                    'bg-white/60 dark:bg-black/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40',
                    isScrolled ? 'py-2 px-6' : 'py-4 px-8'
                )}
            >
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="relative z-50 group">
                        <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
                            Art-Case<span className="text-primary">.</span>
                        </h1>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={cn(
                                    'relative text-sm font-medium font-sans transition-colors group',
                                    isActiveLink(link.path) ? 'text-foreground' : 'text-foreground/80 hover:text-foreground'
                                )}
                            >
                                {link.name}
                                <span
                                    className={cn(
                                        'absolute -bottom-1 left-1/2 h-px bg-black transition-all duration-300 -translate-x-1/2',
                                        isActiveLink(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                                    )}
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">

                        {/* Desktop: Auth Buttons or Profile Icon */}
                        {user ? (
                            // Profile Avatar — shared for both desktop and mobile
                            <div ref={profileRef} className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full border border-gray-600 bg-white/20 text-sm font-semibold text-foreground backdrop-blur-xl hover:bg-white/30"
                                    onClick={() => {
                                        setIsProfileOpen((prev) => !prev);
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <span>{userInitial}</span>
                                    <span className="sr-only">Open profile menu</span>
                                </Button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            className="absolute right-0 top-14 w-72 overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-4 shadow-2xl backdrop-blur-2xl z-50"
                                        >
                                            {/* User Info */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background text-base font-semibold">
                                                    {userInitial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Signed in as</p>
                                                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                                                </div>
                                            </div>

                                            {/* Logout */}
                                            <Button
                                                onClick={logout}
                                                variant="destructive"
                                                className="mt-4 w-full rounded-xl"
                                            >
                                                Logout
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // Login / Join buttons — desktop only
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/20">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-5 shadow-md">Join</Button>
                                </Link>
                            </div>
                        )}

                        {/* Cart Icon */}
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

                            <AnimatePresence>
                                {totalItems > 0 && (
                                    <motion.div
                                        key={totalItems}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full pointer-events-none border-2 border-white dark:border-black"
                                    >
                                        {totalItems}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Hamburger Menu */}
                        <div ref={mobileMenuRef} className="relative md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/20"
                                onClick={() => {
                                    setIsMobileMenuOpen((prev) => !prev);
                                    setIsProfileOpen(false);
                                }}
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open navigation menu</span>
                            </Button>

                            <AnimatePresence>
                                {isMobileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className="absolute right-0 top-14 w-44 overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-2 shadow-2xl backdrop-blur-2xl"
                                    >
                                        <div className="flex flex-col gap-1">
                                            {/* Nav Links including Dashboard if admin */}
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.name}
                                                    to={link.path}
                                                    className={cn(
                                                        'rounded-2xl px-3 py-2 text-sm font-serif font-semibold transition-colors hover:bg-black/5 text-center flex justify-center',
                                                        isActiveLink(link.path) ? 'text-foreground underline decoration-black underline-offset-4' : 'text-foreground'
                                                    )}
                                                >
                                                    {link.name}
                                                </Link>
                                            ))}

                                            {/* Login/Join for guests */}
                                            {!user && (
                                                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-3">
                                                    <Button asChild variant="outline" className="rounded-xl border-foreground/20 bg-transparent">
                                                        <Link to="/login">Login</Link>
                                                    </Button>
                                                    <Button asChild className="rounded-xl shadow-lg">
                                                        <Link to="/register">Join</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>
            </header>
        </div>
    );
};

export default Navbar;
