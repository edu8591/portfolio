"use client";

import { motion } from "framer-motion";
import { Title } from "./title";
import { useTranslations } from "next-intl";

export const AboutMe = () => {
  const t = useTranslations("aboutMeSection");

  return (
    <motion.section
      id="about-me"
      className="mb-16 md:mb-32"
      variants={{
        initial: { opacity: 0 },
        onView: { opacity: 1 },
      }}
      initial="initial"
      whileInView={"onView"}
      transition={{ duration: 0.6, ease: "easeIn" }}
      viewport={{ once: true }}
    >
      <Title>{t("title")}</Title>

      <div className="flex flex-col gap-y-5">
        <p>{t("parragraphFirst")}</p>
        <p>{t("parragraphSecond")}</p>
        <p>{t("parragraphThird")}</p>
      </div>
    </motion.section>
  );
};
