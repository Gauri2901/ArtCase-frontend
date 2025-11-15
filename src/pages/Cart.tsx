import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Cart = () => {
  // 1. Get the cart state from our context
  const { cartItems } = useCart();

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
            className="flex items-center gap-4 border-b pb-4"
          >
            {/* Image */}
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-24 h-24 rounded-md object-cover"
            />
            {/* Details */}
            <div className="flex-grow">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-gray-600">
                Quantity: {item.quantity}
              </p>
            </div>
            {/* Price */}
            <div className="text-lg font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            {/* We'll add a 'Remove' button here next */}
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
          <Button size="lg" className="w-full">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;