import { Experience } from "@/types/experience";
import { Badge, Card, Separator } from "./ui";

type ExperienceItemProps = {
  experience: Experience;
};

export const ExperienceItem = ({ experience }: ExperienceItemProps) => {
  return (
    <Card className="px-5 py-2 lg:px-2 hover:scale-102 shadow-md hover:shadow-lg transition-transform duration-150 ">
      <div className="flex flex-row-reverse justify-between items-center lg:grid lg:grid-cols-4 lg:items-start">
        <p className="text-muted-foreground text-sm md:pt-1">
          {experience.date}
        </p>
        <div className="col-span-3 flex flex-col mt-0 lg:pl-2">
          <h4 className="text-lg font-semibold">{experience.company}</h4>
          <p className="text-muted-foreground text-sm">{experience.role}</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4">
        <div className="col-start-2 col-span-3 lg:pl-2">
          <Separator className="my-2" />
          <p className="leading-5 py-1">{experience.description}</p>
          <div className="flex flex-wrap mt-1 ">
            {experience.skills.map((skill) => {
              return (
                <Badge
                  variant="secondary"
                  key={`${experience.company}${skill}`}
                  className="m-1"
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
