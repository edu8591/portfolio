import { AboutMe } from "./about-me";

export const InfoSection = () => {
  return (
    <div className="md:h-[calc(100vh-20px)] md:overflow-y-scroll px-4 gap-y-6 pt-5">
      <AboutMe />

      <h3>Work Experience</h3>

      <h3>Projects</h3>
    </div>
  );
};
