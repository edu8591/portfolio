import { AboutMe } from "./about-me";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Technologies } from "./technologies";
// import { Contact } from "./contact";

export const InfoSection = () => {
  return (
    <div className="space-y-16 lg:space-y-20">
      <AboutMe />
      <Experience />
      <Technologies />
      <Projects />
      {/* <Contact /> */}
      <div className="h-8"></div>
    </div>
  );
};
