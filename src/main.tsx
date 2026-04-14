import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import './index.css';

import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { SWRConfig } from 'swr';
import { apiRequest } from './lib/api';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SWRConfig value={{ 
        fetcher: (url: string) => apiRequest(url),
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 3000
      }}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </SWRConfig>
    </BrowserRouter>
  </React.StrictMode>
);
