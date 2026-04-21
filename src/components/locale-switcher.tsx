"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";

export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const locales: Array<{ code: "en" | "es" | "jp"; label: string }> = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "jp", label: "日本語" },
  ];

  const handleLocaleChange = (locale: "en" | "es" | "jp") => {
    router.push(pathname, { locale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-md border border-border/50 bg-card/50 font-medium text-foreground hover:bg-card/80 transition-all duration-300 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>🌐</span>
        <span>Language</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 mt-2 w-40 rounded-md border border-border/50 bg-card shadow-lg overflow-hidden"
          >
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-accent/10 transition-colors duration-200 flex items-center gap-2"
              >
                <span>
                  {locale.code === "en"
                    ? "🇬🇧"
                    : locale.code === "es"
                      ? "🇪🇸"
                      : "🇯🇵"}
                </span>
                <span>{locale.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
