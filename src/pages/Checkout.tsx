import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { MapPin, ArrowLeft, Loader2, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

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
import { useAuth } from "@/context/useAuth";
import { apiRequest } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { UserAddress } from "@/types/user";

// Schema Validation
const formSchema = z.object({
    name: z.string().min(2, { message: "Name is required." }),
    email: z.string().email({ message: "Invalid email address." }),
    phone: z.string().min(10, { message: "Phone number is required." }),
    address: z.string().min(5, { message: "Address is required." }),
    city: z.string().min(2, { message: "City is required." }),
    zip: z.string().min(4, { message: "Zip code is required." }),
    state: z.string().min(2, { message: "State is required." }),
});

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Address Selection State
    const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: "",
            city: "",
            zip: "",
            state: "",
        },
    });

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.token) {
                return;
            }
            try {
                const addresses = await apiRequest<UserAddress[]>('/users/addresses', { token: user.token });
                setSavedAddresses(addresses);
                
                // Select default address if it exists
                const defaultAddr = addresses.find(a => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr._id);
                    fillFormWithAddress(defaultAddr);
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
            }
        };

        fetchAddresses();
    }, [user?.token]);

    const fillFormWithAddress = (addr: UserAddress) => {
        form.setValue('name', addr.name);
        form.setValue('phone', addr.phone);
        form.setValue('address', addr.addressLine);
        form.setValue('city', addr.city);
        form.setValue('zip', addr.zip);
        form.setValue('state', addr.state);
    };

    const handleSelectAddress = (addr: UserAddress) => {
        setSelectedAddressId(addr._id);
        fillFormWithAddress(addr);
    };

    const handleAddNewAddress = () => {
        setSelectedAddressId('new');
        form.reset({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: "",
            city: "",
            zip: "",
            state: "",
        });
    };

    // Load Razorpay Script
    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsProcessing(true);

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            setIsProcessing(false);
            return;
        }

        try {
            // Create Order
            const order = await apiRequest<{
                id: string;
                amount: number;
                currency: string;
            }>("/payment/create-order", {
                method: "POST",
                token: user?.token,
                body: JSON.stringify({
                    amount: totalPrice,
                    currency: "INR",
                }),
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable
                amount: order.amount,
                currency: order.currency,
                name: "Art Case",
                description: "Purchase Transaction",
                order_id: order.id,
                handler: async function (response: any) {
                    const data = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    };

                    try {
                        const verifyData = await apiRequest<{ message: string; order: { orderId: string } }>("/payment/verify-payment", {
                            method: "POST",
                            token: user?.token,
                            body: JSON.stringify({
                                ...data,
                                customer: {
                                    name: values.name,
                                    email: values.email,
                                    phone: values.phone,
                                    address: values.address,
                                    city: values.city,
                                    zip: values.zip,
                                    state: values.state,
                                },
                                artworks: cartItems.map((item) => ({
                                    artworkId: item.id,
                                    title: item.title,
                                    imageUrl: item.imageUrl,
                                    price: item.price,
                                    quantity: item.quantity,
                                    category: item.category || "Oil",
                                })),
                                amount: totalPrice,
                                currency: order.currency,
                                method: "Razorpay",
                                pricing: {
                                    subtotal: totalPrice,
                                    discount: 0,
                                    shipping: 0,
                                    total: totalPrice,
                                    currency: order.currency,
                                },
                            }),
                        });

                        toast.success("Payment successful!");
                        clearCart();
                        navigate("/thank-you", { state: { orderId: verifyData.order.orderId } });
                    } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Verification failed");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: values.name,
                    email: values.email,
                    contact: values.phone,
                },
                notes: {
                    address: values.address,
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response: any) {
                toast.error(response.error.description);
                setIsProcessing(false);
            });

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong with the payment initialization.");
            setIsProcessing(false);
        }
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

            <div className="mx-auto w-full max-w-6xl px-4 md:px-6">

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">

                    {/* LEFT COLUMN: Input Forms */}
                    <motion.div
                        className="lg:col-span-7"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-10">
                            <h1 className="mb-2 text-3xl font-serif font-medium tracking-tight sm:text-4xl lg:text-[2.8rem]">Secure Checkout</h1>
                            <p className="text-muted-foreground">Complete your purchase to secure your artwork.</p>
                        </div>

                        {/* Address Selection Step */}
                        {savedAddresses.length > 0 && (
                            <div className="mb-12 space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-serif">Select Delivery Address</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedAddresses.map((addr) => (
                                        <button
                                            key={addr._id}
                                            onClick={() => handleSelectAddress(addr)}
                                            className={`text-left p-5 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
                                                selectedAddressId === addr._id 
                                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                                                : 'border-border/40 bg-white/40 hover:border-primary/40'
                                            }`}
                                        >
                                            {selectedAddressId === addr._id && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                </div>
                                            )}
                                            <p className="font-bold mb-1">{addr.name}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{addr.addressLine}</p>
                                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.zip}</p>
                                            <p className="text-xs font-medium mt-3 uppercase tracking-widest text-primary/70">{addr.addressType}</p>
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleAddNewAddress}
                                        className={`text-left p-5 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 group ${
                                            selectedAddressId === 'new' 
                                            ? 'border-primary bg-primary/5 shadow-md' 
                                            : 'border-border/40 bg-white/40 hover:border-primary/40'
                                        }`}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-sm">Add New Address</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {(selectedAddressId === 'new' || savedAddresses.find(a => a._id === selectedAddressId)) && (
                                <motion.div
                                    key={selectedAddressId === 'new' ? 'new-form' : `edit-form-${selectedAddressId}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                            {/* Section 1: Shipping */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                                    <MapPin className="h-5 w-5 text-primary" />
                                                    <h2 className="text-xl font-serif">
                                                        {selectedAddressId === 'new' ? 'New Shipping Details' : 'Confirm Shipping Details'}
                                                    </h2>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
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
                                                                    <Input placeholder="artcase159@gmail.com" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="phone"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Phone Number</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="9876543210" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
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
                                                                <Input placeholder="123 Starry Night Lane" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="city"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>City</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Pune" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="state"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>State</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Maharashtra" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
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
                                                                    <Input placeholder="10001" {...field} className="bg-white/50 dark:bg-black/20 rounded-xl" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full rounded-full h-14 text-lg mt-8 shadow-xl shadow-primary/20 hover:shadow-2xl transition-all"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Processing Payment...
                                                    </>
                                                ) : (
                                                    `Pay ${formatPrice(totalPrice)}`
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* RIGHT COLUMN: Summary Panel */}
                    <motion.div
                        className="lg:col-span-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="sticky top-32 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl">
                            <h3 className="text-2xl font-serif font-medium mb-8">Order Summary</h3>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-5 items-center group">
                                        <div className="h-20 w-20 rounded-2xl overflow-hidden bg-secondary shrink-0 shadow-sm border border-white/40 group-hover:scale-105 transition-transform">
                                            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-medium font-serif text-lg leading-tight">{item.title}</h4>
                                            {item.dimensions && (
                                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{item.dimensions}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-border/40 my-8" />

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-muted-foreground text-base">
                                    <span>Subtotal</span>
                                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground text-base">
                                    <span>Shipping</span>
                                    <span className="text-primary font-bold">Free</span>
                                </div>
                                <div className="flex justify-between text-2xl font-serif font-bold pt-4 border-t border-border/20">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            <div className="mt-10 bg-primary/5 rounded-[2rem] p-6 flex items-start gap-4 border border-primary/10">
                                <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                                <div>
                                    <h4 className="font-bold text-base mb-1">Premium Protection</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Your acquisition is protected by our gallery authenticity certificate and secure logistics.
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
