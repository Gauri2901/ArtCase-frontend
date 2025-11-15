// 1. Import Link from react-router-dom
import { Link } from 'react-router-dom';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
    const { cartItems } = useCart();
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="border-b">
            <div className="container mx-auto px-4 flex justify-between items-center h-16">
                {/* Logo Section */}
                <div className="font-bold text-xl text-primary">
                    <Link to="/">Art-Case</Link>
                </div>

                {/* Navigation Section (using shadcn) */}
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <Link to="/gallery">Gallery</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                <Link to="/about">About</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Cart/Actions Section */}
                <div className="relative"> {/* 4. Add 'relative' for badge positioning */}
                    <Button asChild variant="ghost" size="icon">
                        <Link to="/cart">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="sr-only">View Shopping Cart</span>
                        </Link>
                    </Button>

                    {/* 5. This is our 'Badge' for the cart count */}
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground 
                             rounded-full h-5 w-5 flex items-center justify-center 
                             text-xs font-bold">
                            {totalItems}
                        </span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;