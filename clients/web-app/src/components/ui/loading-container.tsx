import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { Spinner } from "./spinner";

interface Props extends ComponentProps<"div"> {}

export const LoadingContainer = ({ className, ...rest }: Props) => {
  return (
    <div
      className={cn(
        "w-full h-full py-16 flex flex-col items-center justify-center gap-2",
        className
      )}
      {...rest}
    >
      <Spinner className="size-8" />
    </div>
  );
};
