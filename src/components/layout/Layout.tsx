import { Outlet, useLocation } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from '@/components/ui/sonner';
import CustomCursor from '@/components/ui/CustomCursor';
import { useEffect } from 'react';

const Layout = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    // 'root' prop tells Lenis to control the <html> scroll
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <div className="min-h-screen flex flex-col bg-noise">
        {/* The Custom Cursor */}
        <div className="hidden md:block">
           <CustomCursor />
        </div>

        {/* Navbar will be sticky/glass inside */}
        <Navbar />
        
        <main className="flex-grow relative z-10">
          <Outlet />
        </main>
        
        <Footer />
        <Toaster richColors theme="light" position="top-center" />
      </div>
    </ReactLenis>
  );
};

export default Layout;