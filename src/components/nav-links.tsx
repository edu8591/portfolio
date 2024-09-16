"use client";

import { sections } from "@/constants/sections";
import { useEffect, useRef, useState } from "react";

export const NavLinks = () => {
  const [activeSection, setActiveSection] = useState("about-me");
  const observerRefs = useRef<{ [key: string]: IntersectionObserver }>({});
  const visibleSections = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const updateActiveSection = () => {
      let maxVisibleSection = { id: "", ratio: 0 };
      Object.entries(visibleSections.current).forEach(([id, ratio]) => {
        if (ratio > maxVisibleSection.ratio) {
          maxVisibleSection = { id, ratio };
        }
      });

      if (maxVisibleSection.id) {
        setActiveSection(maxVisibleSection.id);
      }
    };

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observerRefs.current[id] = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              visibleSections.current[id] = entry.intersectionRatio;
              updateActiveSection();
            });
          },
          { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
        );
        observerRefs.current[id].observe(element);
      }
    });

    const currentObservers = { ...observerRefs.current };

    return () => {
      Object.values(currentObservers).forEach((observer) =>
        observer.disconnect()
      );
    };
  }, []);

  return (
    <nav className="w-3/4 hidden md:block">
      <ul className="list-none">
        {sections.map(({ id, text }) => {
          return (
            <a href={`#${id}`} key={id}>
              <li className="flex items-center group my-3">
                <div
                  className={`border-t-2 group-hover:w-14 h-[0.5px] mr-3 transition-all duration-300 ${
                    activeSection === id ? "w-14" : "w-6"
                  }`}
                />
                <span
                  className={`group-hover:font-bold text-lg ${
                    activeSection === id ? "font-semibold " : "font-light"
                  }`}
                >
                  {text}
                </span>
              </li>
            </a>
          );
        })}
      </ul>
    </nav>
  );
};
