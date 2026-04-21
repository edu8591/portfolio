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
      <div className="flex flex-col justify-between gap-y-4 lg:grid lg:grid-cols-4 lg:items-start">
        <div className="col-span-3 flex flex-col">
          <h4 className="text-xl font-serif font-semibold text-foreground">{experience.company}</h4>
          <p className="text-accent font-medium text-sm mt-1 tracking-wide uppercase">{t("role")}</p>
        </div>
        <p className="text-muted-foreground text-sm font-medium lg:text-right">{t("period")}</p>
      </div>

      <Separator className="my-4 bg-gradient-to-r from-accent/40 to-transparent" />

      <div className="space-y-3">
        <p className="leading-6 text-foreground/85 text-sm md:text-base">{t("description")}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {experience.skills.map((skill) => {
            return (
              <Badge
                variant="luxury"
                key={`${experience.company}${skill}`}
              >
                {skill}
              </Badge>
            );
          })}
        </div>
      </div>
    </MotionCard>
  );
};
