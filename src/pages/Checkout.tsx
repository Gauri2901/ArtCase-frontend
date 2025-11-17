import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // This is Zod!
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
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

// 1. Define the 'schema' (the rules) for our form using Zod
// This says what fields we expect and what their requirements are.
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    address: z.string().min(10, {
        message: "Address must be at least 10 characters.",
    }),
    city: z.string().min(2, {
        message: "City must be at least 2 characters.",
    }),
});

// This is our new page component
const Checkout = () => {
    const { cartItems, clearCart } = useCart(); // We'll need clearCart
    const navigate = useNavigate()
    // 2. Set up react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), // Connect Zod to our form
        defaultValues: { // Set initial values
            name: "",
            email: "",
            address: "",
            city: "",
        },
    });

    // 3. This function runs *only* if validation passes
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Checkout successful!", {
            customer: values,
            items: cartItems,
        });
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/thank-you");
    }

    // Calculate total for the summary
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {/* We'll use a 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Column 1: Shipping Form */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Shipping Details</h2>
                    {/* 4. This is the shadcn <Form> component */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage /> {/* Shows validation errors */}
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Address Field */}
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Art St." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* City Field */}
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" size="lg" className="w-full">
                                Place Order
                            </Button>
                        </form>
                    </Form>
                </div>

                {/* Column 2: Order Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                                <span className="font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <hr className="my-6" />
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;    