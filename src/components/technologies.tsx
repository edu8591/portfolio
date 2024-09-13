"use client";
// import Image from "next/image";
// import { NextSvg } from "./svg/next-svg";
import { TooltipWrapper } from "./tooltip-wrapper";
import { GrayscaleImage } from "./grayscale-image";
import { Title } from "./title";
import { motion } from "framer-motion";
import { AnimateEntryIcon } from "./animate-entry-icon";
export const Technologies = () => {
  return (
    <section className="mb-16">
      <Title>Technologies</Title>

      <motion.div
        className="grid grid-cols-3 gap-x-12 gap-y-4 md:grid-cols-4 md:gap-x-8 lg:grid-cols-5  lg:gap-6 place-items-center border"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } },
          hidden: {},
        }}
        viewport={{ once: true, amount: 0.5 }}
        whileInView="visible"
        initial="hidden"
      >
        <AnimateEntryIcon>
          <TooltipWrapper description="HTML5">
            <GrayscaleImage icon="html" height={60} width={60} />
          </TooltipWrapper>
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Css">
            <GrayscaleImage icon="css" height={60} width={60} />
          </TooltipWrapper>
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="React.js">
            <GrayscaleImage icon="react" height={60} width={60} />
          </TooltipWrapper>
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Next.js">
            <GrayscaleImage icon="nextjs" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Nest.js">
            <GrayscaleImage icon="nestjs" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Node.js">
            <GrayscaleImage icon="node" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Typescript">
            <GrayscaleImage icon="typescript" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Ruby">
            <GrayscaleImage icon="ruby" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Rails">
            <GrayscaleImage icon="rails" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Tailwind">
            <GrayscaleImage icon="tailwind" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Bootstrap">
            <GrayscaleImage icon="bootstrap" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Git">
            <GrayscaleImage icon="git" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Github">
            <GrayscaleImage icon="github" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="PostgreSQL">
            <GrayscaleImage icon="psql" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
        <AnimateEntryIcon>
          <TooltipWrapper description="Linux">
            <GrayscaleImage icon="linux" height={60} width={60} />
          </TooltipWrapper>{" "}
        </AnimateEntryIcon>
      </motion.div>
    </section>
  );
};
