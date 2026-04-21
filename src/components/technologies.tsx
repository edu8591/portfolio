"use client";
import { TooltipWrapper } from "./tooltip-wrapper";
import { GrayscaleImage } from "./grayscale-image";
import { Title } from "./title";
import { motion } from "motion/react";
import { AnimateEntryIcon } from "./animate-entry-icon";
import { useTranslations } from "next-intl";
import { technologiesList } from "@/constants/technologies";

export const Technologies = () => {
  const t = useTranslations("technologies");

  const titleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="mb-16">
      <motion.div
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Title>{t("title")}</Title>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-8 lg:grid-cols-5 lg:gap-8 place-items-center"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
          hidden: {},
        }}
        viewport={{ once: true, amount: 0.5 }}
        whileInView="visible"
        initial="hidden"
      >
        {technologiesList.map(({ icon, description }) => {
          return (
            <AnimateEntryIcon key={icon + description}>
              <TooltipWrapper description={description}>
                <GrayscaleImage icon={icon} height={60} width={60} />
              </TooltipWrapper>
            </AnimateEntryIcon>
          );
        })}
      </motion.div>
    </section>
  );
};
