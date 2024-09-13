import { projects } from "@/constants/projects";
import { Title } from "./title";
import Image from "next/image";
import { MotionCard } from "./motion-card";
import Link from "next/link";

export const Projects = () => {
  const renderedProjects = projects.map((project) => {
    return (
      <MotionCard key={project.name}>
        <Link href={project.url} target="_blank">
          <div className="lg:flex p-4">
            <div className="relative w-full aspect-video lg:h-28 lg:w-48 border-2 rounded-md overflow-hidden flex-shrink-0">
              <Image src={project.src} fill alt={`${project.name} preview`} />
            </div>
            <div className="pl-2 mt-3 lg:mt-0">
              <h3 className="text-lg font-bold pb-2">{project.name}</h3>
              <p>{project.description}</p>
            </div>
          </div>
        </Link>
      </MotionCard>
    );
  });

  return (
    <section className="mb-16">
      <Title>Projects</Title>
      <div className="flex flex-col gap-y-6 overflow-hidden p-2">
        {renderedProjects}
      </div>
    </section>
  );
};
