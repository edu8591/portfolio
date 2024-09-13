import { experiences } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";
import { Title } from "./title";
import { useTranslations } from "next-intl";

export const Experience = () => {
  const t = useTranslations("workExperience");

  const renderedExperiences = experiences.map((experience) => (
    <ExperienceItem experience={experience} key={experience.company} />
  ));

  return (
    <section className="mb-16">
      <Title>{t("title")}</Title>

      <div className="flex flex-col gap-y-6 overflow-hidden p-2">
        {renderedExperiences}
      </div>
    </section>
  );
};
