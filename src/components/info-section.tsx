import { AboutMe } from "./about-me";
import { Experience } from "./experience";
import { Technologies } from "./technologies";

export const InfoSection = () => {
  return (
    <div className="md:h-[calc(100vh-20px)] md:overflow-y-scroll overflow-x-hidden px-4 gap-y-6 pt-5">
      <AboutMe />
      <Experience />
      <Technologies />
      <h3>Projects</h3>
    </div>
  );
};
