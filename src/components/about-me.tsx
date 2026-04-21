import * as motion from "motion/react-client";
import { getTranslations } from "next-intl/server";
import { AnimatedTitle } from "./animated-title";

export const AboutMe = async () => {
  const t = await getTranslations("aboutMeSection");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.section
      className="mb-16"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <AnimatedTitle title={t("title")} />

      <motion.div
        className="flex flex-col gap-y-6"
        variants={containerVariants}
      >
        <motion.p
          variants={itemVariants}
          className="text-foreground/85 leading-relaxed text-base"
        >
          {t("parragraphFirst")}
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-foreground/85 leading-relaxed text-base"
        >
          {t("parragraphSecond")}
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-foreground/85 leading-relaxed text-base"
        >
          {t("parragraphThird")}
        </motion.p>
      </motion.div>
    </motion.section>
  );
};
