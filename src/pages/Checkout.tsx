import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Lock, CreditCard, MapPin, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

// Schema Validation
const formSchema = z.object({
    name: z.string().min(2, { message: "Name is required." }),
    email: z.string().email({ message: "Invalid email address." }),
    address: z.string().min(5, { message: "Address is required." }),
    city: z.string().min(2, { message: "City is required." }),
    zip: z.string().min(4, { message: "Zip code is required." }),
    cardNumber: z.string().min(10, { message: "Card number required (mock)." }),
});

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            address: "",
            city: "",
            zip: "",
            cardNumber: "",
        },
    });

    // Mock Order Processing
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsProcessing(true);
        
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Order placed:", { customer: values, items: cartItems });
        toast.success("Payment successful! Your collection is on its way.");
        clearCart();
        setIsProcessing(false);
        navigate("/thank-you");
    }

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        navigate("/gallery");
        return null;
    }

    return (
        <div className="min-h-screen bg-background pt-28 pb-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4">
                
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    
                    {/* LEFT COLUMN: Input Forms */}
                    <motion.div 
                        className="lg:col-span-7"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-10">
                            <h1 className="text-4xl font-serif font-medium mb-2">Secure Checkout</h1>
                            <p className="text-muted-foreground">Complete your purchase to secure your artwork.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                
                                {/* Section 1: Shipping */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-serif">Shipping Details</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="" {...field} className="bg-white/50 dark:bg-black/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="artcase@gmail.com" {...field} className="bg-white/50 dark:bg-black/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Starry Night Lane" {...field} className="bg-white/50 dark:bg-black/20" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Pune" {...field} className="bg-white/50 dark:bg-black/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="zip"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Zip Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="10001" {...field} className="bg-white/50 dark:bg-black/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Payment (Mock) */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-serif">Payment Method</h2>
                                    </div>

                                    <div className="bg-secondary/30 p-4 rounded-lg border border-border flex items-center gap-3 mb-4">
                                        <Lock className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-muted-foreground">
                                            Transactions are encrypted and secured. We do not store your full card details.
                                        </p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="cardNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Card Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="0000 0000 0000 0000" {...field} className="bg-white/50 dark:bg-black/20 font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="w-full rounded-full h-12 text-lg mt-8"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        `Pay $${totalPrice.toFixed(2)}`
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </motion.div>

                    {/* RIGHT COLUMN: Summary Panel */}
                    <motion.div 
                        className="lg:col-span-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="sticky top-32 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-2xl font-serif font-medium mb-6">Order Summary</h3>
                            
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                                            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-medium font-serif">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-border my-6" />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="text-foreground font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-medium pt-2">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 bg-primary/5 rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Buyer Protection</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Your purchase is backed by our gallery guarantee. Authentic art, safe delivery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;