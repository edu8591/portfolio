import { TooltipWrapper } from "./tooltip-wrapper";
import { GrayscaleImage } from "./grayscale-image";
import * as motion from "motion/react-client";
import { AnimateEntryIcon } from "./animate-entry-icon";
import { technologiesList } from "@/constants/technologies";
import { getTranslations } from "next-intl/server";
import { AnimatedTitle } from "./animated-title";

export const Technologies = async () => {
  const t = await getTranslations("technologies");

  return (
    <section className="mb-16">
      <AnimatedTitle title={t("title")} />

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
