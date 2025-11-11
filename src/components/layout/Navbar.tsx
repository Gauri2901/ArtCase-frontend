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
                    <Button asChild variant="outline">
                        <Link to="/cart">
                            Cart (0)
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;