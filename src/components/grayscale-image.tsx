import { cn } from "@/lib/utils";
import Image from "next/image";

type GrayscaleImageProps = {
  icon:
    | "bootstrap"
    | "css"
    | "git"
    | "github"
    | "html"
    | "nestjs"
    | "nextjs"
    | "node"
    | "psql"
    | "rails"
    | "ruby"
    | "react"
    | "tailwind"
    | "typescript"
    | "linux";
  height: number;
  width: number;
  className?: string;
};

export const GrayscaleImage = ({
  icon,
  height,
  width,
  className,
}: GrayscaleImageProps) => {
  return (
    <Image
      src={`/icons/${icon}.svg`}
      height={height}
      width={width}
      alt={`${icon} logo`}
      className={cn(
        "md:grayscale hover:grayscale-0 transition duration-400 ease-in-out",
        className ?? className
      )}
    />
  );
};
