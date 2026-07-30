"use client";

/**
 * The pre-#51 contact form, kept only so its styling can be compared against
 * `contact-form.tsx` side by side. It is out of the barrel and rendered
 * nowhere, and it still posts to `/api/contact` — a route that does not exist.
 * Delete this file once the comparison is done (a separate change).
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "motion/react";
import { MotionCard } from "./motion-card";
import { Title } from "./title";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const ContactLegacy = () => {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="space-y-8"
    >
      <Title>{t("title")}</Title>

      <motion.p
        variants={itemVariants}
        className="text-sm sm:text-base leading-relaxed text-foreground/75"
      >
        {t("description")}
      </motion.p>

      <motion.div variants={itemVariants}>
        <MotionCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("nameLabel")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("namePlaceholder")}
                  required
                  className="w-full px-4 py-2 rounded-md border border-border/50 bg-background/50 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent focus:bg-background transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("emailLabel")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("emailPlaceholder")}
                  required
                  className="w-full px-4 py-2 rounded-md border border-border/50 bg-background/50 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent focus:bg-background transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-foreground"
              >
                {t("messageLabel")}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t("messagePlaceholder")}
                required
                rows={5}
                className="w-full px-4 py-2 rounded-md border border-border/50 bg-background/50 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-background transition-all duration-300 resize-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-2.5 bg-accent text-accent-foreground font-medium rounded-md hover:bg-accent/90 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {status === "loading" ? "Sending..." : t("submitButton")}
              </button>

              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm text-green-600 dark:text-green-400"
                >
                  ✓ {t("successMessage")}
                </motion.p>
              )}

              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  ✗ {t("errorMessage")}
                </motion.p>
              )}
            </div>
          </form>
        </MotionCard>
      </motion.div>
    </motion.div>
  );
};
