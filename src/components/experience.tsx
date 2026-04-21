"use client";

import { experiences } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";
import { Title } from "./title";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

export const Experience = () => {
  const t = useTranslations("workExperience");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const renderedExperiences = experiences.map((experience) => (
    <ExperienceItem experience={experience} key={experience.company} />
  ));

  return (
    <section>
      <motion.div
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Title>{t("title")}</Title>
      </motion.div>

      <motion.div
        className="flex flex-col gap-y-6 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {renderedExperiences}
      </motion.div>
    </section>
  );
};
