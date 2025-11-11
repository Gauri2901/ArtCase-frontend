
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle, 
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo Section */}
        <div className="font-bold text-xl text-primary">
          <a href="/">Art-Case</a>
        </div>

        {/* Navigation Section */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <a href="/gallery" className={navigationMenuTriggerStyle()}>
                Gallery
              </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <a href="/about" className={navigationMenuTriggerStyle()}>
                About
              </a>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Cart/Actions Section */}
        <div>
          <Button variant="outline">
            Cart (0)
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;