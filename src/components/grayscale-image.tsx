import { cn } from "@/lib/utils";
import { Icon } from "@/types/icon";
import Image from "next/image";

type GrayscaleImageProps = {
  icon: Icon;
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
        "lg:grayscale hover:grayscale-0 hover:scale-125 transition duration-400 ease-in-out",
        className ?? className
      )}
    />
  );
};
