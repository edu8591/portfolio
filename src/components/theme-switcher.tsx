"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

export const ThemeSwitcher = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeOrder: Array<"light" | "dark" | "system"> = [
    "light",
    "dark",
    "system",
  ];

  const handleClick = () => {
    const current = theme as "light" | "dark" | "system" | undefined;
    const currentIndex = themeOrder.indexOf(current || "system");
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getIcon = (themeCode?: string) => {
    if (themeCode === "system") return "💻";
    const t = themeCode === "system" ? systemTheme : themeCode;
    switch (t) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      default:
        return "💻";
    }
  };

  const displayIcon = mounted ? getIcon(theme) : "☀️";

  return (
    <motion.button
      onClick={handleClick}
      className="px-4 py-2 rounded-md border border-border/50 bg-card/50 text-foreground hover:bg-card/80 transition-all duration-300 flex items-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      suppressHydrationWarning
    >
      <span>{displayIcon}</span>
    </motion.button>
  );
};
