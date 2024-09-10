import { experiences } from "@/constants/experiences";
import { ExperienceItem } from "./experience-item";

export const Experience = () => {
  const renderedExperiences = experiences.map((experience) => (
    <ExperienceItem experience={experience} key={experience.company} />
  ));

  return (
    <section className="mb-16 ">
      <h3 className="mb-3 text-2xl font-semibold">Work Experience</h3>

      <div className="flex flex-col gap-y-6">{renderedExperiences}</div>
    </section>
  );
};
