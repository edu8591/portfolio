import { experiences } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";
import { Title } from "./title";

export const Experience = () => {
  const renderedExperiences = experiences.map((experience) => (
    <ExperienceItem experience={experience} key={experience.company} />
  ));

  return (
    <section className="mb-16">
      <Title>Work Experience</Title>

      <div className="flex flex-col gap-y-6">{renderedExperiences}</div>
    </section>
  );
};
