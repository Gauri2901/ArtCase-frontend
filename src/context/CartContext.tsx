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
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  decreaseQuantity: (id: string) => void; // New
  removeFromCart: (id: string) => void;   // New
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
    // ... (this function is the same as before) ...
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
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

  // 4. Provide the new functions in the 'value'
  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        decreaseQuantity, 
        removeFromCart 
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