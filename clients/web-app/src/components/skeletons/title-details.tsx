import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

type Props = {
  withDetails?: boolean;
  goBack?: boolean;
};

export const TitleDetailsSkeleton = ({ goBack, withDetails }: Props) => {
  return (
    <div className="w-full h-[76vh] relative flex flex-col items-center justify-center">
      <div className="w-full max-w-screen-2xl mx-auto z-20 p-8 cursor-default">
        <header className="w-full max-w-2xl">
          <div className="space-y-2">
            {goBack && <Skeleton style={{ width: 80, height: 20 }} />}

            <Skeleton style={{ width: 322, height: 78 }} />
          </div>
          {withDetails && (
            <div className="mt-4 mb-4 flex gap-3 items-center">
              <Skeleton style={{ width: 136, height: 24 }} />

              <Skeleton style={{ width: 80, height: 24 }} />
            </div>
          )}
          <div className={cn("mt-2 flex flex-col gap-2 max-w-xl")}>
            <div className="flex items-center gap-2">
              <Skeleton style={{ width: 100, height: 24 }} />
              <Skeleton style={{ width: 78, height: 24 }} />
              <Skeleton style={{ width: 44, height: 24 }} />
              <Skeleton style={{ width: 46, height: 24 }} />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton style={{ width: 29, height: 29 }} />

              <Skeleton style={{ width: 200, height: 24 }} />
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
              style={{ width: 180, height: 56 }}
            />

            <Skeleton
              className="rounded-2xl"
              style={{ width: 56, height: 56 }}
            />
          </div>
        </header>
      </div>

      <figure className="w-full h-full absolute z-10 select-none overflow-hidden">
        <div
          className="absolute aspect-video right-0 top-0 w-full max-w-screen-xl"
          style={{
            background:
              "linear-gradient(0deg,rgba(25, 25, 30, 1) 0%, rgba(25, 25, 30, 0.78) 36%, rgba(255, 255, 255, 0) 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{
            background:
              "linear-gradient(79deg, #19191e 0%, #19191e 37%, rgba(25, 25, 30, 33%) 68%, rgba(25, 25, 30, 0%) 100%)",
          }}
        />
      </figure>
    </div>
  );
};
