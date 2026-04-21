import Link from "next/link";
import Image from "next/image";
import * as motion from "motion/react-client";
import { type Variants } from "motion";
import { getTranslations } from "next-intl/server";
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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

export const IntroSection = async () => {
  const t = await getTranslations("introSection");

  return (
    <motion.div
      className="flex flex-col gap-y-8 items-center lg:items-start"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="lg:text-left text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
          {t("name")}
        </h1>
        <div className="h-1.5 w-20 bg-gradient-to-r from-accent to-accent/50 mt-4 lg:mx-0 mx-auto"></div>
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-base sm:text-lg font-medium text-accent tracking-widest uppercase"
      >
        {t("title")}
      </motion.h2>

      <motion.div variants={itemVariants} className="w-full">
        <p className="text-sm sm:text-base leading-relaxed text-foreground/75 lg:text-left text-center">
          {t("description")}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex gap-x-6 lg:gap-x-8 pt-8 lg:pt-0"
      >
        <motion.div
          whileHover={{ scale: 1.15, y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link
            href="https://github.com/edu8591"
            className="block hover:cursor-pointer relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 transition-all duration-300"
            target="_blank"
          >
            <Image
              src="/icons/github.svg"
              fill
              alt="github icon"
              className="hover:drop-shadow-lg"
            />
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.15, y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link
            href="https://www.linkedin.com/in/edo-desu/"
            className="block hover:cursor-pointer relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 transition-all duration-300"
            target="_blank"
          >
            <Image
              src="/icons/linkedin.svg"
              fill
              alt="linkedin icon"
              className="hover:drop-shadow-lg"
            />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
