import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { Skeleton } from "../ui/skeleton";

export const EpisodeSkeleton = () => {
  return (
    <Fragment>
      <div
        className={cn(
          "group bg-app-secondary p-4 rounded-lg flex gap-6 justify-between border-2 border-transparent transition-all hover:border-white/10",
          "cursor-pointer"
        )}
      >
        <div className="flex gap-6 items-center w-full">
          <figure
            className="relative rounded-xl overflow-hidden"
            style={{ minWidth: 320, minHeight: 180 }}
          >
            <Skeleton
              className="bg-app-secondary-hover"
              style={{ width: 320, height: 180 }}
            />
          </figure>

          <header className="flex flex-col justify-center w-full h-full max-w-2xl">
            <div className="flex gap-4 items-center">
              <Skeleton
                className="bg-app-secondary-hover"
                style={{ width: 62, height: 20 }}
              />
              <Skeleton
                className="bg-app-secondary-hover"
                style={{ width: 80, height: 16 }}
              />
            </div>
            <Skeleton
              className="mt-2 bg-app-secondary-hover"
              style={{ width: 222, height: 28 }}
            />

            <div className="mt-1 flex flex-col gap-1 w-full">
              <Skeleton
                className="bg-app-secondary-hover"
                style={{ width: "100%", height: 24 }}
              />
              <Skeleton
                className="bg-app-secondary-hover"
                style={{ width: "100%", height: 24 }}
              />
              <Skeleton
                className="bg-app-secondary-hover"
                style={{ width: "100%", height: 24 }}
              />
            </div>

            <Skeleton
              className="mt-4 bg-app-secondary-hover"
              style={{ width: 170, height: 20 }}
            />
          </header>
        </div>
      </div>
    </Fragment>
  );
};
