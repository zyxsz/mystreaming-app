import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export const Spinner = ({
  className,
  size,
  ...rest
}: { size?: number } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("spinner border-white size-6", className)}
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
      {...rest}
    />
  );
};
