"use client";

import { motion } from "framer-motion";
import { Card } from "./ui";

export const MotionCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={{
        initial: { x: 200, opacity: 0 },
        inView: { x: 0, opacity: 1 },
      }}
      initial="initial"
      whileInView="inView"
      layout
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3 }}
      // viewport={{ once: true, amount: window.innerWidth < 768 ? 0.2 : 0.5 }}
    >
      <Card className="px-5 py-2 lg:px-2 md:hover:scale-102 shadow-md md:hover:shadow-lg transition-transform duration-150 border-0">
        {children}
      </Card>
    </motion.div>
  );
};
