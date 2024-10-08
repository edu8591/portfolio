// import Image from "next/image";
// import { Technologies } from "./technologies";
import { Separator } from "./ui";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { NavLinks } from "./nav-links";

export const IntroSection = () => {
  const t = useTranslations("introSection");

  return (
    <div className="h-full md:sticky flex flex-col gap-y-5 items-center md:col-span-2 pt-20">
      {/* <Image
        src="/images/profile.jpg"
        alt="Profile image"
        width={200}
        height={200}
      /> */}
      <h1 className=" text-4xl md:text-5xl font-bold sm:text-center md:mt-10 tracking-wide">
        {t("name")}
      </h1>
      <h2 className="text-xl font-semibold">{t("title")}</h2>

      <Separator className="my-4 w-3/4" />
      <p className="w-3/4">{t("description")}</p>

      <NavLinks />
      {/* Links */}
      <div className="md:mt-auto pb-5 md:pb-14 flex gap-x-8  md:pt-0">
        <Link
          href="https://github.com/edu8591"
          className="hover:cursor-pointer relative w-10 h-10 md:w-14 md:h-14"
          target="_blank"
        >
          <Image src="/icons/github.svg" fill alt="github icon" />
        </Link>
        <Link
          href="https://www.linkedin.com/in/edo-desu/"
          className="hover:cursor-pointer relative w-10 h-10 md:w-14 md:h-14"
          target="_blank"
        >
          <div>
            <Image src="/icons/linkedin.svg" fill alt="linkedin icon" />
          </div>
        </Link>
      </div>
    </div>
  );
};
