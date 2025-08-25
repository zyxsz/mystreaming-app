import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type { ReactNode } from "react";

export const Tag = ({
  children,
  isLink,
  className,
  asChild,
  ...rest
}: {
  children: ReactNode;
  isLink?: boolean;
  className?: string;
  asChild?: boolean;
} & React.ComponentProps<"button">) => {
  const Element = asChild ? Slot : "button";

  return (
    <Element
      className={cn(
        "flex items-center gap-2 bg-app-primary-foreground p-1 px-2 rounded-md text-xs uppercase text-black font-bold transition-all select-none [&_svg]:size-4 focus:outline-none focus:border-none text-nowrap",
        isLink && "cursor-pointer hover:bg-app-primary-foreground-hover",
        className
      )}
      {...rest}
    >
      {children}
    </Element>
  );
};
