import { Link } from "react-router-dom";
import {  ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background pt-24 pb-12 relative overflow-hidden">
      {/* Watermark Background Logo */}
      {/* Watermark Background Logo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
        <span className="text-[20vw] font-serif font-bold leading-none whitespace-nowrap select-none">
          ART-CASE
        </span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-24">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-3xl font-serif font-medium">
              Join the collector's list.
            </h2>
            <p className="text-background/60 max-w-md">
              Get early access to new drops, exhibition invites, and studio insights. 
              No spam, just art.
            </p>
            <div className="flex gap-2 border-b border-background/20 pb-2 max-w-md">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-transparent flex-grow outline-none placeholder:text-background/30"
              />
              <Button variant="ghost" className="hover:bg-background/10 hover:text-background rounded-full">
                Join
              </Button>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-6 text-background/40 uppercase tracking-widest text-xs">Explore</h3>
              <ul className="space-y-4">
                <li><Link to="/" className="hover:text-primary/80 transition-colors">Home</Link></li>
                <li><Link to="/gallery" className="hover:text-primary/80 transition-colors">Gallery</Link></li>
                <li><Link to="/about" className="hover:text-primary/80 transition-colors">About</Link></li>
                <li><Link to="/commissions" className="hover:text-primary/80 transition-colors">Commissions</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-background/40 uppercase tracking-widest text-xs">Support</h3>
              <ul className="space-y-4">
                <li><Link to="/faq" className="hover:text-primary/80 transition-colors">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-primary/80 transition-colors">Shipping & Returns</Link></li>
                <li><Link to="/care" className="hover:text-primary/80 transition-colors">Art Care Guide</Link></li>
                <li><Link to="/contact" className="hover:text-primary/80 transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-background/40 uppercase tracking-widest text-xs">Social</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-primary/80 transition-colors">
                    Instagram <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-primary/80 transition-colors">
                    Twitter <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 hover:text-primary/80 transition-colors">
                    Pinterest <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/40">
          <p>&copy; 2025 Art-Case. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;