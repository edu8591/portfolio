import Image from "next/image";
// import { Technologies } from "./technologies";
import { Github, LinkedinIcon } from "lucide-react";
import { Separator } from "./ui";
import Link from "next/link";

export const IntroSection = () => {
  return (
    <div className="h-full md:sticky flex flex-col gap-y-5 items-center">
      <Image
        src="/images/profile.jpg"
        alt="Profile image"
        width={200}
        height={200}
      />
      <h1 className=" text-4xl md:text-5xl font-bold sm:text-center">
        Eduardo Serrano
      </h1>
      <h2 className="text-xl font-semibold">Full Stack Web Developer</h2>
      <Separator className="my-4 w-3/4" />
      <p className="w-3/4">
        Building responsive full-stack REST web applications and performant
        backend APIs.
      </p>
      {/* <Technologies /> */}
      <div className="mt-auto pb-14 flex gap-x-4 pt-5 md:pt-0">
        <Link
          href="https://github.com/edu8591"
          className="hover:cursor-pointer"
          target="_blank"
        >
          <Github size={24} />
        </Link>
        <Link
          href="https://www.linkedin.com/in/edo-desu/"
          className="hover:cursor-pointer"
          target="_blank"
        >
          <LinkedinIcon size={24} />
        </Link>
      </div>
    </div>
  );
};
