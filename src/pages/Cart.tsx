import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Cart = () => {
    // 1. Get the cart state from our context
    const { cartItems, addToCart, decreaseQuantity, removeFromCart } = useCart();

    // 2. Calculate the total price
    const totalPrice = cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    // 3. Handle the empty cart case
    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-6">
                    Looks like you haven't added any art to your cart yet.
                </p>
                <Button asChild>
                    <Link to="/gallery">Start Shopping</Link>
                </Button>
            </div>
        );
    }

    // 4. If the cart has items, display them
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            {/* Cart Items List */}
            <div className="flex flex-col gap-6">
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b pb-4"
                    >
                        {/* Image */}
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-24 h-24 rounded-md object-cover"
                        />
                        {/* Details (flex-grow) */}
                        <div className="flex-grow">
                            <h2 className="text-lg font-semibold">{item.title}</h2>
                            <p className="text-gray-600">
                                ${item.price.toFixed(2)} each
                            </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => decreaseQuantity(item.id)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-semibold w-10 text-center">
                                {item.quantity}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                // We re-use addToCart, which already increments quantity
                                onClick={() => addToCart(item)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Total Price for item */}
                        <div className="text-lg font-semibold w-24 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        {/* Remove Button */}
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                        </Button>
                    </div>
                ))}
            </div>

            {/* Cart Summary */}
            <div className="mt-8 flex justify-end">
                <div className="w-full max-w-sm">
                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    {/* 1. Wrap the Button in 'asChild' to use the Link */}
                    <Button size="lg" className="w-full" asChild>
                        <Link to="/checkout">Proceed to Checkout</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Cart;