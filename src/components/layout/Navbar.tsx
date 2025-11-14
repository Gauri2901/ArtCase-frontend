// 1. Import the icon
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  // ... other navigation imports
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo Section */}
        <div className="font-bold text-xl text-primary">
          <Link to="/">Art-Case</Link>
        </div>

        {/* Navigation Section */}
        <NavigationMenu>
          {/* ... your navigation list ... */}
        </NavigationMenu>

        {/* Cart/Actions Section - UPDATED */}
        <div>
          {/*
            'variant="ghost"' gives us a button with no background,
            which is perfect for a navbar icon.
            'size="icon"' makes it a small, square button.
          */}
          <Button asChild variant="ghost" size="icon">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {/*
                'sr-only' = "Screen Reader Only". This text is
                hidden visually, but screen readers will announce it.
                This is CRITICAL for accessibility!
              */}
              <span className="sr-only">View Shopping Cart</span>
            </Link>
          </Button>

          {/* We can add the (0) back next to the button if we want */}
          {/* <span className="ml-2 text-sm font-medium">(0)</span> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;