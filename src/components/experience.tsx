import { companies } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import { AnimatedTitle } from "./animated-title";

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

  const renderedExperiences = companies.map((company) => (
    <ExperienceItem company={company} key={company} />
  ));

  return (
    <section>
      <AnimatedTitle title={t("title")} />

      <motion.div
        className="flex flex-col gap-y-6 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: "some" }}
      >
        {renderedExperiences}
      </motion.div>
    </section>
  );
};
