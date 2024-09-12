"use client";

import { motion } from "framer-motion";
import { Title } from "./title";
export const AboutMe = () => {
  return (
    <motion.section
      className="mb-16"
      variants={{
        initial: { opacity: 0 },
        onView: { opacity: 1 },
      }}
      initial="initial"
      whileInView={"onView"}
      transition={{ duration: 0.6, ease: "easeIn" }}
      viewport={{ once: true }}
    >
      <Title>About me</Title>

      <div className="flex flex-col gap-y-5">
        <p>
          In 2020, while working from home during the pandemic, I discovered web
          development through YouTube videos and instantly became captivated.
          What started as curiosity quickly turned into a passion. By 2021, I
          knew I wanted to turn this passion into a career. I enrolled in a
          380-hour bootcamp by , where I immersed myself in the world of web
          development, mastering full-stack app creation with Ruby on Rails and
          finding my true calling in tech.
        </p>
        <p>
          Lately, {"I’ve"} been focused on implementing best practices in my
          workplace, developing tailored solutions with the right technologies
          for each client. {"I’m "}constantly improving existing projects while
          staying committed to learning new tools and methodologies to sharpen
          my skills as a developer.
        </p>

        <p>
          In my free time, I enjoy playing video games, play with my dogs,
          watching crime series on Netflix, and exploring new technologies—right
          now, {"I'm"} diving into game development with Unity. I also love
          scuba diving whenever I get the chance.
        </p>
      </div>
    </motion.section>
  );
};
