import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
// 1. Import the Toaster
import { Toaster } from '@/components/ui/sonner'; // shadcn/ui re-exports it

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* 2. Add the Toaster here. 
          'richColors' gives us nice default styling for success/error.
      */}
      <Toaster richColors />
    </div>
  );
};

export default Layout;