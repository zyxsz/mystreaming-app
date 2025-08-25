import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export const ControlButton = ({
  children,
  fill,
  hover,
  ...rest
}: {
  children: ReactNode;
  fill?: boolean;
  hover?: boolean;
} & ComponentProps<"button">) => {
  return (
    <button
      className={cn(
        "p-4 first:pl-0 last:pr-0 text-app-primary-foreground transition-all hover:text-app-primary-foreground [&_svg]:transition-all [&_svg]:size-10 hover:scale-115",
        fill &&
          "[&_svg]:fill-app-primary-foreground hover:[&_svg]:fill-app-primary-foreground",
        hover && "scale-115 text-app-primary-foreground"
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
