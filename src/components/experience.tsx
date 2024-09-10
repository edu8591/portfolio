import { experiences } from "@/constants/experiences";
import { Badge, Card, CardHeader, CardTitle, Separator } from "./ui";
import { ExperienceItem } from "./experience-item";

export const Experience = () => {
  const renderedExperiences = experiences.map((experience) => (
    <ExperienceItem experience={experience} key={experience.company} />
  ));

  return (
    <section className="mb-16 flex flex-col gap-y-6">
      {renderedExperiences}
      {/* <Card className="px-5 py-2 lg:px-2 hover:scale-102 shadow-md hover:shadow-lg transition-transform duration-150 border-0">
        <div className="flex flex-row-reverse justify-between items-center lg:grid lg:grid-cols-4 lg:items-start">
          <p className="text-muted-foreground text-sm md:pt-1">
            2023 — Present
          </p>
          <div className="col-span-3 flex flex-col mt-0">
            <h4 className="text-lg font-semibold">Orbis Corp S.A.</h4>
            <p className="text-muted-foreground text-sm">
              Full Stack Web Developer
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4">
          <div className="col-start-2 col-span-3">
            <Separator className="my-2" />
            <p className="leading-5">
              Build and maintain current project, refactor reactjs and nextjs
              application implementing redix to maintain state and fix prop
              drilling reorganizing components for better readability migrate
              PHP backend into Nestjs implementing JWT for a more
              secureauthentication system. Led the developing and planning of a
              secure election solution system for a foreign country, designed
              database, data structure, implemented API with Ruby on Rails and
              frontend with Nextjs.
            </p>
            <div className="flex my-3">
              <Badge variant="secondary">React.js</Badge>
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="secondary">Nest.js</Badge>
              <Badge variant="secondary">Ruby on Rails</Badge>
            </div>
          </div>
        </div>
      </Card> */}
    </section>
  );
};
