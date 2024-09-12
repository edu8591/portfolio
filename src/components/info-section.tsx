import { AboutMe } from "./about-me";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Technologies } from "./technologies";

export const InfoSection = () => {
  return (
    <div className="md:h-[calc(100vh-20px)] md:overflow-y-scroll px-4 gap-y-6 pt-5">
      <AboutMe />
      <Experience />
      <Technologies />
      <Projects />
    </div>
  );
};
