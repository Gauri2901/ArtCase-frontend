import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
}

export const Marquee = ({ children, direction = "left", speed = 20, className }: MarqueeProps) => {
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)}>
      <motion.div
        className="flex min-w-full gap-8 py-4"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {/* We repeat children to ensure seamless looping */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center shrink-0">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
};