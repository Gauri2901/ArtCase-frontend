import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/useAuth';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/admin/NotificationBell';
import UserNotificationBell from '@/components/UserNotificationBell';

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
        { name: 'Customized Art', path: '/commissions' },
        { name: 'About', path: '/about' },
        ...(user?.isAdmin ? [{ name: 'Dashboard', path: '/admin' }] : []),
    ];

    const isActiveLink = (path: string) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        // Outer wrapper: full-width fixed strip, pointer-events off so content beneath is clickable
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 sm:pt-4 px-3 sm:px-4 pointer-events-none">
            <header
                className={cn(
                    // pointer-events back on; pill fills available width up to max-w
                    'pointer-events-auto relative w-full max-w-6xl rounded-full',
                    'transition-all duration-500 ease-out',
                    'border border-white/40 shadow-xl',
                    'bg-white/60 dark:bg-black/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40',
                    // Fluid padding: tighter on mobile, relaxes on larger screens
                    isScrolled
                        ? 'py-1.5 px-3 sm:py-2 sm:px-6'
                        : 'py-2.5 px-4 sm:py-4 sm:px-8'
                )}
            >
                <div className="flex items-center justify-between gap-2 min-w-0">

                    {/* ── Logo ─────────────────────────────────────── */}
                    <Link to="/" className="relative z-50 group shrink-0">
                        <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-foreground whitespace-nowrap">
                            Art-Case<span className="text-primary">.</span>
                        </h1>
                    </Link>

                    {/* ── Desktop Nav Links ─────────────────────────── */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={cn(
                                    'relative text-sm font-medium font-sans transition-colors group whitespace-nowrap',
                                    isActiveLink(link.path)
                                        ? 'text-foreground'
                                        : 'text-foreground/80 hover:text-foreground'
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

                    {/* ── Right-side Actions ───────────────────────── */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">

                        {/* Profile avatar (all sizes) OR login buttons (desktop only) */}
                        {user ? (
                            <div ref={profileRef} className="relative">
                                {user.isAdmin ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full border border-gray-600 bg-white/20 text-sm font-semibold text-foreground backdrop-blur-xl hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9"
                                        onClick={() => {
                                            setIsProfileOpen((prev) => !prev);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <span>{userInitial}</span>
                                        <span className="sr-only">Open profile menu</span>
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full border border-gray-600 bg-white/20 text-sm font-semibold text-foreground backdrop-blur-xl hover:bg-white/30 h-8 w-8 sm:h-9 sm:w-9"
                                    >
                                        <Link to="/profile">
                                            <span>{userInitial}</span>
                                            <span className="sr-only">Open profile page</span>
                                        </Link>
                                    </Button>
                                )}

                                <AnimatePresence>
                                    {user.isAdmin && isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            // On mobile: center below the button. On sm+: anchor to right edge.
                                            className={cn(
                                                "absolute z-50 overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-4 shadow-2xl backdrop-blur-2xl",
                                                "top-14 sm:top-14 right-0 sm:right-0",
                                                "w-[calc(100vw-2rem)] max-w-xs",
                                                "max-sm:fixed max-sm:inset-x-4 max-sm:mx-auto max-sm:top-24 max-sm:w-auto"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-base font-semibold">
                                                    {userInitial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Signed in as</p>
                                                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                                                </div>
                                            </div>
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
                            // Login / Join — desktop only
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/20">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-4 lg:px-5 shadow-md">
                                        Join
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {user?.isAdmin ? <NotificationBell /> : <UserNotificationBell />}

                        {/* Cart Icon */}
                        {/* Use `relative` + fixed size so the badge never bleeds outside */}
                        <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="hover:bg-white/20 rounded-full w-full h-full transition-transform hover:scale-105 active:scale-95"
                            >
                                <Link to="/cart">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
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
                                        // Positioned relative to the fixed-size wrapper — always visible
                                        className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold rounded-full pointer-events-none border-2 border-white dark:border-black"
                                    >
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Hamburger */}
                        <div ref={mobileMenuRef} className="relative md:hidden shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                                onClick={() => {
                                    setIsMobileMenuOpen((prev) => !prev);
                                    setIsProfileOpen(false);
                                }}
                            >
                                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="sr-only">Open navigation menu</span>
                            </Button>

                            <AnimatePresence>
                                {isMobileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        // Width: at least 10rem, at most viewport minus 2rem padding
                                        className="absolute right-0 top-12 sm:top-14 w-[min(12rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-2 shadow-2xl backdrop-blur-2xl z-50"
                                    >
                                        <div className="flex flex-col gap-1">
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.name}
                                                    to={link.path}
                                                    className={cn(
                                                        'rounded-2xl px-3 py-2 text-sm font-serif font-semibold transition-colors hover:bg-black/5 text-center flex justify-center',
                                                        isActiveLink(link.path)
                                                            ? 'text-foreground underline decoration-black underline-offset-4'
                                                            : 'text-foreground'
                                                    )}
                                                >
                                                    {link.name}
                                                </Link>
                                            ))}

                                            {/* Login / Join for guests — inside mobile menu */}
                                            {!user && (
                                                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-3">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        className="rounded-xl border-foreground/20 bg-transparent text-xs sm:text-sm"
                                                    >
                                                        <Link to="/login">Login</Link>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        className="rounded-xl shadow-lg text-xs sm:text-sm"
                                                    >
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
