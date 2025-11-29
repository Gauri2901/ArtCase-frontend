import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import './index.css';

import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';  // ← YOU MISSED THIS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>     {/* ← Wrap AuthProvider FIRST */}
        <CartProvider>   {/* ← Then wrap CartProvider */}
          <App />        {/* ← Now Navbar can useAuth() safely */}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
