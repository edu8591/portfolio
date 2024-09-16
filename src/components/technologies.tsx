"use client";
// import Image from "next/image";
// import { NextSvg } from "./svg/next-svg";
import { TooltipWrapper } from "./tooltip-wrapper";
import { GrayscaleImage } from "./grayscale-image";
import { Title } from "./title";
import { motion } from "framer-motion";
import { AnimateEntryIcon } from "./animate-entry-icon";
import { useTranslations } from "next-intl";
import { technologiesList } from "@/constants/technologies";

export const Technologies = () => {
  const t = useTranslations("technologies");

  return (
    <section className="mb-16 md:mb-32" id="technologies">
      <Title>{t("title")}</Title>

      <motion.div
        className="grid grid-cols-3 gap-x-12 gap-y-4  md:gap-x-8 lg:grid-cols-5 lg:gap-6 place-items-center"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } },
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
