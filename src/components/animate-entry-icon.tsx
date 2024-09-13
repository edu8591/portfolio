"use client";

import { motion } from "framer-motion";

export const AnimateEntryIcon = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: "easeIn" }}
    >
      {children}
    </motion.div>
  );
};
