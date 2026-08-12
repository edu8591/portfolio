import { AboutMe } from "./about-me";
import { ContactForm } from "./contact-form";
import { Experience } from "./experience";
import { Projects } from "./projects";
import { Technologies } from "./technologies";

export const InfoSection = () => {
  return (
    <div className="space-y-16 lg:space-y-20">
      <AboutMe />
      <Experience />
      <Technologies />
      <Projects />
      <ContactForm />
      <div className="h-8"></div>
    </div>
  );
};
