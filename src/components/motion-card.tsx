"use client";

import { motion } from "framer-motion";
import { Card } from "./ui";

export const MotionCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={{
        initial: { x: 30, opacity: 0 },
        inView: { x: 0, opacity: 1 },
      }}
      initial="initial"
      whileInView="inView"
      layout
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative px-5 py-6 sm:px-6 sm:py-7 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/3 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
      </Card>
    </motion.div>
  );
};
