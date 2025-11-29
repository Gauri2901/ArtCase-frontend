import { motion } from "framer-motion";
import { Paintbrush, Palette, Frame, Shapes, PenTool } from "lucide-react";

const FloatingIcon = ({ Icon, delay, x, y, duration }: any) => (
  <motion.div
    className="absolute text-foreground/5 dark:text-foreground/10 pointer-events-none z-0"
    initial={{ x, y, opacity: 0 }}
    animate={{ 
      y: [y, y - 40, y], 
      rotate: [0, 10, -10, 0],
      opacity: 1
    }}
    transition={{ 
      duration: duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
  >
    <Icon className="w-12 h-12 md:w-24 md:h-24" />
  </motion.div>
);

const FloatingShapes = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Top Left - Palette */}
        <FloatingIcon Icon={Palette} x="10vw" y="20vh" delay={0} duration={6} />
        
        {/* Bottom Right - Brush */}
        <FloatingIcon Icon={Paintbrush} x="85vw" y="70vh" delay={1} duration={7} />
        
        {/* Middle Right - Frame */}
        <FloatingIcon Icon={Frame} x="90vw" y="30vh" delay={2} duration={8} />
        
        {/* Bottom Left - Shapes */}
        <FloatingIcon Icon={Shapes} x="5vw" y="80vh" delay={0.5} duration={9} />
        
        {/* Top Right - Pen */}
        <FloatingIcon Icon={PenTool} x="70vw" y="10vh" delay={1.5} duration={6.5} />
    </div>
  );
};

export default FloatingShapes;