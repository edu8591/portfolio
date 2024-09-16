import { experiences } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";
import { Title } from "./title";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const Experience = () => {
  const t = useTranslations("workExperience");

  const renderedExperiences = useMemo(() => {
    return experiences.map((experience) => {
      return (
        <ExperienceItem experience={experience} key={experience.company} />
      );
    });
  }, []);

  return (
    <section className="mb-16 md:mb-32" id="work-experience">
      <Title>{t("title")}</Title>

      <div className="flex flex-col gap-y-6 overflow-hidden p-2">
        {renderedExperiences}
      </div>
    </section>
  );
};
