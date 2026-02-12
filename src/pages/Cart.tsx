import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Cart = () => {
    const { cartItems, addToCart, decreaseQuantity, removeFromCart } = useCart();

    const totalPrice = cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);


    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-secondary/30 p-8 rounded-full mb-6"
                >
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                </motion.div>
                <h1 className="text-3xl font-serif font-medium mb-4">Your Collection is Empty</h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                    The walls are looking a bit bare. Explore our gallery to find a piece that speaks to you.
                </p>
                <Button asChild size="lg" className="rounded-full px-8">
                    <Link to="/gallery">Start Curating</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 relative">
             {/* Ambient Background Blob */}
             <div className="fixed top-1/3 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-serif font-medium mb-12">Your Selection</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                    
                    {/* Cart Items List */}
                    <motion.div 
                        className="lg:col-span-2 space-y-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    variants={itemVariants}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                                    className="group flex gap-6 items-start pb-8 border-b border-border/40"
                                >
                                    {/* Image */}
                                    <Link to={`/product/${item.id}`} className="shrink-0 block w-24 h-32 md:w-32 md:h-40 overflow-hidden rounded-xl bg-secondary">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-grow flex flex-col justify-between h-32 md:h-40 py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <Link to={`/product/${item.id}`}>
                                                    <h3 className="text-xl font-serif font-medium hover:text-primary/70 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                </Link>
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                >
                                                    <X className="h-5 w-5" />
                                                    <span className="sr-only">Remove</span>
                                                </button>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-sans">Oil on Canvas</p>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-border rounded-full px-3 py-1">
                                                <button 
                                                    onClick={() => decreaseQuantity(item.id)}
                                                    className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-medium w-4 text-center tabular-nums">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="p-1 hover:text-primary transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <p className="text-lg font-medium">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Summary Panel - Sticky & Glass */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="sticky top-32 p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 shadow-sm"
                        >
                            <h2 className="text-2xl font-serif font-medium mb-6">Summary</h2>
                            
                            <div className="space-y-4 mb-8 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping (Insured)</span>
                                    <span className="text-foreground font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Taxes</span>
                                    <span>Calculated at next step</span>
                                </div>
                                <div className="h-px bg-border/50 my-4" />
                                <div className="flex justify-between text-lg font-medium">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button size="lg" className="w-full rounded-full h-12 text-base group" asChild>
                                <Link to="/checkout">
                                    Checkout <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-6 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Secure SSL Encryption
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;