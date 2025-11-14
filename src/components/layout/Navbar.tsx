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

const Navbar = () => {
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
                <div>
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;