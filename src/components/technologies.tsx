// import Image from "next/image";
// import { NextSvg } from "./svg/next-svg";
import { TooltipWrapper } from "./tooltip-wrapper";
import { GrayscaleImage } from "./grayscale-image";

export const Technologies = () => {
  return (
    <section className="mb-16">
      <h3 className="mb-3 text-2xl font-semibold">Technologies</h3>

      <div className="grid grid-cols-3 gap-x-12 gap-y-4 md:grid-cols-4 md:gap-x-8 lg:grid-cols-5  lg:gap-6">
        <TooltipWrapper description="HTML5">
          <GrayscaleImage icon="html" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Css">
          <GrayscaleImage icon="css" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="React.js">
          <GrayscaleImage
            icon="react"
            height={60}
            width={60}
            // className="hover:animate-spin"
          />
        </TooltipWrapper>

        <TooltipWrapper description="Next.js">
          <GrayscaleImage icon="nextjs" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Nest.js">
          <GrayscaleImage icon="nestjs" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Node.js">
          <GrayscaleImage icon="node" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Typescript">
          <GrayscaleImage icon="typescript" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Ruby">
          <GrayscaleImage icon="ruby" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Rails">
          <GrayscaleImage icon="rails" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Tailwind">
          <GrayscaleImage icon="tailwind" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Bootstrap">
          <GrayscaleImage icon="bootstrap" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Git">
          <GrayscaleImage icon="git" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Github">
          <GrayscaleImage icon="github" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="PostgreSQL">
          <GrayscaleImage icon="psql" height={60} width={60} />
        </TooltipWrapper>

        <TooltipWrapper description="Linux">
          <GrayscaleImage icon="linux" height={60} width={60} />
        </TooltipWrapper>
      </div>
    </section>
  );
};
