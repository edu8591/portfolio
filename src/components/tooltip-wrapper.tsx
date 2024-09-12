import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui";

type TooltipWrapperProps = {
  children: React.ReactNode;
  description: string;
};

export const TooltipWrapper = ({
  children,
  description,
}: TooltipWrapperProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
