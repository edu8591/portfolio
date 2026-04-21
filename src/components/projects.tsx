"use client";

import { projects } from "@/constants/projects";
import { Title } from "./title";
import Image from "next/image";
import { MotionCard } from "./motion-card";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export const Projects = () => {
  const t = useTranslations("projects");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const renderedProjects = projects.map((project, index) => {
    return (
      <motion.div
        key={project.name}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <MotionCard>
          <Link href={project.url} target="_blank" className="group block">
            <div className="lg:flex lg:gap-6 lg:items-start">
              <div className="relative w-full aspect-video lg:h-40 lg:w-56 border-2 border-accent/30 rounded-lg overflow-hidden flex-shrink-0 group-hover:border-accent transition-colors duration-300">
                <Image
                  src={project.src}
                  fill
                  alt={`${project.name} preview`}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="mt-4 lg:mt-0 lg:flex-1">
                <h3 className="text-2xl font-serif font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                  {project.name}
                </h3>
                <p className="text-foreground/75 mt-2 leading-relaxed text-sm md:text-base">
                  {t(`${project.name}.description`)}
                </p>
                <div className="mt-4 inline-flex items-center text-accent font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                  View Project
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </MotionCard>
      </motion.div>
    );
  });

  return (
    <section className="mb-16 md:mb-32" id="projects">
      <Title>{t("title")}</Title>
      <motion.div
        className="flex flex-col gap-y-6 overflow-hidden p-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {renderedProjects}
      </motion.div>
    </section>
  );
};
