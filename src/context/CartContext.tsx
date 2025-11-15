import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define the shape of a single item in our cart
// (We'll need the full product info to show in the cart later)
interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number; // We'll need quantity
}

// 2. Define the shape of the 'bulletin board' (our Context)
// What data and functions will it provide?
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  // We'll add removeFroCart, clearCart, etc. later
}

// 3. Create the Context.
// We give it a 'default value' of 'undefined' for now.
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Create the 'Provider' component
// This is the component that will hold the actual data (the 'state')
// and provide it to all its children.
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);

      if (existingItem) {
        // If it exists, just increase the quantity
        return prevItems.map(item =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If it's new, add it to the array with quantity 1
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
  };

  // 5. Provide the state and functions to all children
  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
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