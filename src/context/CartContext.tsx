import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { toast } from 'sonner';
// 1. Define the shape of a single item in our cart
interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number; // We'll need quantity
}
// 2. Define the shape of the 'bulletin board' (our Context)
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void; 
}

// 3. Create the Context.
const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'artcase_cart_items';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      // Try to get the saved cart from localStorage
      const savedCart = localStorage.getItem(STORAGE_KEY);
      // If we found a cart, parse the JSON string back into an array
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      // If anything goes wrong (e.g., corrupt data), start with an empty cart
      return [];
    }
  });
  useEffect(() => {
    // We save the 'cartItems' array into localStorage.
    // We must turn it into a JSON string, because localStorage
    // can only store strings.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);
  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    // 2. Add a variable to track if the item was new
    let itemWasAdded = false;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 3. If it's a new item, set our tracker
        itemWasAdded = true;
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });

    // 4. After the state update, show the toast
    // We check 'itemWasAdded' to customize the message
    if (itemWasAdded) {
      toast.success(`${itemToAdd.title} added to cart!`);
    } else {
      toast.info(`Increased ${itemToAdd.title} quantity`);
    }
  };

  // 2. Add the 'decreaseQuantity' function
  const decreaseQuantity = (id: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === id);

      // If item quantity is 1, remove it
      if (existingItem && existingItem.quantity === 1) {
        return prevItems.filter(item => item.id !== id);
      } else {
        // Otherwise, just decrease quantity by 1
        return prevItems.map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  // 3. Add the 'removeFromCart' function
  const removeFromCart = (id: string) => {
    setCartItems(prevItems => {
      // Filter out the item with the matching id
      return prevItems.filter(item => item.id !== id);
    });
  };

  const clearCart = () => {
    setCartItems([]); // Just set the cart to an empty array
    toast.info("Cart cleared");
  };

  // 4. Provide the new functions in the 'value'
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 6. Create a 'custom hook' - This is the BEST PRACTICE
// This hook makes it easy for components to use our context
// without having to import 'useContext' and 'CartContext' every time.
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};