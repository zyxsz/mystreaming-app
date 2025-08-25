import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export const FeaturedTitleSkeleton = () => {
  // const currentProgress = await StreamingApi.progress.findProgress(title.id);

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden max-xl:justify-start max-md:justify-end">
      <div className="w-full max-w-[1600px] aspect-video mx-auto z-20 p-8 cursor-default flex items-center justify-start max-md:pb-64">
        <header className="w-full max-w-2xl">
          <div className="mb-2">
            <Skeleton style={{ width: 500, height: 78 }} />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton style={{ width: 300, height: 24 }} />
          </div>

          <div className={cn("mt-2 flex flex-col gap-2 max-w-xl")}>
            <div className="flex items-center gap-2">
              <Skeleton style={{ width: 50, height: 24 }} />
              <Skeleton style={{ width: 80, height: 24 }} />
              <Skeleton style={{ width: 30, height: 24 }} />
              <Skeleton style={{ width: 120, height: 24 }} />
            </div>

            <div className="flex flex-col gap-1">
              <Skeleton style={{ width: "100%", height: 20 }} />
              <Skeleton style={{ width: "100%", height: 20 }} />
              <Skeleton style={{ width: 550, height: 20 }} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 select-none">
            <Skeleton
              className="rounded-2xl"
              style={{ width: 180, height: 58 }}
            />

            <Skeleton
              className="rounded-2xl"
              style={{ width: 58, height: 58 }}
            />
          </div>

          <div className="mt-6 select-none">
            <Skeleton style={{ width: 220, height: 20 }} />
          </div>
        </header>
      </div>
    </div>
  );
};
