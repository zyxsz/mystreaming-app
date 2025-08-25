import { Skeleton } from "../ui/skeleton";

export const CollectionSkeleton = () => {
  return (
    <div className="w-full max-w-[1740px] px-8 mx-auto z-10">
      <header className="ml-2 mb-2 flex items-center gap-4">
        <Skeleton style={{ width: 65, height: 24 }} />
        <Skeleton style={{ width: 88, height: 20 }} />
      </header>
      <div className="w-full embla overflow-x-visible relative" tabIndex={1}>
        <div
          className="w-full embla__container flex gap-4"
          style={{ "--cols": 5, "--gap": "1rem" } as any}
        >
          <Skeleton
            className="embla__slide  min-w-0 aspect-video shadow-2xl rounded-2xl"
            style={{
              flexGrow: 1,
              flexBasis:
                "calc(100% / var(--cols) - var(--gap) / var(--cols) * (var(--cols) - 1))",
            }}
          />
          <Skeleton
            className="embla__slide  min-w-0 aspect-video shadow-2xl rounded-2xl"
            style={{
              flexGrow: 1,
              flexBasis:
                "calc(100% / var(--cols) - var(--gap) / var(--cols) * (var(--cols) - 1))",
            }}
          />
          <Skeleton
            className="embla__slide  min-w-0 aspect-video shadow-2xl rounded-2xl"
            style={{
              flexGrow: 1,
              flexBasis:
                "calc(100% / var(--cols) - var(--gap) / var(--cols) * (var(--cols) - 1))",
            }}
          />
          <Skeleton
            className="embla__slide  min-w-0 aspect-video shadow-2xl rounded-2xl"
            style={{
              flexGrow: 1,
              flexBasis:
                "calc(100% / var(--cols) - var(--gap) / var(--cols) * (var(--cols) - 1))",
            }}
          />
          <Skeleton
            className="embla__slide  min-w-0 aspect-video shadow-2xl rounded-2xl"
            style={{
              flexGrow: 1,
              flexBasis:
                "calc(100% / var(--cols) - var(--gap) / var(--cols) * (var(--cols) - 1))",
            }}
          />
        </div>
      </div>
    </div>
  );
};
