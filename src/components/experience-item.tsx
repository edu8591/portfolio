"use client";

import { Experience } from "@/types/experience";
import { Badge, Separator } from "./ui";
import { MotionCard } from "./motion-card";
import { useTranslations } from "next-intl";
type ExperienceItemProps = {
  experience: Experience;
};

export const ExperienceItem = ({ experience }: ExperienceItemProps) => {
  const t = useTranslations(
    `workExperience.experience.${experience.company.replaceAll(".", "")}`
  );

  return (
    <MotionCard>
      <div className="flex flex-col-reverse justify-between md:items-center lg:grid lg:grid-cols-4 lg:items-start">
        <p className="text-muted-foreground text-sm md:pt-1">{t("period")}</p>
        <div className="col-span-3 flex flex-col mt-0 lg:pl-2">
          <h4 className="text-lg font-semibold">{experience.company}</h4>
          <p className="text-muted-foreground text-sm">{t("role")}</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4">
        <div className="col-start-2 col-span-3 lg:pl-2">
          <Separator className="my-2" />
          <p className="leading-5 py-1">{t("description")}</p>
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
    </MotionCard>
  );
};
