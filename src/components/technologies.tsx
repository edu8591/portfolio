import Image from "next/image";
import { NextSvg } from "./next-svg";
import { TooltipWrapper } from "./tooltip-wrapper";

export const Technologies = () => {
  return (
    <div className="flex justify-between w-full px-8">
      <TooltipWrapper description="Next.js">
        <NextSvg height={50} width={50} className="fill-white" />
      </TooltipWrapper>
      <TooltipWrapper description="React.js">
        <Image
          src="/icons/react.svg"
          alt="Reactjs icon"
          width={50}
          height={50}
          className="animate-spin-slow"
        />
      </TooltipWrapper>
      <TooltipWrapper description="Nest.js">
        <Image
          src="/icons/nestjs.svg"
          alt="Nestjs icon"
          width={50}
          height={50}
        />
      </TooltipWrapper>
      <TooltipWrapper description="Ruby on Rails">
        <Image
          src="/icons/rails.svg"
          alt="Ruby on Rails icon"
          width={50}
          height={50}
        />
      </TooltipWrapper>
      <TooltipWrapper description="Git">
        <Image src="/icons/git.svg" alt="Git icon" width={60} height={60} />
      </TooltipWrapper>
    </div>
  );
};
