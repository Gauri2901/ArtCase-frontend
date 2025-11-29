import { Outlet, useLocation } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from '@/components/ui/sonner';
import CustomCursor from '@/components/ui/CustomCursor';
import { useEffect } from 'react';
import FloatingShapes from './FloatingShapes';

const Layout = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <div className="min-h-screen flex flex-col bg-noise relative">
        <CustomCursor />
        
        {/* Add Floating Shapes here - clearly visible but behind content */}
        <FloatingShapes />

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