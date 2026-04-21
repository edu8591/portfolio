import { companies } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";
import { Title } from "./title";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";

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

  const renderedExperiences = companies.map((company) => (
    <ExperienceItem company={company} key={company} />
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
