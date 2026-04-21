import { Badge, Separator } from "./ui";
import { MotionCard } from "./motion-card";
import { companies } from "@/constants/experiences";
import { getTranslations } from "next-intl/server";

type ExperienceItemProps = {
  company: (typeof companies)[number];
};
export const ExperienceItem = async ({ company }: ExperienceItemProps) => {
  const t = await getTranslations(`workExperience.experience.${company}`);

  return (
    <MotionCard>
      <div className="flex flex-col justify-between gap-y-4 lg:grid lg:grid-cols-4 lg:items-start">
        <div className="col-span-3 flex flex-col">
          <h4 className="text-xl font-serif font-semibold text-foreground">
            {t("companyName")}
          </h4>
          <p className="text-accent font-medium text-sm mt-1 tracking-wide uppercase">
            {t("role")}
          </p>
        </div>
        <p className="text-muted-foreground text-sm font-medium lg:text-right">
          {t("period")}
        </p>
      </div>

      <Separator className="my-4 bg-gradient-to-r from-accent/40 to-transparent" />

      <div className="space-y-3">
        <p className="leading-6 text-foreground/85 text-sm md:text-base">
          {t("description")}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {t.raw("skills").map((skill: string) => {
            return (
              <Badge variant="luxury" key={`${t("companyName")}${skill}`}>
                {skill}
              </Badge>
            );
          })}
        </div>
      </div>
    </MotionCard>
  );
};
