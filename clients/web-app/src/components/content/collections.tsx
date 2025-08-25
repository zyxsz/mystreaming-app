import type { Collection as CollectionType } from "@/api/interfaces/collection";
import { Button } from "../ui/button";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { TitleBanner } from "./banner";
import { TitlePoster } from "./poster";

interface Props {
  collections: CollectionType[];
}

export const ContentCollections = ({ collections }: Props) => {
  return (
    <div className="relative -mt-32 flex flex-col gap-6 z-30">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="w-full max-w-[1740px] px-8 mx-auto z-10"
        >
          <header className="ml-2 mb-2 flex items-center gap-4">
            <h2 className="text-base text-app-primary-foreground">
              {collection.name}
            </h2>
            <Button variant="link" size="link">
              See more <ArrowRightIcon />
            </Button>
          </header>
          <Collection
            collection={collection}
            imageType={collection.imageType}
          />
        </div>
      ))}
    </div>
  );
};

interface CollectionProps {
  collection: CollectionType;
  imageType: "BANNER" | "POSTER";
}

export const Collection = ({ collection, imageType }: CollectionProps) => {
  const [isNextSlideAvailable, setIsNextSlideAvailable] = useState(true);
  const [isPrevSlideAvailable, setIsPrevSlideAvailable] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    watchDrag: false,
  });

  useEffect(() => {
    const handleCheckSlideAvailable = () => {
      if (!emblaApi) return;

      setIsNextSlideAvailable(emblaApi?.canScrollNext());
      setIsPrevSlideAvailable(emblaApi?.canScrollPrev());
    };

    if (emblaApi) {
      handleCheckSlideAvailable();

      emblaApi.on("slidesInView", () => {
        handleCheckSlideAvailable();
      });
    }
  }, [emblaApi]);

  return (
    <div
      className="w-full embla overflow-x-visible relative"
      ref={emblaRef}
      tabIndex={1}
    >
      <div
        className="w-full embla__container flex gap-4"
        style={{ "--cols": 5, "--gap": "1rem" } as any}
      >
        {collection.relations?.titles?.map((title) => (
          <div
            key={`titles-${title.id}`}
            className="embla__slide flex-[0_0_24%] min-w-0"
            style={{
              flexBasis:
                "calc(100% / var(--cols) - var(--gap) / var(--cols) * (var(--cols) - 1))",
            }}
          >
            {imageType === "BANNER" ? (
              <TitleBanner data={title} collectionId={collection.id} />
            ) : (
              <TitlePoster data={title} />
            )}
          </div>
        ))}
      </div>

      {isPrevSlideAvailable && (
        <button
          className="p-3 shadow-md absolute top-1/2 -translate-y-1/2 bg-app-primary rounded-full text-primary-fg hover:text-primary-fgMuted transition-all cursor-pointer"
          style={{ right: "calc(100% + 16px + 8px)" }}
          onClick={() => emblaApi?.scrollPrev()}
        >
          <ChevronLeftIcon className="size-6" />
        </button>
      )}

      {isNextSlideAvailable && (
        <button
          className="p-3 shadow-md absolute top-1/2 -translate-y-1/2 bg-app-primary rounded-full text-primary-fg hover:text-primary-fgMuted transition-all cursor-pointer"
          style={{ left: "calc(100% + 16px + 8px)" }}
          onClick={() => emblaApi?.scrollNext()}
        >
          <ChevronRightIcon className="size-6" />
        </button>
      )}
    </div>
  );
};
