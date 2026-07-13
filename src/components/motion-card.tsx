"use client";

import { motion } from "motion/react";
import { Card } from "./ui";

export const MotionCard = ({
  children,
  animateEntry = true,
}: {
  children: React.ReactNode;
  animateEntry?: boolean;
}) => {
  return (
    <motion.div
      variants={
        animateEntry
          ? {
              initial: { y: 20, opacity: 0 },
              inView: { y: 0, opacity: 1 },
            }
          : undefined
      }
      initial={animateEntry ? "initial" : undefined}
      whileInView={animateEntry ? "inView" : undefined}
      layout
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative px-5 py-6 sm:px-6 sm:py-7 shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-accent/3 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
      </Card>
    </motion.div>
  );
};
