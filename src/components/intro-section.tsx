// import Image from "next/image";
// import { Technologies } from "./technologies";
import { Separator } from "./ui";
import Link from "next/link";
import Image from "next/image";

export const IntroSection = () => {
  return (
    <div className="h-full md:sticky flex flex-col gap-y-5 items-center">
      {/* <Image
        src="/images/profile.jpg"
        alt="Profile image"
        width={200}
        height={200}
      /> */}
      <h1 className=" text-4xl md:text-5xl font-bold sm:text-center md:mt-10 tracking-wide">
        Eduardo Serrano
      </h1>
      <h2 className="text-xl font-semibold">Full Stack Web Developer</h2>
      <Separator className="my-4 w-3/4" />
      <p className="w-3/4">
        Building responsive full-stack REST web applications and performant
        backend APIs.
      </p>

      <div className="md:mt-auto pb-5 md:pb-14 flex gap-x-8  md:pt-0">
        <Link
          href="https://github.com/edu8591"
          className="hover:cursor-pointer"
          target="_blank"
        >
          <Image
            src="/icons/github.svg"
            width={50}
            height={50}
            alt="github icon"
            className="w-14 h-14 sm:w-8 sm:h-8"
          />
        </Link>
        <Link
          href="https://www.linkedin.com/in/edo-desu/"
          className="hover:cursor-pointer"
          target="_blank"
        >
          <Image
            src="/icons/linkedin.svg"
            width={50}
            height={50}
            alt="linkedin icon"
            className="w-14 h-14 sm:w-8 sm:h-8"
          />
        </Link>
      </div>
    </div>
  );
};
