import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const PlayerButton = ({
  children,
  className,
  fill,
  isHovered,
  ...rest
}: React.ComponentProps<"button"> & {
  children: ReactNode;
  fill?: boolean;
  isHovered?: boolean;
}) => {
  return (
    <button
      className={cn([
        "first:pl-0 p-4 text-app-primary-foreground hover:[&_svg]:scale-125 hover:text-white [&_svg]:transition-all [&_svg]:size-8 outline-none transition-all cursor-pointer",
        fill && "[&_svg]:fill-app-primary-foreground hover:[&_svg]:fill-white",
        isHovered && "text-white [&_svg]:scale-125",
        isHovered && fill && "[&_svg]:fill-white",
        className,
      ])}
      {...rest}
    >
      {children}
    </button>
  );
};
